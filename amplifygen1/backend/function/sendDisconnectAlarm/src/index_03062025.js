/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	TABLE_NAME
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

const AWS = require("aws-sdk");

// Get the AWS region dynamically from the environment variable
const REGION = process.env.AWS_REGION || "us-west-1";

const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: REGION });
const ses = new AWS.SES({ region: REGION });

// Environment variables
const TABLE_NAME = process.env.TABLE_NAME;
const DEDUP_TABLE_NAME = process.env.DEDUP_TABLE_NAME;
const SES_RECIPIENT_EMAIL = process.env.SES_RECIPIENT_EMAIL;
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL || 'support@powersight.com';
const EMAIL_ALERT_SENT_TABLE = process.env.EMAIL_ALERT_SENT_TABLE;
const ALERT_INTERVAL = 60 * 60; // 1 hour in seconds

// Function to check if an email was sent in the last hour
async function checkEmailSent(deviceId, currentTime) {
    try {
        const result = await dynamoDB.get({
            TableName: EMAIL_ALERT_SENT_TABLE,
            Key: { device_id: deviceId }
        }).promise();

        if (!result.Item || (currentTime - result.Item.email_sent) > ALERT_INTERVAL) {
            return true; // No record found or more than an hour has passed
        }

        return false; // Email was sent within the last hour
    } catch (error) {
        console.error(`Error checking email sent table for device ${deviceId}:`, error);
        return false;
    }
}

// Function to update the email sent timestamp
async function updateEmailSentTable(deviceId, currentTime) {
    try {
        await dynamoDB.put({
            TableName: EMAIL_ALERT_SENT_TABLE,
            Item: {
                device_id: deviceId,
                email_sent: currentTime
            }
        }).promise();
        console.log(`Updated email sent timestamp for device ${deviceId}`);
    } catch (error) {
        console.error(`Error updating email sent table for device ${deviceId}:`, error);
    }
}

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        if (record.eventName !== "MODIFY") continue; // Process only updates

        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);

        // Extract device ID and status
        const deviceId = newImage.id; // Assuming `id` is the primary key
        const newStatus = newImage.status;
        const oldStatus = oldImage.status;

        // Check if status changed to "disconnected"
        if (oldStatus !== "disconnected" && newStatus === "disconnected") {
            console.log(`Device ${deviceId} changed to disconnected.`);

            const eventId = record.eventID; // Unique event identifier

            // Check if this event was already processed
            const isDuplicate = await checkDuplicate(eventId);
            if (isDuplicate) {
                console.log(`Duplicate event detected: ${eventId}, skipping.`);
                continue;
            }

            const currentTime = Math.floor(Date.now() / 1000); // Current epoch time
	    const shouldSendEmail = await checkEmailSent(deviceId, currentTime);

            // Send an email notification
            if (shouldSendEmail) {
		    await sendEmail(deviceId, newStatus);
		     await updateEmailSentTable(deviceId, currentTime);
       	}

            // Store the processed event in DynamoDB with a TTL
            await markAsProcessed(eventId);
        }
    }
};

/**
 * Checks if an event has already been processed using DEDUP_TABLE.
 */
async function checkDuplicate(eventId) {
    const params = {
        TableName: DEDUP_TABLE_NAME,
        Key: { eventid: eventId }
    };

    try {
        const result = await dynamoDB.get(params).promise();
        return !!result.Item; // Returns true if the event exists
    } catch (error) {
        console.error("Error checking duplicate event:", error);
        return false;
    }
}

/**
 * Marks an event as processed in DEDUP_TABLE with TTL (expires after 24 hours).
 */
async function markAsProcessed(eventId) {
    const ttl = Math.floor(Date.now() / 1000) + 86400; // Current epoch time + 24 hours

    const params = {
        TableName: DEDUP_TABLE_NAME,
        Item: {
            eventid: eventId,
            TTL: ttl
        }
    };

    try {
        await dynamoDB.put(params).promise();
        console.log(`Event ${eventId} marked as processed with TTL.`);
    } catch (error) {
        console.error("Error marking event as processed:", error);
    }
}

/**
 * Sends an email notification using AWS SES.
 */
async function sendEmail(deviceId, status) {
    const params = {
        Source: SES_SENDER_EMAIL,
        Destination: {
            ToAddresses: [SES_RECIPIENT_EMAIL]
        },
        Message: {
            Subject: {
                Data: `Alert: Device ${deviceId} Disconnected`
            },
            Body: {
                Text: {
                    Data: `ALERT: Device ${deviceId} has changed status to ${status}. Immediate action required.`
                }
            }
        }
    };

    try {
        await ses.sendEmail(params).promise();
        console.log(`Email sent successfully to ${SES_RECIPIENT_EMAIL}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

