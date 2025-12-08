import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get active device rental event:', JSON.stringify(event, null, 2));

    const { 
      deviceType, 
      customerId, 
      clientId, 
      deviceId,
      limit = '50' 
    } = event.queryStringParameters || {};

    if (!deviceType || !['gateway', 'analyzer'].includes(deviceType.toLowerCase())) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'deviceType parameter is required and must be either "gateway" or "analyzer"'
        })
      };
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const rentals = await getActiveRentals(deviceType, customerId, clientId, deviceId, parseInt(limit), today);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activeRentals: rentals,
        count: rentals.length,
        deviceType,
        asOfDate: today,
        filters: {
          customerId: customerId || null,
          clientId: clientId || null,
          deviceId: deviceId || null
        }
      })
    };

  } catch (error) {
    console.error('Error getting active device rentals:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to get active device rentals',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function getActiveRentals(
  deviceType: string, 
  customerId?: string, 
  clientId?: string,
  deviceId?: string,
  limit: number = 50,
  today: string = new Date().toISOString().split('T')[0]
) {
  try {
    const tableName = deviceType === 'gateway' ? 'GatewayRental' : 'AnalyzerRental';
    
    if (customerId) {
      // Query by customer
      return await getActiveRentalsByCustomer(tableName, customerId, limit, today);
    } else if (clientId) {
      // Query by client
      return await getActiveRentalsByClient(tableName, clientId, limit, today);
    } else if (deviceId) {
      // Query by specific device
      return await getActiveRentalsByDevice(tableName, deviceId, limit, today);
    } else {
      // Scan all active rentals (less efficient but necessary for global view)
      return await getAllActiveRentals(tableName, limit, today);
    }
  } catch (error) {
    console.error('Error in getActiveRentals:', error);
    throw error;
  }
}

async function getActiveRentalsByCustomer(tableName: string, customerId: string, limit: number, today: string) {
  const indexName = tableName === 'GatewayRental' ? 'byGatewayRentalByCustomer' : 'byAnalyzerRentalByCustomer';
  
  const queryCommand = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: 'customer_id = :customerId',
    FilterExpression: '(attribute_not_exists(end_date) OR end_date >= :today) AND (attribute_not_exists(access_end_date) OR access_end_date >= :today)',
    ExpressionAttributeValues: {
      ':customerId': customerId,
      ':today': today
    },
    Limit: limit
  });

  const result = await docClient.send(queryCommand);
  return await enrichRentalsWithDeviceInfo(result.Items || [], tableName);
}

async function getActiveRentalsByClient(tableName: string, clientId: string, limit: number, today: string) {
  const indexName = tableName === 'GatewayRental' ? 'byGatewayRentalByClient' : 'byAnalyzerRentalByClient';
  
  const queryCommand = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: 'client_id = :clientId',
    FilterExpression: '(attribute_not_exists(end_date) OR end_date >= :today) AND (attribute_not_exists(access_end_date) OR access_end_date >= :today)',
    ExpressionAttributeValues: {
      ':clientId': clientId,
      ':today': today
    },
    Limit: limit
  });

  const result = await docClient.send(queryCommand);
  return await enrichRentalsWithDeviceInfo(result.Items || [], tableName);
}

async function getActiveRentalsByDevice(tableName: string, deviceId: string, limit: number, today: string) {
  const indexName = tableName === 'GatewayRental' ? 'byGatewayRentalByGateway' : 'byAnalyzerRentalByAnalyzer';
  const keyAttribute = tableName === 'GatewayRental' ? 'gateway_id' : 'analyzer_id';
  
  const queryCommand = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: `${keyAttribute} = :deviceId`,
    FilterExpression: '(attribute_not_exists(end_date) OR end_date >= :today) AND (attribute_not_exists(access_end_date) OR access_end_date >= :today)',
    ExpressionAttributeValues: {
      ':deviceId': deviceId,
      ':today': today
    },
    Limit: limit
  });

  const result = await docClient.send(queryCommand);
  return await enrichRentalsWithDeviceInfo(result.Items || [], tableName);
}

async function getAllActiveRentals(tableName: string, limit: number, today: string) {
  const scanCommand = new ScanCommand({
    TableName: tableName,
    FilterExpression: '(attribute_not_exists(end_date) OR end_date >= :today) AND (attribute_not_exists(access_end_date) OR access_end_date >= :today)',
    ExpressionAttributeValues: {
      ':today': today
    },
    Limit: limit
  });

  const result = await docClient.send(scanCommand);
  return await enrichRentalsWithDeviceInfo(result.Items || [], tableName);
}

async function enrichRentalsWithDeviceInfo(rentals: any[], tableName: string) {
  const deviceTableName = tableName === 'GatewayRental' ? 'Gateway' : 'Analyzer';
  const deviceIdField = tableName === 'GatewayRental' ? 'gateway_id' : 'analyzer_id';
  
  const enrichedRentals = [];

  for (const rental of rentals) {
    try {
      // Get device information
      const deviceQuery = new QueryCommand({
        TableName: deviceTableName,
        KeyConditionExpression: 'id = :deviceId',
        ExpressionAttributeValues: {
          ':deviceId': rental[deviceIdField]
        },
        Limit: 1
      });

      const deviceResult = await docClient.send(deviceQuery);
      const device = deviceResult.Items?.[0];

      enrichedRentals.push({
        ...rental,
        device_info: device ? {
          ps_device_id: device.ps_gateway_id || device.ps_analyzer_id,
          model: device.model,
          serial_number: device.serial_number,
          communication_status: device.communication_status,
          active_inactive_status: device.active_inactive_status,
          location: {
            site: device.site_location,
            room: device.room_location,
            circuit: device.circuit // Only for analyzers
          }
        } : null
      });
    } catch (error) {
      console.error(`Error enriching rental ${rental.id} with device info:`, error);
      enrichedRentals.push({
        ...rental,
        device_info: null,
        device_info_error: 'Failed to load device information'
      });
    }
  }

  return enrichedRentals;
}