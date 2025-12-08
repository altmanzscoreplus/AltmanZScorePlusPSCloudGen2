import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Batch delete gateway event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { gatewayIds } = body;

    if (!gatewayIds || !Array.isArray(gatewayIds)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'gatewayIds must be provided as an array'
        })
      };
    }

    const results = [];
    const errors = [];

    for (const gatewayId of gatewayIds) {
      try {
        console.log(`Deleting gateway: ${gatewayId}`);

        // First, delete related analyzers
        const analyzerQuery = new QueryCommand({
          TableName: 'Analyzer',
          IndexName: 'byAnalyzerByGateway',
          KeyConditionExpression: 'gateway_id = :gatewayId',
          ExpressionAttributeValues: {
            ':gatewayId': gatewayId
          }
        });

        const analyzerResult = await docClient.send(analyzerQuery);
        
        // Delete analyzers
        if (analyzerResult.Items) {
          for (const analyzer of analyzerResult.Items) {
            const deleteAnalyzerCommand = new DeleteCommand({
              TableName: 'Analyzer',
              Key: { id: analyzer.id }
            });
            await docClient.send(deleteAnalyzerCommand);
          }
        }

        // Delete gateway rentals
        const rentalQuery = new QueryCommand({
          TableName: 'GatewayRental',
          IndexName: 'byGatewayRentalByGateway',
          KeyConditionExpression: 'gateway_id = :gatewayId',
          ExpressionAttributeValues: {
            ':gatewayId': gatewayId
          }
        });

        const rentalResult = await docClient.send(rentalQuery);
        
        // Delete rentals
        if (rentalResult.Items) {
          for (const rental of rentalResult.Items) {
            const deleteRentalCommand = new DeleteCommand({
              TableName: 'GatewayRental',
              Key: { id: rental.id }
            });
            await docClient.send(deleteRentalCommand);
          }
        }

        // Delete readings associated with the gateway
        const readingQuery = new QueryCommand({
          TableName: 'Reading',
          IndexName: 'byReadingByGateway',
          KeyConditionExpression: 'gateway_id = :gatewayId',
          ExpressionAttributeValues: {
            ':gatewayId': gatewayId
          }
        });

        const readingResult = await docClient.send(readingQuery);
        
        // Delete readings
        if (readingResult.Items) {
          for (const reading of readingResult.Items) {
            const deleteReadingCommand = new DeleteCommand({
              TableName: 'Reading',
              Key: { id: reading.id }
            });
            await docClient.send(deleteReadingCommand);
          }
        }

        // Finally, delete the gateway
        const deleteGatewayCommand = new DeleteCommand({
          TableName: 'Gateway',
          Key: { id: gatewayId }
        });

        await docClient.send(deleteGatewayCommand);

        results.push({
          gatewayId,
          status: 'deleted',
          message: 'Gateway and related records deleted successfully'
        });

      } catch (error) {
        console.error(`Error deleting gateway ${gatewayId}:`, error);
        errors.push({
          gatewayId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Processed ${gatewayIds.length} gateways`,
        successful: results,
        errors: errors,
        summary: {
          total: gatewayIds.length,
          successful: results.length,
          failed: errors.length
        }
      })
    };

  } catch (error) {
    console.error('Error in batch delete gateway:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to batch delete gateways',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};