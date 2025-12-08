import type { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: DynamoDBStreamHandler = async (event) => {
  try {
    console.log('Update gateway communication status event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const deviceId = record.dynamodb?.Keys?.device_id?.S;
        if (!deviceId) continue;

        console.log(`Processing communication status update for gateway: ${deviceId}`);

        // Determine new communication status based on the record
        const newCommunicationStatus = await determineCommunicationStatus(record);
        
        if (newCommunicationStatus) {
          // Find gateway by device ID and update communication status
          await updateGatewayCommunicationStatus(deviceId, newCommunicationStatus);
        }
      }
    }

    // DynamoDBStreamHandler should return void or DynamoDBBatchResponse
    return;

  } catch (error) {
    console.error('Error updating gateway communication status:', error);
    throw error;
  }
};

async function determineCommunicationStatus(record: any): Promise<string | null> {
  try {
    const newImage = record.dynamodb?.NewImage;
    if (!newImage) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    const lastSeenTime = newImage.last_seen?.N ? parseInt(newImage.last_seen.N) : currentTime;
    const timeDifference = currentTime - lastSeenTime;

    // Gateway timeout thresholds (typically longer than analyzers)
    if (timeDifference < 600) { // Less than 10 minutes
      return 'Communicating';
    } else if (timeDifference < 1800) { // Less than 30 minutes  
      return 'Not_Detected';
    } else {
      return 'Offline';
    }
  } catch (error) {
    console.error('Error determining communication status:', error);
    return null;
  }
}

async function updateGatewayCommunicationStatus(deviceId: string, communicationStatus: string) {
  try {
    // Query gateway by ps_gateway_id
    const queryCommand = new QueryCommand({
      TableName: 'Gateway',
      IndexName: 'byGatewayByPSGatewayId',
      KeyConditionExpression: 'ps_gateway_id = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      },
      Limit: 1
    });

    const queryResult = await docClient.send(queryCommand);

    if (queryResult.Items && queryResult.Items.length > 0) {
      const gateway = queryResult.Items[0];
      
      // Update communication status
      const updateCommand = new UpdateCommand({
        TableName: 'Gateway',
        Key: { id: gateway.id },
        UpdateExpression: 'SET communication_status = :status, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':status': communicationStatus,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'UPDATED_NEW'
      });

      await docClient.send(updateCommand);
      console.log(`Updated gateway ${gateway.id} communication status to ${communicationStatus}`);

      // Update connection tracking table
      await updateConnectionTable(deviceId, communicationStatus, 'Gateway');

      // If gateway goes offline, also check and update connected analyzers
      if (communicationStatus === 'Offline' || communicationStatus === 'Not_Detected') {
        await updateConnectedAnalyzers(gateway.id, communicationStatus);
      }
    } else {
      console.log(`No gateway found with device_id: ${deviceId}`);
    }
  } catch (error) {
    console.error(`Error updating gateway communication status for ${deviceId}:`, error);
    throw error;
  }
}

async function updateConnectionTable(deviceId: string, communicationStatus: string, deviceType: string) {
  try {
    const updateConnectionCommand = new UpdateCommand({
      TableName: 'DeviceStatus',
      Key: { device_id: deviceId },
      UpdateExpression: 'SET communication_status = :status, device_type = :deviceType, last_updated = :timestamp',
      ExpressionAttributeValues: {
        ':status': communicationStatus,
        ':deviceType': deviceType,
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    });

    await docClient.send(updateConnectionCommand);
    console.log(`Updated connection status for ${deviceType} ${deviceId}: ${communicationStatus}`);
  } catch (error) {
    console.error(`Error updating connection table for ${deviceId}:`, error);
  }
}

async function updateConnectedAnalyzers(gatewayId: string, gatewayStatus: string) {
  try {
    // Query analyzers connected to this gateway
    const queryAnalyzersCommand = new QueryCommand({
      TableName: 'Analyzer',
      IndexName: 'byAnalyzerByGateway',
      KeyConditionExpression: 'gateway_id = :gatewayId',
      ExpressionAttributeValues: {
        ':gatewayId': gatewayId
      }
    });

    const analyzersResult = await docClient.send(queryAnalyzersCommand);

    if (analyzersResult.Items) {
      for (const analyzer of analyzersResult.Items) {
        // If gateway is offline, mark connected analyzers as Not_Detected
        const analyzerStatus = gatewayStatus === 'Offline' ? 'Not_Detected' : gatewayStatus;
        
        const updateAnalyzerCommand = new UpdateCommand({
          TableName: 'Analyzer',
          Key: { id: analyzer.id },
          UpdateExpression: 'SET communication_status = :status, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':status': analyzerStatus,
            ':updatedAt': new Date().toISOString()
          },
          ReturnValues: 'UPDATED_NEW'
        });

        await docClient.send(updateAnalyzerCommand);
        console.log(`Updated analyzer ${analyzer.id} status to ${analyzerStatus} due to gateway status change`);
      }
    }
  } catch (error) {
    console.error('Error updating connected analyzers:', error);
  }
}