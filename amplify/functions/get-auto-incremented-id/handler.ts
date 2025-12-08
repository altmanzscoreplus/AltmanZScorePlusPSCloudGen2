import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get auto incremented ID event:', JSON.stringify(event, null, 2));

    const tableName = event.queryStringParameters?.tableName;

    if (!tableName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'tableName query parameter is required'
        })
      };
    }

    // Get the current ID for the specified table
    const getCommand = new GetCommand({
      TableName: 'AutoIncrementedId',
      Key: { table: tableName }
    });

    const response = await docClient.send(getCommand);
    let newId: number;

    if (response.Item) {
      // Record exists, increment the id
      newId = response.Item.id + 1;
      
      const updateCommand = new UpdateCommand({
        TableName: 'AutoIncrementedId',
        Key: { table: tableName },
        UpdateExpression: 'set id = :id',
        ExpressionAttributeValues: { ':id': newId },
        ReturnValues: 'UPDATED_NEW'
      });

      await docClient.send(updateCommand);
    } else {
      // No record exists, insert one starting at 100000
      newId = 100000;
      
      const putCommand = new PutCommand({
        TableName: 'AutoIncrementedId',
        Item: {
          table: tableName,
          id: newId
        }
      });

      await docClient.send(putCommand);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: newId })
    };

  } catch (error) {
    console.error('DynamoDB error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to process DynamoDB operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};