/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	TABLE_SUFFIX
	S3_BUCKET_NAME
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
/*exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
        body: JSON.stringify('Hello from Lambda!'),
    };
};
*/
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const tableSuffix = process.env.TABLE_SUFFIX;
const s3BucketName = process.env.S3_BUCKET_NAME;

exports.handler = async (event) => {
    try {
        const userName = event.user_name;

        // 1. Get customer_id for the supplied user_name from Customer table using DynamoDB
        const customerTableName = `Customer${tableSuffix}`;
        const getCustomerParams = {
            TableName: customerTableName,
            IndexName: 'byCustomerByUserName',
            KeyConditionExpression: 'user_name = :userName',
            ExpressionAttributeValues: {
                ':userName': userName
            }
        };
        const customerData = await dynamodb.query(getCustomerParams).promise();
        if (customerData.Items.length === 0) {
            throw new Error('Customer not found');
        }
        const customerId = customerData.Items[0].id;

        // 2. Look up the Gateway table to find the list of ps_gateway_id using the id from Customer table
        const gatewayTableName = `Gateway${tableSuffix}`;
        const getGatewayParams = {
            TableName: gatewayTableName,
            IndexName: 'byGatewayByCustomer',
            KeyConditionExpression: 'customer_id = :customerId',
            ExpressionAttributeValues: {
                ':customerId': customerId
            }
        };
        const gatewayData = await dynamodb.query(getGatewayParams).promise();
        const psGatewayIds = gatewayData.Items.map(item => item.ps_gateway_id);

        // 3. List all files in the given S3 bucket that start with ps_gateway_id
        let files = [];
        for (const psGatewayId of psGatewayIds) {
            const s3Params = {
                Bucket: s3BucketName,
                Prefix: psGatewayId
            };
            const s3Data = await s3.listObjectsV2(s3Params).promise();
            files = files.concat(s3Data.Contents.map(file => file.Key));
        }

        return {
            statusCode: 200,
	   'Access-Control-Allow-Origin': '*', // CORS header
	   'Access-Control-Allow-Headers': 'Content-Type', // CORS header
	   'Access-Control-Allow-Methods': 'GET', // CORS header
            body: JSON.stringify({
                customerId,
                psGatewayIds,
                files
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
	   'Access-Control-Allow-Origin': '*', // CORS header
	   'Access-Control-Allow-Headers': 'Content-Type', // CORS header
	   'Access-Control-Allow-Methods': 'GET', // CORS header
            body: JSON.stringify({
                message: 'An error occurred',
                error: error.message
            })
        };
    }
};

