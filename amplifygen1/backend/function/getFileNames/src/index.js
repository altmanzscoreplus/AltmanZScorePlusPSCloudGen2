const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const tableSuffix = process.env.TABLE_SUFFIX;
const s3BucketName = process.env.S3_BUCKET_NAME;
const headers = {
	            'Access-Control-Allow-Origin': '*', // Allows all domains; adjust as needed for security
	            'Access-Control-Allow-Methods': 'GET, OPTIONS',
	            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
	        };

exports.handler = async (event) => {
   console.log(JSON.stringify(event, null, 2));

    //const userName = event.queryStringParameters.user_name;
    const customer_id = event.queryStringParameters.customer_id;
    const client_id = event.queryStringParameters.client_id;
    const userRole = event.queryStringParameters.user_role;
    
    try {
        let files = [];

        if( userRole == 'Admin' || userRole == 'AdminMaster' ){
            
            // If no user_name is supplied, list all files in the S3 bucket
            const s3Params = {
                Bucket: s3BucketName
            };
            const s3Data = await s3.listObjectsV2(s3Params).promise();
            files = s3Data.Contents.map(file => file.Key);
            
        }else if (customer_id || client_id) {
/*
        }else if (event.user_name) {
            
            // 1. Attempt to get customer_id for the supplied user_name from Customer table
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
            
            let customerId = null;
            let clientId = null;

            if (customerData.Items.length > 0) {
                customerId = customerData.Items[0].id;
            } else {
                // 2. If no Customer found, attempt to get client_id from Client table
                const clientTableName = `Client${tableSuffix}`;
                const getClientParams = {
                    TableName: clientTableName,
                    IndexName: 'byClientNameByUserName',
                    KeyConditionExpression: 'user_name = :userName',
                    ExpressionAttributeValues: {
                        ':userName': userName
                    }
                };
                const clientData = await dynamodb.query(getClientParams).promise();
                if (clientData.Items.length === 0) {
                    throw new Error('No matching records found in Customer or Client tables');
                }
                clientId = clientData.Items[0].id;
            }
*/
            // 3. Look up Gateway and Analyzer tables using customer_id or client_id
            const gatewayTableName = `Gateway${tableSuffix}`;
            const analyzerTableName = `Analyzer${tableSuffix}`;
            const keyConditionExpression = customer_id ? 'customer_id = :id' : 'client_id = :id';
            const expressionAttributeValues = {
                ':id': customer_id || client_id
            };

            // Query Gateway table
            const getGatewayParams = {
                TableName: gatewayTableName,
                IndexName: customer_id ? 'byGatewayByCustomer' : 'byGatewayByClient',
                KeyConditionExpression: keyConditionExpression,
                ExpressionAttributeValues: expressionAttributeValues
            };
            const gatewayData = await dynamodb.query(getGatewayParams).promise();
            const psGatewayIds = gatewayData.Items.map(item => item.ps_gateway_id);

            // Query Analyzer table
            const getAnalyzerParams = {
                TableName: analyzerTableName,
                IndexName: customer_id ? 'byAnalyzerByCustomer' : 'byAnalyzerByClient',
                KeyConditionExpression: keyConditionExpression,
                ExpressionAttributeValues: expressionAttributeValues
            };
            const analyzerData = await dynamodb.query(getAnalyzerParams).promise();
            const psAnalyzerIds = analyzerData.Items.map(item => item.ps_analyzer_id);

console.log(psGatewayIds,'psGatewayIds')
console.log(psAnalyzerIds,'psAnalyzerIds')

            // 4. List all files in the given S3 bucket that start with ps_gateway_id or ps_analyzer_id
            const idsToSearch = psGatewayIds.concat(psAnalyzerIds);
            for (const id of idsToSearch) {
                const s3Params = {
                    Bucket: s3BucketName,
                    Prefix: id
                };
                const s3Data = await s3.listObjectsV2(s3Params).promise();
                files = files.concat(s3Data.Contents.map(file => file.Key));
            }
        } else {
            // If no user_name is supplied, list all files in the S3 bucket
            const s3Params = {
                Bucket: s3BucketName
            };
            const s3Data = await s3.listObjectsV2(s3Params).promise();
            files = s3Data.Contents.map(file => file.Key);
        }

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({
                files
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({
                message: 'An error occurred',
                error: error.message
            })
        };
    }
};

