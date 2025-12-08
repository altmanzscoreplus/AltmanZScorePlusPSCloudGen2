import type { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: DynamoDBStreamHandler = async (event) => {
  try {
    console.log('Update analyzer communication status event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const deviceId = record.dynamodb?.Keys?.device_id?.S;
        if (!deviceId) continue;

        console.log(`Processing communication status update for analyzer: ${deviceId}`);

        // Determine new communication status based on the record
        const newCommunicationStatus = await determineCommunicationStatus(record);
        
        if (newCommunicationStatus) {
          // Find analyzer by device ID and update communication status
          await updateAnalyzerCommunicationStatus(deviceId, newCommunicationStatus);
        }
      }
    }

    // DynamoDBStreamHandler should return void or DynamoDBBatchResponse
    return;

  } catch (error) {
    console.error('Error updating analyzer communication status:', error);
    throw error;
  }
};

async function determineCommunicationStatus(record: any): Promise<string | null> {
  try {
    const newImage = record.dynamodb?.NewImage;
    const oldImage = record.dynamodb?.OldImage;

    if (!newImage) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    const lastSeenTime = newImage.last_seen?.N ? parseInt(newImage.last_seen.N) : currentTime;
    const timeDifference = currentTime - lastSeenTime;

    // Determine communication status based on time since last seen
    if (timeDifference < 300) { // Less than 5 minutes
      return 'Communicating';
    } else if (timeDifference < 3600) { // Less than 1 hour
      return 'Not_Detected';
    } else {
      return 'Offline';
    }
  } catch (error) {
    console.error('Error determining communication status:', error);
    return null;
  }
}

async function updateAnalyzerCommunicationStatus(deviceId: string, communicationStatus: string) {
  try {
    // Query analyzer by device_id or ps_analyzer_id
    const queryCommand = new QueryCommand({
      TableName: 'Analyzer',
      IndexName: 'byAnalyzerByPSAnalyzerId',
      KeyConditionExpression: 'ps_analyzer_id = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      },
      Limit: 1
    });

    const queryResult = await docClient.send(queryCommand);

    if (queryResult.Items && queryResult.Items.length > 0) {
      const analyzer = queryResult.Items[0];
      
      // Update communication status
      const updateCommand = new UpdateCommand({
        TableName: 'Analyzer',
        Key: { id: analyzer.id },
        UpdateExpression: 'SET communication_status = :status, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':status': communicationStatus,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'UPDATED_NEW'
      });

      const updateResult = await docClient.send(updateCommand);
      console.log(`Updated analyzer ${analyzer.id} communication status to ${communicationStatus}`);

      // Also update connection table if it exists
      await updateConnectionTable(deviceId, communicationStatus);
    } else {
      console.log(`No analyzer found with device_id: ${deviceId}`);
    }
  } catch (error) {
    console.error(`Error updating analyzer communication status for ${deviceId}:`, error);
    throw error;
  }
}

async function updateConnectionTable(deviceId: string, communicationStatus: string) {
  try {
    // Update connection table to track device connectivity
    const updateConnectionCommand = new UpdateCommand({
      TableName: 'DeviceStatus', // Using DeviceStatus table as connection tracker
      Key: { device_id: deviceId },
      UpdateExpression: 'SET communication_status = :status, last_updated = :timestamp',
      ExpressionAttributeValues: {
        ':status': communicationStatus,
        ':timestamp': new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    });

    await docClient.send(updateConnectionCommand);
    console.log(`Updated connection status for device ${deviceId}: ${communicationStatus}`);
  } catch (error) {
    console.error(`Error updating connection table for ${deviceId}:`, error);
    // Don't throw here as this is secondary operation
  }
}