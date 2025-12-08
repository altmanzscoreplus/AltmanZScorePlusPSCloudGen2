/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	firmware_buket_name
	thingName
	IOT_Device_Endpoint
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const iotData = new AWS.IotData({ endpoint: process.env.IOT_Device_Endpoint });

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const bucketName = process.env.firmware_bucket_name;
    const thingName = process.env.thingName;
    console.log("bucketName", bucketName);
    console.log("thingName", thingName);

    const body = JSON.parse(event.body);

    // Retrieve firmware_file_name and device_shadow_list
    const firmwareFileName = body.firmware_file_name;
    const deviceShadowList = body.device_shadow_list;
    console.log("Firmware File Name:", firmwareFileName);
    console.log("Device Shadow List:", deviceShadowList);

	//
    try {
        // Get firmware file from S3
	/*
        const firmwareData = await s3.getObject({
            Bucket: bucketName,
            Key: firmwareFileName
        }).promise();
        
        const firmwareContent = firmwareData.Body.toString('utf-8'); */

        const firmwareUrl = s3.getSignedUrl('getObject', {
		                Bucket: bucketName,
		                Key: firmwareFileName,
		                Expires: 3600 // URL expires in 1 hour
		            });

        // Iterate over device shadows and update them
        for (const deviceShadow of deviceShadowList) {
            const params = {
                thingName: thingName,
                shadowName: deviceShadow,
                payload: JSON.stringify({
                    state: {
                        desired: {
				 //firmware_url: firmwareUrl,
				 FWM: firmwareUrl,
				 update_initiated_at: new Date().toISOString()
                            //firmware_version: firmwareContent
                        }
                    }
                })
            };
            
            await iotData.updateThingShadow(params).promise();
            console.log(`Firmware updated for device: ${deviceShadow}`);
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allows CORS
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: 'Firmware update successful for all devices.'
        };
    } catch (error) {
        console.error('Error updating firmware:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allows CORS
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: `Firmware update failed: ${error.message}`
        };
    }
};

