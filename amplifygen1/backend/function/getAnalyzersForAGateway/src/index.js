/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	IOT_ENDPOINT
	ANALYZER_TABLE
	DEVICE_IDS
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION });
const iotData = new AWS.IotData({ endpoint: process.env.IOT_ENDPOINT });

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        // Extract gateway_id from IoT message
        const message = JSON.parse(event.body); // Assuming message body is JSON
        const gatewayId = message.gateway_id; // Adjust based on your message structure

        // Read DynamoDB table name from environment variable
        const tableName = process.env.ANALYZER_TABLE;

        // Query DynamoDB based on gateway_id
        const params = {
            TableName: tableName,
            KeyConditionExpression: 'gateway_id = :gid',
            ExpressionAttributeValues: {
                ':gid': gatewayId
            }
        };

        const data = await docClient.query(params).promise();

        // Extract device IDs from DynamoDB query result
        const deviceIds = data.Items.map(item => item.id); // Change here to item.id

        // Construct response message
        const response = {
            statusCode: 200,
            body: JSON.stringify({ deviceIds: deviceIds })
        };

        // Publish device IDs to another IoT topic
        const iotParams = {
            topic: process.env.IOT_TOPIC,
            payload: JSON.stringify({ deviceIds: deviceIds }),
            qos: 1 // Quality of Service, optional, default is 0
        };

        await iotData.publish(iotParams).promise();
        console.log('Device IDs published to IoT topic:', process.env.DEVICE_IDS);

        return response;
    } catch (err) {
        console.error('Error processing request:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error processing request' })
        };
    }
};

