import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const iotClient = new IoTDataPlaneClient({ 
  region: process.env.AWS_REGION,
  endpoint: process.env.IOT_ENDPOINT
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get analyzers for gateway event:', JSON.stringify(event, null, 2));

    const { 
      gatewayId, 
      includeOffline = 'true',
      includeInactive = 'false',
      publishToIoT = 'false'
    } = event.queryStringParameters || {};

    if (!gatewayId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'gatewayId parameter is required'
        })
      };
    }

    // Get gateway information first
    const gateway = await getGatewayInfo(gatewayId);
    if (!gateway) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Gateway not found'
        })
      };
    }

    // Get analyzers for the gateway
    const analyzers = await getAnalyzersForGateway(
      gatewayId, 
      includeOffline === 'true',
      includeInactive === 'true'
    );

    // Categorize analyzers by status
    const analyzersSummary = categorizeAnalyzers(analyzers);

    const response = {
      gateway: {
        id: gateway.id,
        ps_gateway_id: gateway.ps_gateway_id,
        model: gateway.model,
        serial_number: gateway.serial_number,
        communication_status: gateway.communication_status,
        location: {
          site: gateway.site_location,
          room: gateway.room_location,
          gps: gateway.gps_location
        }
      },
      analyzers: analyzers,
      summary: analyzersSummary,
      total_count: analyzers.length,
      filters: {
        includeOffline: includeOffline === 'true',
        includeInactive: includeInactive === 'true'
      },
      timestamp: new Date().toISOString()
    };

    // Optionally publish to IoT topic
    if (publishToIoT === 'true' && gateway.ps_gateway_id) {
      await publishAnalyzersToIoT(gateway.ps_gateway_id, analyzers);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error getting analyzers for gateway:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to get analyzers for gateway',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function getGatewayInfo(gatewayId: string) {
  try {
    const getCommand = new GetCommand({
      TableName: 'Gateway',
      Key: { id: gatewayId }
    });

    const result = await docClient.send(getCommand);
    return result.Item || null;
  } catch (error) {
    console.error('Error getting gateway info:', error);
    return null;
  }
}

async function getAnalyzersForGateway(gatewayId: string, includeOffline: boolean, includeInactive: boolean) {
  try {
    const queryCommand = new QueryCommand({
      TableName: 'Analyzer',
      IndexName: 'byAnalyzerByGateway',
      KeyConditionExpression: 'gateway_id = :gatewayId',
      ExpressionAttributeValues: {
        ':gatewayId': gatewayId
      }
    });

    const result = await docClient.send(queryCommand);
    let analyzers = result.Items || [];

    // Apply filters
    analyzers = analyzers.filter(analyzer => {
      // Filter by communication status
      if (!includeOffline && (
        analyzer.communication_status === 'Offline' || 
        analyzer.communication_status === 'Not_Detected'
      )) {
        return false;
      }

      // Filter by active status
      if (!includeInactive && analyzer.active_inactive_status === 'Inactive') {
        return false;
      }

      return true;
    });

    // Enrich with additional information
    return analyzers.map(analyzer => ({
      id: analyzer.id,
      ps_analyzer_id: analyzer.ps_analyzer_id,
      device_id: analyzer.device_id,
      serial_number: analyzer.serial_number,
      device_type: analyzer.device_type,
      model: analyzer.model,
      communication_status: analyzer.communication_status,
      active_inactive_status: analyzer.active_inactive_status,
      assigned_unassigned_status: analyzer.assigned_unassigned_status,
      allocated_unallocated_status: analyzer.allocated_unallocated_status,
      firmware_version: analyzer.fw_ver,
      hardware_version: analyzer.hw_ver,
      location: {
        site: analyzer.site_location,
        room: analyzer.room_location,
        circuit: analyzer.circuit,
        gps: analyzer.gps_location
      },
      calibration: analyzer.calibration,
      warranty: analyzer.warranty,
      enable_alarm: analyzer.enable_or_disable_alarm,
      last_updated: analyzer.updatedAt
    }));
  } catch (error) {
    console.error('Error getting analyzers for gateway:', error);
    throw error;
  }
}

function categorizeAnalyzers(analyzers: any[]) {
  const summary = {
    total: analyzers.length,
    by_communication_status: {
      communicating: 0,
      not_detected: 0,
      offline: 0,
      archive: 0
    },
    by_active_status: {
      active: 0,
      inactive: 0
    },
    by_assignment_status: {
      assigned: 0,
      unassigned: 0
    },
    by_allocation_status: {
      allocated: 0,
      unallocated: 0
    }
  };

  analyzers.forEach(analyzer => {
    // Communication status
    const commStatus = analyzer.communication_status?.toLowerCase();
    if (commStatus === 'communicating') summary.by_communication_status.communicating++;
    else if (commStatus === 'not_detected') summary.by_communication_status.not_detected++;
    else if (commStatus === 'offline') summary.by_communication_status.offline++;
    else if (commStatus === 'archive') summary.by_communication_status.archive++;

    // Active status
    const activeStatus = analyzer.active_inactive_status?.toLowerCase();
    if (activeStatus === 'active') summary.by_active_status.active++;
    else if (activeStatus === 'inactive') summary.by_active_status.inactive++;

    // Assignment status
    const assignmentStatus = analyzer.assigned_unassigned_status?.toLowerCase();
    if (assignmentStatus === 'assigned') summary.by_assignment_status.assigned++;
    else if (assignmentStatus === 'unassigned') summary.by_assignment_status.unassigned++;

    // Allocation status
    const allocationStatus = analyzer.allocated_unallocated_status?.toLowerCase();
    if (allocationStatus === 'allocated') summary.by_allocation_status.allocated++;
    else if (allocationStatus === 'unallocated') summary.by_allocation_status.unallocated++;
  });

  return summary;
}

async function publishAnalyzersToIoT(gatewayThingName: string, analyzers: any[]) {
  try {
    const topic = process.env.IOT_TOPIC || `powersight/gateway/${gatewayThingName}/analyzers`;
    
    const message = {
      gateway_id: gatewayThingName,
      analyzers: analyzers,
      analyzer_count: analyzers.length,
      timestamp: new Date().toISOString(),
      message_type: 'analyzers_list'
    };

    const publishCommand = new PublishCommand({
      topic: topic,
      payload: JSON.stringify(message),
      qos: 0
    });

    await iotClient.send(publishCommand);
    console.log(`Published analyzer list to IoT topic: ${topic}`);
  } catch (error) {
    console.error('Error publishing to IoT:', error);
    // Don't throw error as this is optional functionality
  }
}