import type { APIGatewayProxyHandler } from 'aws-lambda';
import { IoTDataPlaneClient, UpdateThingShadowCommand, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane';

const iotClient = new IoTDataPlaneClient({ 
  region: process.env.AWS_REGION,
  endpoint: process.env.IOT_ENDPOINT
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('IoT Shadow event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { thingName, shadowData, action = 'update' } = body;

    const finalThingName = thingName || process.env.DEFAULT_THING_NAME;

    if (!finalThingName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Thing name is required'
        })
      };
    }

    let result;

    if (action === 'get') {
      // Get thing shadow
      const command = new GetThingShadowCommand({
        thingName: finalThingName
      });
      
      const response = await iotClient.send(command);
      const payload = new TextDecoder().decode(response.payload);
      result = JSON.parse(payload);
    } else {
      // Update thing shadow
      const shadowPayload = {
        state: {
          desired: shadowData || {}
        }
      };

      const command = new UpdateThingShadowCommand({
        thingName: finalThingName,
        payload: JSON.stringify(shadowPayload)
      });

      const response = await iotClient.send(command);
      const payload = new TextDecoder().decode(response.payload);
      result = JSON.parse(payload);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        thingName: finalThingName,
        result
      })
    };

  } catch (error) {
    console.error('Error in IoT Shadow operation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to perform IoT Shadow operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};