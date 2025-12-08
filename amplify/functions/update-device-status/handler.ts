import type { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const DEVICE_TIMEOUT = parseInt(process.env.DEVICE_TIMEOUT || '300'); // Default 5 minutes

export const handler: DynamoDBStreamHandler = async (event) => {
  try {
    console.log('Update device status event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const deviceId = record.dynamodb?.Keys?.device_id?.S;
        if (!deviceId) continue;

        console.log(`Processing device status update for: ${deviceId}`);

        const currentTime = Math.floor(Date.now() / 1000);
        const newData = record.dynamodb?.NewImage;

        if (newData) {
          // Extract device data from the stream record
          const deviceData = {
            device_id: deviceId,
            last_seen: newData.sample_server_epoch_time?.N ? 
              parseInt(newData.sample_server_epoch_time.N) : currentTime,
            data: newData.data?.M || {}
          };

          // Determine alert level based on last seen time
          const timeSinceLastSeen = currentTime - deviceData.last_seen;
          let alertLevel = 0;

          if (timeSinceLastSeen > DEVICE_TIMEOUT * 3) {
            alertLevel = 3; // Critical - device offline for 15+ minutes
          } else if (timeSinceLastSeen > DEVICE_TIMEOUT * 2) {
            alertLevel = 2; // Warning - device offline for 10+ minutes
          } else if (timeSinceLastSeen > DEVICE_TIMEOUT) {
            alertLevel = 1; // Caution - device offline for 5+ minutes
          }

          // Update or create device status record
          await updateDeviceStatusRecord(deviceId, deviceData.last_seen, alertLevel);

          console.log(`Device status updated for ${deviceId}: alert_level=${alertLevel}, last_seen=${deviceData.last_seen}`);
        }
      }
    }

    // DynamoDBStreamHandler should return void or DynamoDBBatchResponse
    return;

  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
};

async function updateDeviceStatusRecord(deviceId: string, lastSeen: number, alertLevel: number) {
  try {
    // Check if device status record exists
    const getCommand = new GetCommand({
      TableName: 'DeviceStatus',
      Key: { device_id: deviceId }
    });

    const existingRecord = await docClient.send(getCommand);

    if (existingRecord.Item) {
      // Update existing record
      const updateCommand = new UpdateCommand({
        TableName: 'DeviceStatus',
        Key: { device_id: deviceId },
        UpdateExpression: 'SET last_seen = :lastSeen, alert_level = :alertLevel, updated_at = :updatedAt',
        ExpressionAttributeValues: {
          ':lastSeen': lastSeen,
          ':alertLevel': alertLevel,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'UPDATED_NEW'
      });

      await docClient.send(updateCommand);
    } else {
      // Create new record
      const putCommand = new PutCommand({
        TableName: 'DeviceStatus',
        Item: {
          device_id: deviceId,
          last_seen: lastSeen,
          alert_level: alertLevel,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });

      await docClient.send(putCommand);
    }
  } catch (error) {
    console.error(`Error updating device status record for ${deviceId}:`, error);
    throw error;
  }
}