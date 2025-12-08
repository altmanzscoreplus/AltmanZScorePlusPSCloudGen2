import type { APIGatewayProxyHandler } from 'aws-lambda';
import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane';

const iotClient = new IoTDataPlaneClient({ 
  region: process.env.AWS_REGION,
  endpoint: process.env.IOT_ENDPOINT
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Update device event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { deviceId, updateData } = body;

    if (!deviceId || !updateData) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'deviceId and updateData are required'
        })
      };
    }

    // Update IoT device shadow
    const shadowPayload = {
      state: {
        desired: updateData
      }
    };

    const command = new UpdateThingShadowCommand({
      thingName: deviceId,
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
        deviceId,
        result
      })
    };

  } catch (error) {
    console.error('Error updating device:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to update device',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};