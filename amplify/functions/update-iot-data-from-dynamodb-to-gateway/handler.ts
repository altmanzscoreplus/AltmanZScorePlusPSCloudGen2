import type { DynamoDBStreamHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IoTDataPlaneClient, UpdateThingShadowCommand, PublishCommand } from '@aws-sdk/client-iot-data-plane';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const iotClient = new IoTDataPlaneClient({ 
  region: process.env.AWS_REGION,
  endpoint: process.env.IOT_ENDPOINT
});

export const handler: DynamoDBStreamHandler = async (event) => {
  try {
    console.log('Update IoT data from DynamoDB to Gateway event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const gatewayId = record.dynamodb?.Keys?.id?.S;
        if (!gatewayId) continue;

        console.log(`Processing IoT update for gateway: ${gatewayId}`);

        const newImage = record.dynamodb?.NewImage;
        if (newImage) {
          // Extract relevant data from the DynamoDB record
          const gatewayData = {
            id: gatewayId,
            ps_gateway_id: newImage.ps_gateway_id?.S,
            communication_status: newImage.communication_status?.S,
            active_inactive_status: newImage.active_inactive_status?.S,
            firmware_version: newImage.fw_ver?.S,
            hardware_version: newImage.hw_ver?.S,
            model: newImage.model?.S,
            serial_number: newImage.serial_number?.S,
            location: {
              site: newImage.site_location?.S,
              room: newImage.room_location?.S,
              gps: newImage.gps_location?.S
            },
            configuration: {
              options: newImage.options?.S,
              alarm_interval: newImage.alarm_interval?.N ? parseInt(newImage.alarm_interval.N) : null,
              alarm_level: newImage.alarm_level?.S,
              enable_alarm: newImage.enable_or_disable_alarm?.BOOL
            },
            timestamps: {
              updated_at: newImage.updatedAt?.S,
              fw_status_updated: newImage.fw_status_updated?.S
            }
          };

          // Update IoT device shadow with gateway data
          await updateGatewayIoTShadow(gatewayData);

          // Publish configuration updates to IoT topic
          await publishGatewayConfiguration(gatewayData);

          // Get and publish connected analyzers list
          await publishConnectedAnalyzers(gatewayData.id, gatewayData.ps_gateway_id);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'IoT gateway updates processed successfully'
      })
    };

  } catch (error) {
    console.error('Error updating IoT data for gateway:', error);
    throw error;
  }
};

async function updateGatewayIoTShadow(gatewayData: any) {
  try {
    const thingName = gatewayData.ps_gateway_id;
    if (!thingName) {
      console.log('No ps_gateway_id found, skipping IoT shadow update');
      return;
    }

    const shadowUpdate = {
      state: {
        desired: {
          configuration: gatewayData.configuration,
          location: gatewayData.location,
          firmware_version: gatewayData.firmware_version,
          hardware_version: gatewayData.hardware_version,
          model: gatewayData.model,
          serial_number: gatewayData.serial_number,
          last_updated: new Date().toISOString()
        },
        reported: {
          status: gatewayData.communication_status,
          active_status: gatewayData.active_inactive_status,
          timestamp: gatewayData.timestamps.updated_at
        }
      }
    };

    const command = new UpdateThingShadowCommand({
      thingName: thingName,
      payload: JSON.stringify(shadowUpdate)
    });

    const response = await iotClient.send(command);
    console.log(`Updated IoT shadow for gateway ${thingName}`);
  } catch (error) {
    console.error(`Error updating IoT shadow for gateway ${gatewayData.ps_gateway_id}:`, error);
  }
}

async function publishGatewayConfiguration(gatewayData: any) {
  try {
    const thingName = gatewayData.ps_gateway_id;
    if (!thingName) return;

    // Publish configuration updates to device-specific topic
    const topic = `powersight/gateway/${thingName}/config`;
    
    const configMessage = {
      device_id: thingName,
      configuration: gatewayData.configuration,
      location: gatewayData.location,
      device_info: {
        model: gatewayData.model,
        serial_number: gatewayData.serial_number,
        firmware_version: gatewayData.firmware_version,
        hardware_version: gatewayData.hardware_version
      },
      timestamp: new Date().toISOString(),
      message_type: 'configuration_update'
    };

    const publishCommand = new PublishCommand({
      topic: topic,
      payload: JSON.stringify(configMessage),
      qos: 1
    });

    await iotClient.send(publishCommand);
    console.log(`Published configuration update to topic: ${topic}`);

    // Also publish to general gateway updates topic
    const generalTopic = 'powersight/gateways/updates';
    const generalMessage = {
      device_id: thingName,
      device_type: 'gateway',
      update_type: 'configuration',
      data: gatewayData,
      timestamp: new Date().toISOString()
    };

    const generalPublishCommand = new PublishCommand({
      topic: generalTopic,
      payload: JSON.stringify(generalMessage),
      qos: 0
    });

    await iotClient.send(generalPublishCommand);
    console.log(`Published to general gateway updates topic`);
  } catch (error) {
    console.error(`Error publishing gateway configuration for ${gatewayData.ps_gateway_id}:`, error);
  }
}

async function publishConnectedAnalyzers(gatewayId: string, gatewayThingName: string | undefined) {
  try {
    if (!gatewayThingName) return;

    // Query analyzers connected to this gateway
    const queryCommand = new QueryCommand({
      TableName: 'Analyzer',
      IndexName: 'byAnalyzerByGateway',
      KeyConditionExpression: 'gateway_id = :gatewayId',
      ExpressionAttributeValues: {
        ':gatewayId': gatewayId
      }
    });

    const result = await docClient.send(queryCommand);
    
    if (result.Items && result.Items.length > 0) {
      const analyzersInfo = result.Items.map(analyzer => ({
        analyzer_id: analyzer.ps_analyzer_id,
        device_id: analyzer.device_id,
        communication_status: analyzer.communication_status,
        circuit: analyzer.circuit,
        room_location: analyzer.room_location
      }));

      // Publish connected analyzers list to gateway
      const topic = `powersight/gateway/${gatewayThingName}/analyzers`;
      const message = {
        gateway_id: gatewayThingName,
        connected_analyzers: analyzersInfo,
        analyzer_count: analyzersInfo.length,
        timestamp: new Date().toISOString(),
        message_type: 'analyzers_list'
      };

      const publishCommand = new PublishCommand({
        topic: topic,
        payload: JSON.stringify(message),
        qos: 0
      });

      await iotClient.send(publishCommand);
      console.log(`Published connected analyzers list for gateway ${gatewayThingName} (${analyzersInfo.length} analyzers)`);
    }
  } catch (error) {
    console.error(`Error publishing connected analyzers for gateway ${gatewayThingName}:`, error);
  }
}