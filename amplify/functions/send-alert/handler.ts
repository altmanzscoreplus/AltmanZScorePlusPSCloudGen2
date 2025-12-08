import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: process.env.AWS_REGION });
const pinpointClient = new PinpointClient({ region: process.env.AWS_REGION });

interface AlertRequest {
  alertType: 'device_offline' | 'system_error' | 'maintenance' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  subject?: string;
  recipients: {
    emails?: string[];
    phones?: string[];
  };
  deviceId?: string;
  customerId?: string;
  clientId?: string;
  metadata?: Record<string, any>;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Send alert event:', JSON.stringify(event, null, 2));

    const alertRequest: AlertRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    const validation = validateAlertRequest(alertRequest);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid alert request',
          details: validation.errors
        })
      };
    }

    // If no recipients specified, get default recipients based on customer/client
    let finalRecipients = alertRequest.recipients;
    if ((!finalRecipients.emails || finalRecipients.emails.length === 0) && 
        (!finalRecipients.phones || finalRecipients.phones.length === 0)) {
      finalRecipients = await getDefaultRecipients(alertRequest.customerId, alertRequest.clientId);
    }

    if ((!finalRecipients.emails || finalRecipients.emails.length === 0) && 
        (!finalRecipients.phones || finalRecipients.phones.length === 0)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'No recipients found for alert'
        })
      };
    }

    // Send alerts - normalize recipients to ensure arrays are always present
    const normalizedRecipients = {
      emails: finalRecipients.emails || [],
      phones: finalRecipients.phones || []
    };
    const results = await sendAlerts(alertRequest, normalizedRecipients);

    // Log alert for tracking
    await logAlert(alertRequest, normalizedRecipients, results);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Alert sent successfully',
        alertType: alertRequest.alertType,
        severity: alertRequest.severity,
        results: results,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error sending alert:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to send alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

