/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	senderEMail
Amplify Params - DO NOT EDIT */

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
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

const TABLE_NAME = process.env.TABLE_NAME; // Change to your DynamoDB table name
const SENDER_EMAIL = process.env.senderEMail; // Change to your DynamoDB table name
const EMAIL_RECIPIENTS = ["contact@businesscompassllc.us"]; // Change to your alert recipients

// Define alert thresholds in seconds (e.g., 10 min, 30 min, 60 min)
const ALARM_THRESHOLDS = [10 * 60, 30 * 60, 60 * 60]; 

exports.handler = async (event) => {
    const currentTime = Math.floor(Date.now() / 1000); // Current epoch time
    
    try {
        const devices = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        
        for (const device of devices.Items || []) {
            const deviceId = device.device_id;
            const lastSeen = device.last_seen;
            let alertLevel = device.alert_level || 0;

            const elapsedTime = currentTime - lastSeen;

            // Determine if an alert needs to be sent
            for (let level = 0; level < ALARM_THRESHOLDS.length; level++) {
                if (elapsedTime >= ALARM_THRESHOLDS[level] && alertLevel < level + 1) {
                    await sendEmail(deviceId, ALARM_THRESHOLDS[level] / 60, level + 1);
                    
                    // Update alert level in DynamoDB
                    await dynamoDB.update({
                        TableName: TABLE_NAME,
                        Key: { device_id: deviceId },
                        UpdateExpression: "SET alert_level = :level",
                        ExpressionAttributeValues: { ":level": level + 1 }
                    }).promise();
                    
                    break; // Only send one alert per run
                }
            }
        }

        return { status: "Monitoring completed" };
    } catch (error) {
        console.error("Error monitoring devices:", error);
        return { status: "error", message: error.message };
    }
};

// Function to send email alerts
async function sendEmail(deviceId, minutes, alertLevel) {
    const subject = `Alert: Device ${deviceId} Offline for ${minutes} Minutes`;
    const body = `Device ${deviceId} has not sent data for ${minutes} minutes. Please investigate.`;

    const params = {
        Source: senderEMail, // Change to your verified SES email
        Destination: { ToAddresses: EMAIL_RECIPIENTS },
        Message: {
            Subject: { Data: subject },
            Body: { Text: { Data: body } }
        }
    };

    await ses.sendEmail(params).promise();
    console.log(`Sent alert level ${alertLevel} for device ${deviceId}`);
}

