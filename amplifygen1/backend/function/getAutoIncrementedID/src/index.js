const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.DYNAMODB_TABLE_NAME;  // DynamoDB table name from environment variable

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event));
    const tableParam = event.queryStringParameters.tableName; // Adjusted to use 'table' from the event
    console.log(`tableName ${tableParam}`);

    const headers = {
        'Access-Control-Allow-Origin': '*', // Allows all domains; adjust as needed for security
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        // Get the current ID for the specified table
        const response = await dynamoDB.get({
            TableName: tableName,
            Key: { table: tableParam }
        }).promise();

        let newId;
        if (response.Item) {
            // Record exists, increment the id
            newId = response.Item.id + 1;
            await dynamoDB.update({
                TableName: tableName,
                Key: { table: tableParam },
                UpdateExpression: 'set id = :id',
                ExpressionAttributeValues: { ':id': newId },
                ReturnValues: "UPDATED_NEW"
            }).promise();
        } else {
            // No record exists, insert one starting at 100000
            newId = 100000;
            await dynamoDB.put({
                TableName: tableName,
                Item: {
                    table: tableParam,
                    id: newId
                }
            }).promise();
        }

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ id: newId })
        };
    } catch (error) {
        console.error('DynamoDB error: ', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ error: 'Failed to process DynamoDB operation.', details: error.message })
        };
    }
};

