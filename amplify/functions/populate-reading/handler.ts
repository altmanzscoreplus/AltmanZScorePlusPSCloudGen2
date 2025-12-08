import type { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Function to get current system time + 24 hours in epoch seconds
function getFutureEpochTime(): number {
  const futureTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  return Math.floor(futureTime.getTime() / 1000);
}

async function queryOrInsertEvent(eventID: string): Promise<void> {
  try {
    const getCommand = new GetCommand({
      TableName: 'Events',
      Key: { eventID }
    });

    const data = await docClient.send(getCommand);
    
    if (!data.Item) {
      // No item found, insert new item
      const epochTime = getFutureEpochTime();
      
      const putCommand = new PutCommand({
        TableName: 'Events',
        Item: {
          eventID,
          epochTime
        }
      });

      await docClient.send(putCommand);
      console.log(`New record inserted: eventID = ${eventID}, epochTime = ${epochTime}`);
    } else {
      // Item found
      console.log('Record found:', data.Item);
    }
  } catch (error) {
    console.error('Error in queryOrInsertEvent:', error);
    throw error;
  }
}

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log('Populate Reading Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    console.log('Record:', JSON.stringify(record, null, 2));
    
    if (!record.eventID) {
      console.log('No eventID found in record');
      continue;
    }

    console.log('eventID:', record.eventID);
    
    try {
      await queryOrInsertEvent(record.eventID);
    } catch (error) {
      console.error('Error processing event:', error);
      continue;
    }

    if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
      const newItem = record.dynamodb.NewImage;
      console.log('data:', newItem.data);

      try {
        // Convert createdAt to a JavaScript Date object and add 15 minutes
        const createdAtStr = newItem.createdAt?.S;
        if (!createdAtStr) {
          console.log('No createdAt found in record');
          continue;
        }

        const expireAtDate = new Date(new Date(createdAtStr).getTime() + 15 * 60 * 1000);
        const expireAt = expireAtDate.toISOString();
        const expireAtEpochTime = Math.floor(expireAtDate.getTime() / 1000);

        const putCommand = new PutCommand({
          TableName: 'ReadingTest',
          Item: {
            analyzer_id: newItem.analyzer_id?.S || '',
            createdAt: createdAtStr,
            data: newItem.data?.M || {},
            gateway_id: newItem.gateway_id?.S || '',
            updatedAt: newItem.updatedAt?.S || createdAtStr,
            expireAt,
            expireAtEpochTime
          }
        });

        await docClient.send(putCommand);
        console.log('Item inserted into ReadingTest successfully');
      } catch (error) {
        console.error('Error inserting item into ReadingTest:', error);
      }
    }
  }
};