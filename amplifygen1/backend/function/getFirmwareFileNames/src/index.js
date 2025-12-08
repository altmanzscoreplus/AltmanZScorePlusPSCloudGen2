/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	firmware_s3_bucket
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const bucketName = process.env.FIRMWARE_S3_BUCKET;

    // CORS headers
    const headers = {
        "Access-Control-Allow-Origin": "*", // Update this to a specific origin if needed
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers
        };
    }

    try {
        // List objects in the bucket
        const data = await s3.listObjectsV2({
            Bucket: bucketName
        }).promise();

        // Extract file names
        const fileNames = data.Contents.map(item => item.Key);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ files: fileNames })
        };
    } catch (error) {
        console.error('Error retrieving file names from S3:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Error retrieving file names from S3' })
        };
    }
};

