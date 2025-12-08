import type { Handler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: process.env.AWS_REGION });
const pinpointClient = new PinpointClient({ region: process.env.PINPOINT_REGION });

const ALERT_INTERVAL = 60 * 60; // 1 hour in seconds

export const handler: Handler = async (event) => {
  try {
    console.log('Send disconnect alarm event:', JSON.stringify(event, null, 2));

    for (const record of event.Records || []) {
      if (record.eventName === 'MODIFY' || record.eventName === 'INSERT') {
        const deviceId = record.dynamodb?.Keys?.device_id?.S;
        if (!deviceId) continue;

        console.log(`Processing disconnect alarm for device: ${deviceId}`);

        // Check if this is a disconnect event (device went offline)
        const newCommunicationStatus = record.dynamodb?.NewImage?.communication_status?.S;
        const oldCommunicationStatus = record.dynamodb?.OldImage?.communication_status?.S;

        if (newCommunicationStatus === 'Not_Detected' && oldCommunicationStatus !== 'Not_Detected') {
          console.log(`Device ${deviceId} has disconnected`);

          // Check for duplicate alarms within the alert interval
          const isDuplicate = await checkDuplicate(deviceId);
          if (isDuplicate) {
            console.log(`Duplicate alarm detected for device ${deviceId}, skipping`);
            continue;
          }

          // Get device data to determine if it's a gateway or analyzer
          const deviceData = await getDeviceData(deviceId);
          if (!deviceData) {
            console.log(`Device data not found for ${deviceId}`);
            continue;
          }

          // Get alarm settings and contacts
          const alarmSettings = await getAlarmSettings(deviceData);
          const contacts = await getContacts(deviceData);

          // Send alarms to appropriate contacts
          for (const contact of contacts) {
            await sendAlarm(contact, deviceData, alarmSettings);
          }

          // Mark alarm as processed
          await markAsProcessed(deviceId);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Disconnect alarms processed successfully'
      })
    };

  } catch (error) {
    console.error('Error processing disconnect alarm:', error);
    throw error;
  }
};

async function checkDuplicate(deviceId: string): Promise<boolean> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const cutoffTime = now - ALERT_INTERVAL;

    const queryCommand = new QueryCommand({
      TableName: 'AlarmSent',
      IndexName: 'byDevice',
      KeyConditionExpression: 'device_id = :deviceId AND alarm_sent_at > :cutoff',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
        ':cutoff': cutoffTime
      },
      Limit: 1
    });

    const result = await docClient.send(queryCommand);
    return (result.Items?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }
}

async function getDeviceData(deviceId: string) {
  // Try to find device in Gateway table first
  try {
    const gatewayQuery = new QueryCommand({
      TableName: 'Gateway',
      IndexName: 'byGatewayByPSGatewayId',
      KeyConditionExpression: 'ps_gateway_id = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      },
      Limit: 1
    });

    const gatewayResult = await docClient.send(gatewayQuery);
    if (gatewayResult.Items && gatewayResult.Items.length > 0) {
      return { ...gatewayResult.Items[0], deviceType: 'Gateway' };
    }

    // Try Analyzer table
    const analyzerQuery = new QueryCommand({
      TableName: 'Analyzer',
      IndexName: 'byAnalyzerByPSAnalyzerId',
      KeyConditionExpression: 'ps_analyzer_id = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      },
      Limit: 1
    });

    const analyzerResult = await docClient.send(analyzerQuery);
    if (analyzerResult.Items && analyzerResult.Items.length > 0) {
      return { ...analyzerResult.Items[0], deviceType: 'Analyzer' };
    }

    return null;
  } catch (error) {
    console.error('Error getting device data:', error);
    return null;
  }
}

async function getAlarmSettings(deviceData: any) {
  // Get alarm settings based on device type and hierarchy
  return {
    level: 'Level_1',
    interval: 3600,
    message: `Device ${deviceData.ps_gateway_id || deviceData.ps_analyzer_id} has disconnected`
  };
}

async function getContacts(deviceData: any) {
  // Get contacts based on device ownership
  try {
    const contactQuery = new QueryCommand({
      TableName: 'Contact',
      IndexName: 'ContactByCustomer',
      KeyConditionExpression: 'customer_id = :customerId',
      ExpressionAttributeValues: {
        ':customerId': deviceData.customer_id
      }
    });

    const result = await docClient.send(contactQuery);
    return result.Items || [];
  } catch (error) {
    console.error('Error getting contacts:', error);
    return [];
  }
}

async function sendAlarm(contact: any, deviceData: any, alarmSettings: any) {
  try {
    // Send email if email is available
    if (contact.email && contact.alarm_level_email !== 'None') {
      await sendEmail(contact.email, alarmSettings.message, deviceData);
    }

    // Send SMS if phone is available
    if (contact.phone && contact.alarm_level_sms !== 'None') {
      await sendSMS(contact.phone, alarmSettings.message, deviceData);
    }

    console.log(`Alarm sent to contact: ${contact.name}`);
  } catch (error) {
    console.error(`Error sending alarm to contact ${contact.id}:`, error);
  }
}

async function sendEmail(email: string, message: string, deviceData: any) {
  try {
    const command = new SendEmailCommand({
      Source: process.env.SES_RECIPIENT_EMAIL,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: 'PowerSight Device Disconnect Alert'
        },
        Body: {
          Text: {
            Data: message
          }
        }
      }
    });

    await sesClient.send(command);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function sendSMS(phoneNumber: string, message: string, deviceData: any) {
  try {
    if (!process.env.PINPOINT_APP_ID) {
      console.log('PINPOINT_APP_ID not configured, skipping SMS');
      return;
    }

    const command = new SendMessagesCommand({
      ApplicationId: process.env.PINPOINT_APP_ID,
      MessageRequest: {
        Addresses: {
          [phoneNumber]: {
            ChannelType: 'SMS'
          }
        },
        MessageConfiguration: {
          SMSMessage: {
            Body: message,
            MessageType: 'TRANSACTIONAL',
            OriginationNumber: process.env.ORIGINATION_NUMBER
          }
        }
      }
    });

    await pinpointClient.send(command);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

async function markAsProcessed(deviceId: string) {
  try {
    const putCommand = new PutCommand({
      TableName: 'AlarmSent',
      Item: {
        id: `${deviceId}-${Date.now()}`,
        device_id: deviceId,
        crsm: deviceId,
        device_type: 'Gateway', // This should be determined dynamically
        alarm_sent_at: Date.now() / 1000,
        alarm_delivery_method: 'EMAIL',
        alarm_recipient: 'system'
      }
    });

    await docClient.send(putCommand);
  } catch (error) {
    console.error('Error marking alarm as processed:', error);
  }
}