

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
/*exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
        body: JSON.stringify('Hello from Lambda!'),
    };
};*/
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });
const sns = new AWS.SNS({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();
const analyzerTableName = 'Analyzer'; // Replace with your Analyzer table name
const contactTableName = 'Contact'; // Replace with your Contact table name
const threshold = 15 * 60 * 1000; // 15 minutes in milliseconds

exports.handler = async (event) => {
  try {
    const customerId = 'customer_id_value'; // Replace with actual customer_id

    // Fetch the Analyzer data
    const analyzerData = await getAnalyzerByCustomerId(customerId);

    if (!analyzerData || analyzerData.length === 0) {
      console.log('No analyzers found for this customer_id');
      return;
    }

    for (const analyzer of analyzerData) {
      const lastUpdatedTime = new Date(analyzer.updatedAt);
      const currentTime = new Date();

      let alertType = null;
      if (currentTime - lastUpdatedTime > threshold && analyzer.communication_status === 'SENDING') {
        alertType = 'DeviceOffline';
      } else if (analyzer.communication_status === 'NOT_SENDING') {
        alertType = 'DeviceOnline';
      }

      if (alertType) {
        // Fetch contacts based on customer_id
        const contacts = await getContactsByCustomerId(customerId);
        if (contacts && contacts.length > 0) {
          for (const contact of contacts) {
            // Send alerts according to contact's preferred channels
            if (contact.alarm_level_email) {
              const emailMessage = generateEmailMessage(alertType, analyzer.ps_analyzer_id);
              await sendEmail(contact.email, 'Device Alert', emailMessage);
            }
            if (contact.alarm_level_sms) {
              const smsMessage = generateSmsMessage(alertType, analyzer.ps_analyzer_id);
              await sendSms(contact.phone, smsMessage);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('Error processing alerts:', error);
  }
};

// Function to get Analyzer data by customer_id
async function getAnalyzerByCustomerId(customerId) {
  const params = {
    TableName: analyzerTableName,
    IndexName: 'byAnalyzerByCustomer',
    KeyConditionExpression: 'customer_id = :customer_id',
    ExpressionAttributeValues: {
      ':customer_id': customerId
    }
  };
  const data = await dynamodb.query(params).promise();
  return data.Items;
}

// Function to get contacts by customer_id
async function getContactsByCustomerId(customerId) {
  const params = {
    TableName: contactTableName,
    IndexName: 'ContactByCustomer',
    KeyConditionExpression: 'customer_id = :customer_id',
    ExpressionAttributeValues: {
      ':customer_id': customerId
    }
  };
  const data = await dynamodb.query(params).promise();
  return data.Items;
}

// Function to send email alerts
async function sendEmail(toEmail, subject, message) {
  const params = {
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Body: {
        Text: { Data: message }
      },
      Subject: { Data: subject }
    },
    Source: 'info@expediusa.com' // Replace with verified SES email
  };

  try {
    await ses.sendEmail(params).promise();
    console.log(`Email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Function to send SMS alerts
async function sendSms(phoneNumber, message) {
  const params = {
    Message: message,
    PhoneNumber: phoneNumber
  };

  try {
    await sns.publish(params).promise();
    console.log(`SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

// Function to generate email message
function generateEmailMessage(alertType, analyzerId) {
  if (alertType === 'DeviceOffline') {
    return `Device ${analyzerId} has stopped sending data.`;
  } else if (alertType === 'DeviceOnline') {
    return `Device ${analyzerId} has resumed sending data.`;
  }
}

// Function to generate SMS message
function generateSmsMessage(alertType, analyzerId) {
  return generateEmailMessage(alertType, analyzerId); // Reusing the same content for SMS
}

