const AWS = require("aws-sdk");

const REGION = process.env.AWS_REGION || "us-west-1";
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: REGION });
const ses = new AWS.SES({ region: REGION });
const pinpoint = new AWS.Pinpoint({ region: REGION });

// Environment variables
const DEDUP_TABLE_NAME = process.env.DEDUP_TABLE_NAME;
const GATEWAY_TABLE = process.env.GATEWAY_TABLE;
const ANALYZER_TABLE = process.env.ANALYZER_TABLE;
const CLIENT_TABLE = process.env.CLIENT_TABLE;
const CUSTOMER_TABLE = process.env.CUSTOMER_TABLE;
const GLOBAL_ALARM_TABLE = process.env.GLOBAL_ALARM_TABLE;
const EMAIL_ALERT_SENT_TABLE = process.env.EMAIL_ALERT_SENT_TABLE;
const GATEWAY_ALARM_TABLE = process.env.GATEWAY_ALARM_TABLE;
const ANALYZER_ALARM_TABLE = process.env.ANALYZER_ALARM_TABLE;
const CUSTOMER_ALARM_TABLE = process.env.CUSTOMER_ALARM_TABLE;
const CLIENT_ALARM_TABLE = process.env.CLIENT_ALARM_TABLE;
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID;

const ALERT_INTERVAL = 60 * 60; // 1 hour in seconds
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL || "support@powersight.com";

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        if (record.eventName !== "MODIFY") continue;

        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
        const deviceId = newImage.device_id;
        const disconnectTime = newImage.disconnect_time;
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
                returne;
            }
            
	    await markAsProcessed(eventId);
	}

        if (!disconnectTime) {
            console.log(`No disconnect time provided for device ${deviceId}, skipping.`);
            return;
        }

        let deviceData = await getDeviceData(deviceId);
        if (!deviceData) {
            console.log(`Device ${deviceId} not found in Gateway or Analyzer tables. Exiting function.`);
            return;
        }

        let { client_id, customer_id, device_type, enable_or_disable_alarm, id } = deviceData;

        if (enable_or_disable_alarm) {
            console.log(`Override enabled at device level for ${deviceId}, ending process.`);
            return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeDifference = currentTime - disconnectTime;

        let { closestAlarmInterval, alarmLevel } = await determineBreachedAlarm(
            device_type,
            id,
            client_id,
            customer_id,
            timeDifference
        );

        if (!closestAlarmInterval) {
            console.log(`No alarm threshold breached for device ${deviceId}, ending process.`);
            return;
        }

        let contacts = await getContacts(client_id);
        if (!contacts.length) {
            console.log(`No contacts found for client ${client_id}, ending process.`);
            return;
        }

        for (let contact of contacts) {
            if (contact.alarm_level_email === alarmLevel) {
                await sendEmail(deviceId, contact.email);
            }
            if (contact.alarm_level_phone === alarmLevel) {
                await sendSMS(contact.phone, `Alert: Device ${deviceId} Disconnected`);
            }
            if (contact.alarm_level_sms === alarmLevel) {
                await sendVoiceMessage(contact.phone, `Alert: Device ${deviceId} Disconnected`);
            }
        }

        await updateEmailSentTable(deviceId, currentTime);
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

// Function to determine which alarm level has been breached
async function determineBreachedAlarm(deviceType, deviceId, clientId, customerId, timeDifference) {
    let alarmIntervals = [];
    
    let deviceAlarm = await getAlarmInterval(deviceType === "Gateway" ? GATEWAY_ALARM_TABLE : ANALYZER_ALARM_TABLE, deviceId);
    let clientAlarm = await getAlarmInterval(CLIENT_ALARM_TABLE, clientId);
    let customerAlarm = await getAlarmInterval(CUSTOMER_ALARM_TABLE, customerId);
    let globalAlarm = await getGlobalAlarmInterval();

    [deviceAlarm, clientAlarm, customerAlarm, globalAlarm].forEach(alarm => {
        if (alarm && timeDifference >= alarm.interval) {
            alarmIntervals.push(alarm);
        }
    });

    if (alarmIntervals.length === 0) return { closestAlarmInterval: null, alarmLevel: null };

    let closestAlarm = alarmIntervals.reduce((prev, curr) => {
        return Math.abs(timeDifference - prev.interval) < Math.abs(timeDifference - curr.interval) ? prev : curr;
    });

    return { closestAlarmInterval: closestAlarm.interval, alarmLevel: closestAlarm.level };
}

// Function to get alarm interval from a specific table
async function getAlarmInterval(table, id) {
    const params = {
        TableName: table,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: { ":id": id }
    };

    try {
        const result = await dynamoDB.query(params).promise();
        return result.Items.length > 0 ? { interval: result.Items[0].alarm_interval, level: result.Items[0].alarm_level } : null;
    } catch (error) {
        console.error(`Error querying ${table} for ID ${id}:`, error);
        return null;
    }
}

// Function to get global alarm interval
async function getGlobalAlarmInterval() {
    try {
        const result = await dynamoDB.scan({ TableName: GLOBAL_ALARM_TABLE }).promise();
        return result.Items.length > 0 ? { interval: result.Items[0].alarm_interval, level: result.Items[0].alarm_level } : null;
    } catch (error) {
        console.error("Error checking global alarm levels:", error);
        return null;
    }
}

// Function to send an email
async function sendEmail(deviceId, recipientEmail) {
    if (!recipientEmail) return;
    
    const params = {
        Source: SES_SENDER_EMAIL,
        Destination: { ToAddresses: [recipientEmail] },
        Message: {
            Subject: { Data: `Alert: Device ${deviceId} Disconnected` },
            Body: { Text: { Data: `Device ${deviceId} has been disconnected for a critical time. Immediate action required.` } }
        }
    };

    try {
        await ses.sendEmail(params).promise();
        console.log(`Email sent successfully to ${recipientEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

// Function to send SMS via AWS Pinpoint
async function sendSMS(phoneNumber, message) {
    if (!phoneNumber || !PINPOINT_APP_ID) return;

    const params = {
        ApplicationId: PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: { [phoneNumber]: { ChannelType: "SMS" } },
            MessageConfiguration: { SMSMessage: { Body: message, MessageType: "TRANSACTIONAL" } }
        }
    };

    try {
        await pinpoint.sendMessages(params).promise();
        console.log(`SMS sent successfully to ${phoneNumber}`);
    } catch (error) {
        console.error("Error sending SMS:", error);
    }
}

// Function to send a voice message via AWS Pinpoint
async function sendVoiceMessage(phoneNumber, message) {
    if (!phoneNumber || !PINPOINT_APP_ID) return;

    const params = {
        ApplicationId: PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: { [phoneNumber]: { ChannelType: "VOICE" } },
            MessageConfiguration: { VoiceMessage: { Body: message, LanguageCode: "en-US", VoiceId: "Joanna" } }
        }
    };

    try {
        await pinpoint.sendMessages(params).promise();
        console.log(`Voice message sent successfully to ${phoneNumber}`);
    } catch (error) {
        console.error("Error sending voice message:", error);
    }
}

