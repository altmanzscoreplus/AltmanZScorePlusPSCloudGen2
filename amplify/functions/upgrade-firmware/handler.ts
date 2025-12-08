import type { APIGatewayProxyHandler } from 'aws-lambda';
import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const iotClient = new IoTDataPlaneClient({ 
  region: process.env.AWS_REGION,
  endpoint: process.env.IOT_DEVICE_ENDPOINT
});

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Upgrade firmware event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { deviceId, firmwareVersion, firmwareFile } = body;

    if (!deviceId || !firmwareVersion || !firmwareFile) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'deviceId, firmwareVersion, and firmwareFile are required'
        })
      };
    }

    // Generate pre-signed URL for firmware file
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.FIRMWARE_BUCKET_NAME,
      Key: firmwareFile
    });

    const firmwareUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });

    // Update IoT device shadow with firmware upgrade command
    const shadowPayload = {
      state: {
        desired: {
          firmware: {
            version: firmwareVersion,
            url: firmwareUrl,
            command: 'upgrade',
            timestamp: new Date().toISOString()
          }
        }
      }
    };

    const thingName = deviceId || process.env.THING_NAME;
    const command = new UpdateThingShadowCommand({
      thingName,
      payload: JSON.stringify(shadowPayload)
    });

    const response = await iotClient.send(command);
    const payload = new TextDecoder().decode(response.payload);
    const result = JSON.parse(payload);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        deviceId: thingName,
        firmwareVersion,
        firmwareUrl,
        result
      })
    };

  } catch (error) {
    console.error('Error upgrading firmware:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to upgrade firmware',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};