import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Batch delete customer event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { customerIds } = body;

    if (!customerIds || !Array.isArray(customerIds)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'customerIds must be provided as an array'
        })
      };
    }

    const results = [];
    const errors = [];

    for (const customerId of customerIds) {
      try {
        console.log(`Deleting customer: ${customerId}`);

        // First, delete related records (contacts, clients, etc.)
        // Query for contacts
        const contactQuery = new QueryCommand({
          TableName: 'Contact',
          IndexName: 'ContactByCustomer',
          KeyConditionExpression: 'customer_id = :customerId',
          ExpressionAttributeValues: {
            ':customerId': customerId
          }
        });

        const contactResult = await docClient.send(contactQuery);
        
        // Delete contacts
        if (contactResult.Items) {
          for (const contact of contactResult.Items) {
            const deleteContactCommand = new DeleteCommand({
              TableName: 'Contact',
              Key: { id: contact.id }
            });
            await docClient.send(deleteContactCommand);
          }
        }

        // Query for clients
        const clientQuery = new QueryCommand({
          TableName: 'Client',
          IndexName: 'byClientByCustomer',
          KeyConditionExpression: 'customer_id = :customerId',
          ExpressionAttributeValues: {
            ':customerId': customerId
          }
        });

        const clientResult = await docClient.send(clientQuery);
        
        // Delete clients
        if (clientResult.Items) {
          for (const client of clientResult.Items) {
            const deleteClientCommand = new DeleteCommand({
              TableName: 'Client',
              Key: { id: client.id }
            });
            await docClient.send(deleteClientCommand);
          }
        }

        // Finally, delete the customer
        const deleteCustomerCommand = new DeleteCommand({
          TableName: 'Customer',
          Key: { id: customerId }
        });

        await docClient.send(deleteCustomerCommand);

        results.push({
          customerId,
          status: 'deleted',
          message: 'Customer and related records deleted successfully'
        });

      } catch (error) {
        console.error(`Error deleting customer ${customerId}:`, error);
        errors.push({
          customerId,
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
        message: `Processed ${customerIds.length} customers`,
        successful: results,
        errors: errors,
        summary: {
          total: customerIds.length,
          successful: results.length,
          failed: errors.length
        }
      })
    };

  } catch (error) {
    console.error('Error in batch delete customer:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to batch delete customers',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};