function validateAlertRequest(request: AlertRequest) {
  const errors: string[] = [];

  if (!request.alertType) {
    errors.push('alertType is required');
  }

  if (!request.severity) {
    errors.push('severity is required');
  }

  if (!request.message || request.message.trim().length === 0) {
    errors.push('message is required and cannot be empty');
  }

  const validAlertTypes = ['device_offline', 'system_error', 'maintenance', 'custom'];
  if (request.alertType && !validAlertTypes.includes(request.alertType)) {
    errors.push(`alertType must be one of: ${validAlertTypes.join(', ')}`);
  }

  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (request.severity && !validSeverities.includes(request.severity)) {
    errors.push(`severity must be one of: ${validSeverities.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function getDefaultRecipients(customerId?: string, clientId?: string) {
  const recipients = { emails: [] as string[], phones: [] as string[] };

  try {
    if (customerId) {
      // Get customer contacts
      const customerContactsQuery = new QueryCommand({
        TableName: 'Contact',
        IndexName: 'ContactByCustomer',
        KeyConditionExpression: 'customer_id = :customerId',
        ExpressionAttributeValues: {
          ':customerId': customerId
        }
      });

      const customerContacts = await docClient.send(customerContactsQuery);
      if (customerContacts.Items) {
        for (const contact of customerContacts.Items) {
          if (contact.email && contact.alarm_level_email !== 'None') {
            recipients.emails.push(contact.email);
          }
          if (contact.phone && contact.alarm_level_phone !== 'None') {
            recipients.phones.push(contact.phone);
          }
        }
      }
    }

    if (clientId) {
      // Get client contacts
      const clientContactsQuery = new QueryCommand({
        TableName: 'Contact',
        IndexName: 'ContactByClient',
        KeyConditionExpression: 'client_id = :clientId',
        ExpressionAttributeValues: {
          ':clientId': clientId
        }
      });

      const clientContacts = await docClient.send(clientContactsQuery);
      if (clientContacts.Items) {
        for (const contact of clientContacts.Items) {
          if (contact.email && contact.alarm_level_email !== 'None') {
            recipients.emails.push(contact.email);
          }
          if (contact.phone && contact.alarm_level_phone !== 'None') {
            recipients.phones.push(contact.phone);
          }
        }
      }
    }

    // Remove duplicates
    recipients.emails = [...new Set(recipients.emails)];
    recipients.phones = [...new Set(recipients.phones)];

  } catch (error) {
    console.error('Error getting default recipients:', error);
  }

  return recipients;
}

async function sendAlerts(alertRequest: AlertRequest, recipients: { emails: string[], phones: string[] }) {
  const results = {
    emails: { sent: 0, failed: 0, details: [] as any[] },
    sms: { sent: 0, failed: 0, details: [] as any[] }
  };

  // Send email alerts
  if (recipients.emails && recipients.emails.length > 0) {
    for (const email of recipients.emails) {
      try {
        await sendEmailAlert(email, alertRequest);
        results.emails.sent++;
        results.emails.details.push({ recipient: email, status: 'sent' });
      } catch (error) {
        results.emails.failed++;
        results.emails.details.push({ 
          recipient: email, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
  }

  // Send SMS alerts
  if (recipients.phones && recipients.phones.length > 0 && process.env.PINPOINT_APP_ID) {
    for (const phone of recipients.phones) {
      try {
        await sendSMSAlert(phone, alertRequest);
        results.sms.sent++;
        results.sms.details.push({ recipient: phone, status: 'sent' });
      } catch (error) {
        results.sms.failed++;
        results.sms.details.push({ 
          recipient: phone, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
  }

  return results;
}

async function sendEmailAlert(email: string, alertRequest: AlertRequest) {
  const subject = alertRequest.subject || `PowerSight ${alertRequest.severity.toUpperCase()} Alert - ${alertRequest.alertType.replace('_', ' ')}`;
  
  let htmlBody = `
    <html>
      <body>
        <h2 style="color: ${getSeverityColor(alertRequest.severity)};">PowerSight Alert</h2>
        <p><strong>Alert Type:</strong> ${alertRequest.alertType.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Severity:</strong> ${alertRequest.severity.toUpperCase()}</p>
        <p><strong>Message:</strong></p>
        <p>${alertRequest.message}</p>
        ${alertRequest.deviceId ? `<p><strong>Device ID:</strong> ${alertRequest.deviceId}</p>` : ''}
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        ${alertRequest.metadata ? `<p><strong>Additional Info:</strong> ${JSON.stringify(alertRequest.metadata, null, 2)}</p>` : ''}
      </body>
    </html>
  `;

  const command = new SendEmailCommand({
    Source: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8'
        },
        Text: {
          Data: `PowerSight Alert: ${alertRequest.message}`,
          Charset: 'UTF-8'
        }
      }
    }
  });

  await sesClient.send(command);
}

async function sendSMSAlert(phone: string, alertRequest: AlertRequest) {
  const message = `PowerSight ${alertRequest.severity.toUpperCase()} Alert: ${alertRequest.message}${alertRequest.deviceId ? ` (Device: ${alertRequest.deviceId})` : ''}`;

  const command = new SendMessagesCommand({
    ApplicationId: process.env.PINPOINT_APP_ID,
    MessageRequest: {
      Addresses: {
        [phone]: {
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
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#FF0000';
    case 'high': return '#FF6600';
    case 'medium': return '#FFAA00';
    case 'low': return '#00AA00';
    default: return '#000000';
  }
}

async function logAlert(alertRequest: AlertRequest, recipients: any, results: any) {
  try {
    const logEntry = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alert_type: alertRequest.alertType,
      severity: alertRequest.severity,
      message: alertRequest.message,
      device_id: alertRequest.deviceId,
      customer_id: alertRequest.customerId,
      client_id: alertRequest.clientId,
      recipients: recipients,
      results: results,
      metadata: alertRequest.metadata,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const putCommand = new PutCommand({
      TableName: 'AlarmSent', // Reusing existing table for alert logging
      Item: logEntry
    });

    await docClient.send(putCommand);
    console.log('Alert logged successfully');
  } catch (error) {
    console.error('Error logging alert:', error);
    // Don't throw error as logging is not critical
  }
}