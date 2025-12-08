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
    console.log('Update IoT data from DynamoDB to Analyzer event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const analyzerId = record.dynamodb?.Keys?.id?.S;
        if (!analyzerId) continue;

        console.log(`Processing IoT update for analyzer: ${analyzerId}`);

        const newImage = record.dynamodb?.NewImage;
        if (newImage) {
          // Extract relevant data from the DynamoDB record
          const analyzerData = {
            id: analyzerId,
            ps_analyzer_id: newImage.ps_analyzer_id?.S,
            communication_status: newImage.communication_status?.S,
            active_inactive_status: newImage.active_inactive_status?.S,
            firmware_version: newImage.fw_ver?.S,
            hardware_version: newImage.hw_ver?.S,
            location: {
              site: newImage.site_location?.S,
              room: newImage.room_location?.S,
              circuit: newImage.circuit?.S,
              gps: newImage.gps_location?.S
            },
            configuration: {
              options: newImage.options?.S,
              enable_alarm: newImage.enable_or_disable_alarm?.BOOL
            },
            timestamps: {
              updated_at: newImage.updatedAt?.S,
              fw_status_updated: newImage.fw_status_updated?.S
            }
          };

          // Update IoT device shadow with analyzer data
          await updateAnalyzerIoTShadow(analyzerData);

          // Publish configuration updates to IoT topic
          await publishAnalyzerConfiguration(analyzerData);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'IoT analyzer updates processed successfully'
      })
    };

  } catch (error) {
    console.error('Error updating IoT data for analyzer:', error);
    throw error;
  }
};

async function updateAnalyzerIoTShadow(analyzerData: any) {
  try {
    const thingName = analyzerData.ps_analyzer_id;
    if (!thingName) {
      console.log('No ps_analyzer_id found, skipping IoT shadow update');
      return;
    }

    const shadowUpdate = {
      state: {
        desired: {
          configuration: analyzerData.configuration,
          location: analyzerData.location,
          firmware_version: analyzerData.firmware_version,
          hardware_version: analyzerData.hardware_version,
          last_updated: new Date().toISOString()
        },
        reported: {
          status: analyzerData.communication_status,
          active_status: analyzerData.active_inactive_status,
          timestamp: analyzerData.timestamps.updated_at
        }
      }
    };

    const command = new UpdateThingShadowCommand({
      thingName: thingName,
      payload: JSON.stringify(shadowUpdate)
    });

    const response = await iotClient.send(command);
    console.log(`Updated IoT shadow for analyzer ${thingName}`);
  } catch (error) {
    console.error(`Error updating IoT shadow for analyzer ${analyzerData.ps_analyzer_id}:`, error);
    // Don't throw error - continue processing other records
  }
}

async function publishAnalyzerConfiguration(analyzerData: any) {
  try {
    const thingName = analyzerData.ps_analyzer_id;
    if (!thingName) return;

    // Publish configuration updates to device-specific topic
    const topic = `powersight/analyzer/${thingName}/config`;
    
    const configMessage = {
      device_id: thingName,
      configuration: analyzerData.configuration,
      location: analyzerData.location,
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

    // Also publish to general analyzer updates topic
    const generalTopic = 'powersight/analyzers/updates';
    const generalMessage = {
      device_id: thingName,
      device_type: 'analyzer',
      update_type: 'configuration',
      data: analyzerData,
      timestamp: new Date().toISOString()
    };

    const generalPublishCommand = new PublishCommand({
      topic: generalTopic,
      payload: JSON.stringify(generalMessage),
      qos: 0
    });

    await iotClient.send(generalPublishCommand);
    console.log(`Published to general analyzer updates topic`);
  } catch (error) {
    console.error(`Error publishing analyzer configuration for ${analyzerData.ps_analyzer_id}:`, error);
  }
}