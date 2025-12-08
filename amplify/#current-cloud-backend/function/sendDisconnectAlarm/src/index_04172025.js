/*
✅ checkDuplicate – Prevents duplicate event processing.
✅ markAsProcessed – Logs processed events in the deduplication table.
✅ getDeviceData – Determines if the device is a Gateway or Analyzer.
✅ determineBreachedAlarm – Determines the closest alarm threshold breached.
✅ getAlarmInterval – Retrieves alarm settings from Gateway, Analyzer, Client, Customer tables.
✅ getGlobalAlarmInterval – Retrieves the global alarm settings.
✅ getAdminAlarmInterval – Retrieves Admin-level alarm settings.
✅ getAdminContacts – Retrieves Admin contacts for sending alarms.
✅ getContacts – Retrieves Client contacts for sending alarms.
✅ sendAlarm – Determines the correct delivery method (Email, SMS, Voice).
✅ sendEmail – Sends email alerts via AWS SES.
✅ sendSMS – Sends SMS alerts via AWS Pinpoint.
✅ sendVoiceMessage – Sends voice alerts via AWS Pinpoint.
✅ logAlarmSent – Logs the sent alarm in AlarmSent table.
*/

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
const ALARM_SENT_TABLE = process.env.ALARM_SENT_TABLE;
const ADMIN_ALARM_LEVEL_TABLE = process.env.ADMIN_ALARM_LEVEL_TABLE;
const ADMIN_CONTACT_TABLE = process.env.ADMIN_CONTACT_TABLE;
const GATEWAY_ALARM_TABLE = process.env.GATEWAY_ALARM_TABLE;
const ANALYZER_ALARM_TABLE = process.env.ANALYZER_ALARM_TABLE;
const CUSTOMER_ALARM_TABLE = process.env.CUSTOMER_ALARM_TABLE;
const CLIENT_ALARM_TABLE = process.env.CLIENT_ALARM_TABLE;
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID;

const ALERT_INTERVAL = 60 * 60;
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL || "support@powersight.com";

exports.handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        if (record.eventName !== "MODIFY") continue;

        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const deviceId = newImage.id;
        const disconnectTime = newImage.disconnected_timestamp/1000.0; //disconnect_time is in milli-seconds
        const eventId = record.eventID;

        if (!disconnectTime) {
            console.log(`No disconnect time provided for device ${deviceId}, skipping.`);
            return;
        }

        if (await checkDuplicate(eventId)) {
            console.log(`Duplicate event detected: ${eventId}, skipping.`);
            return;
        }

        await markAsProcessed(eventId);

        const currentTime = Math.floor(Date.now() / 1000);
        const timeDifference = currentTime - disconnectTime;

	console.log(`time difference ${timeDifference}`);

        let deviceData = await getDeviceData(deviceId);
        if (!deviceData) {
            console.log(`Device ${deviceId} not found in Gateway or Analyzer tables. Exiting function.`);
            return;
        }

	console.log('deviceData :',deviceData);

        let { client_id, customer_id, device_type, enable_or_disable_alarm, id } = deviceData;
    

        let adminAlarm = await getAdminAlarmInterval(deviceData.device_type,timeDifference);
	console.log('adminAlarm :',adminAlarm);

        if (adminAlarm && timeDifference >= adminAlarm.interval) {
            console.log(`Disconnected for ${timeDifference}, Admin alarm threshold ${adminAlarm.level} breached for device ${deviceId}, sending admin alarms.`);

            let adminContacts = await getAdminContacts(adminAlarm.level);
            for (let contact of adminContacts) {
		console.log("Contact:", contact); 
                await sendAlarm(deviceId, contact, adminAlarm.level);
                await logAlarmSent(deviceData.id, device_type, deviceId, currentTime, contact, adminAlarm.level);
            }
            //logAlarmSent(deviceData.id, device_type, deviceId, timestamp, alarm_delivery_method, recipient) {

            //await logAlarmSent(deviceId, device_type, currentTime, "Admin");
        }


        if (enable_or_disable_alarm) {
            console.log(`Override enabled at device level for ${deviceId}, ending process.`);
            return;
        }

        const alarmOverride = await getClientOrCustomerAlarmOverride(client_id, customer_id);

        if (alarmOverride) {
            const idType = client_id ? `client ${client_id}` : `customer ${customer_id}`;
            console.log(`Alarm override enabled at ${idType} level for device ${deviceId}, skipping alarm.`);
            return;
        }
        

        let { closestAlarmInterval, alarmLevel } = await determineBreachedAlarm(device_type, id, client_id, customer_id, timeDifference);

        if (!closestAlarmInterval) {
            console.log(`No alarm threshold breached for device ${deviceId}, ending process.`);
            return;
        }



        let contacts = await getContacts(client_id, customer_id);

        if (!contacts.length) {
            const idType = client_id ? `client ${client_id}` : `customer ${customer_id}`;
            console.log(`No contacts found for ${idType}, ending process.`);
            return;
        }
        

        for (let contact of contacts) {
            await sendAlarm(deviceId, contact, alarmLevel);
        }

        await logAlarmSent(deviceId, device_type, currentTime, "Client");
    }
};

async function checkDuplicate(eventId) {
    const params = { TableName: DEDUP_TABLE_NAME, Key: { eventid: eventId } };

    try {
        const result = await dynamoDB.get(params).promise();
        return !!result.Item;
    } catch (error) {
        console.error("Error checking duplicate event:", error);
        return false;
    }
}

async function markAsProcessed(eventId) {
    const ttl = Math.floor(Date.now() / 1000) + 86400;

    const params = { TableName: DEDUP_TABLE_NAME, Item: { eventid: eventId, TTL: ttl } };

    try {
        await dynamoDB.put(params).promise();
        console.log(`Event ${eventId} marked as processed with TTL.`);
    } catch (error) {
        console.error("Error marking event as processed:", error);
    }
}

async function determineBreachedAlarm(deviceType, deviceId, clientId, customerId, timeDifference) {
    let alarmIntervals = [
        await getAlarmInterval(deviceType === "Gateway" ? GATEWAY_ALARM_TABLE : ANALYZER_ALARM_TABLE, deviceId),
        await getAlarmInterval(CLIENT_ALARM_TABLE, clientId),
        await getAlarmInterval(CUSTOMER_ALARM_TABLE, customerId)//,
        //await getGlobalAlarmInterval()
    ].filter(Boolean);

    if (alarmIntervals.length === 0) return { closestAlarmInterval: null, alarmLevel: null };

    let closestAlarm = alarmIntervals.reduce((prev, curr) => Math.abs(timeDifference - prev.interval) < Math.abs(timeDifference - curr.interval) ? prev : curr);

    return { closestAlarmInterval: closestAlarm.interval, alarmLevel: closestAlarm.level };
}

async function getAlarmInterval(table, id) {
    try {
        const result = await dynamoDB.query({ TableName: table, KeyConditionExpression: "id = :id", ExpressionAttributeValues: { ":id": id } }).promise();
        return result.Items.length > 0 ? { interval: result.Items[0].alarm_interval, level: result.Items[0].alarm_level } : null;
    } catch (error) {
        console.error(`Error querying ${table} for ID ${id}:`, error);
        return null;
    }
}

// Function to get global alarm interval
/*
async function getGlobalAlarmInterval() {
    try {
        const result = await dynamoDB.scan({ TableName: GLOBAL_ALARM_TABLE }).promise();
        return result.Items.length > 0 ? { interval: result.Items[0].alarm_interval, level: result.Items[0].alarm_level } : null;
    } catch (error) {
        console.error("Error checking global alarm levels:", error);
        return null;
    }
}
*/

/** FUNCTION TO GET ADMIN ALARM INTERVAL FOR GIVEN DEVICE TYPE **/
/*
async function getAdminAlarmInterval(deviceType) {
    const params = {
        TableName: ADMIN_ALARM_LEVEL_TABLE,
        FilterExpression: "device_type = :type",
        ExpressionAttributeValues: {
            ":type": deviceType
        }
    };

    try {
        const result = await dynamoDB.scan(params).promise();
        if (result.Items.length > 0) {
            const alarm = result.Items[0];
            return {
                interval: alarm.alarm_interval,
                level: alarm.alarm_level
            };
        }
        return null;
    } catch (error) {
        console.error(`Error checking Admin alarm levels for device type ${deviceType}:`, error);
        return null;
    }
}
*/

/** FUNCTION TO GET ADMIN ALARM INTERVAL FOR GIVEN DEVICE TYPE AND TIME DIFFERENCE **/
async function getAdminAlarmInterval(deviceType, timeDifference) {
    const params = {
        TableName: ADMIN_ALARM_LEVEL_TABLE,
        FilterExpression: "device_type = :type",
        ExpressionAttributeValues: {
            ":type": deviceType
        }
    };

    try {
        const result = await dynamoDB.scan(params).promise();

        if (!result.Items || result.Items.length === 0) return null;

        // Filter items where the interval is less than or equal to the time difference
        const applicable = result.Items.filter(item => timeDifference >= item.alarm_interval);

        if (applicable.length === 0) return null;

        // Find the one with the closest interval to the timeDifference
        const closest = applicable.reduce((prev, curr) => {
            return Math.abs(timeDifference - curr.alarm_interval) < Math.abs(timeDifference - prev.alarm_interval) ? curr : prev;
        });

        return {
            interval: closest.alarm_interval,
            level: closest.alarm_level
        };
    } catch (error) {
        console.error(`Error checking Admin alarm levels for device type ${deviceType}:`, error);
        return null;
    }
}

/** FUNCTION TO GET ADMIN CONTACTS **/
async function getAdminContacts(alarmLevel) {
    try {
        const result = await dynamoDB.scan({ TableName: ADMIN_CONTACT_TABLE }).promise();
        return result.Items.filter(contact =>
            contact.alarm_level_email === alarmLevel ||
            contact.alarm_level_phone === alarmLevel ||
            contact.alarm_level_sms === alarmLevel
        );
    } catch (error) {
        console.error("Error fetching Admin contacts:", error);
        return [];
    }
}

async function sendAlarm(deviceId, contact, alarmLevel) {
    console.log(`sendAlarm deviceId ${deviceId} contact email ${contact.email} phone ${contact.phone} alarm level ${alarmLevel}`)
	
    if (contact.alarm_level_email === alarmLevel) await sendEmail(deviceId, contact.email);
    if (contact.alarm_level_phone === alarmLevel) await sendSMS(contact.phone, `Alarm ${alarmLevel} : Device ${deviceId} Disconnected`);
    if (contact.alarm_level_sms === alarmLevel) await sendVoiceMessage(contact.phone, `Alarm ${alarmLevel} : Device ${deviceId} Disconnected`);
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

/** FUNCTION TO LOG ALARM SENT **/
async function logAlarmSent(deviceId, device_type, crsm, timestamp, contact, alarm_level) {

    var alarm_delivery_method = '';
    var recepient = '';

    if (contact.alarm_level_email === alarm_level) {
	    recepient=contact.email;
	    alarm_delivery_method='EMAIL';
    }
	else if (contact.alarm_level_phone === alarm_level) {
	    recepient=contact.phone;
	    alarm_delivery_method='PHONE';
    }
	else if (contact.alarm_level_sms === alarm_level) {
	    recepient=contact.sms;
	    alarm_delivery_method='SMS';
    }

    const params = {
        TableName: ALARM_SENT_TABLE,
        Item: {
            id: AWS.util.uuid.v4(),
            device_id: deviceId,
	    device_type: device_type,
	    crsm: crsm,
            alarm_sent_at: timestamp,
            alarm_delivery_method: alarm_delivery_method,
            alarm_recipient: recepient
        }
    };

    try {
        await dynamoDB.put(params).promise();
        console.log(`Alarm logged for device ${deviceId}`);
    } catch (error) {
        console.error("Error logging alarm:", error);
    }
}

/** FUNCTION TO GET DEVICE DATA **/
async function getDeviceData(deviceId) {
	console.log(`in getDeviceData id ${deviceId}`);

    let gatewayParams = {
        TableName: GATEWAY_TABLE,
        IndexName: "byGatewayBycrsm",
        KeyConditionExpression: "crsm = :deviceId",
        ExpressionAttributeValues: { ":deviceId": deviceId }
    };

    try {
        let gatewayResult = await dynamoDB.query(gatewayParams).promise();
        if (gatewayResult.Items.length > 0) {
            let gateway = gatewayResult.Items[0];
            if (gateway.active_inactive_status === "Active" && gateway.allocated_unallocated_status === "Allocated") {
                return { 
                    id: gateway.id,
                    client_id: gateway.client_id,
                    customer_id: gateway.customer_id,
                    device_type: "Gateway",
                    enable_or_disable_alarm: gateway.enable_or_disable_alarm
                };
            }
        }
    } catch (error) {
        console.error("Error querying Gateway table:", error);
    }

    let analyzerParams = {
        TableName: ANALYZER_TABLE,
        IndexName: "byAnalyzerBycrsm",
        KeyConditionExpression: "crsm = :deviceId",
        ExpressionAttributeValues: { ":deviceId": deviceId }
    };

    try {
        let analyzerResult = await dynamoDB.query(analyzerParams).promise();
        if (analyzerResult.Items.length > 0) {
            let analyzer = analyzerResult.Items[0];
            if (analyzer.active_inactive_status === "Active" && analyzer.assigned_unassigned_status === "Assigned") {
                return {
                    id: analyzer.id,
                    client_id: analyzer.client_id,
                    customer_id: analyzer.customer_id,
                    device_type: "Analyzer",
                    enable_or_disable_alarm: analyzer.enable_or_disable_alarm
                };
            }
        }
    } catch (error) {
        console.error("Error querying Analyzer table:", error);
    }

    return null;
}

async function getContacts(clientId, customerId) {
    const params = {
        TableName: CONTACT_TABLE,
    };

    if (clientId) {
        params.IndexName = "ContactByClient";
        params.KeyConditionExpression = "client_id = :id";
        params.ExpressionAttributeValues = { ":id": clientId };
    } else if (customerId) {
        params.IndexName = "ContactByCustomer";
        params.KeyConditionExpression = "customer_id = :id";
        params.ExpressionAttributeValues = { ":id": customerId };
    } else {
        console.log("Neither client_id nor customer_id provided to fetch contacts.");
        return [];
    }

    try {
        const result = await dynamoDB.query(params).promise();
        return result.Items.map(item => ({
            email: item.email,
            phone: item.phone,
            alarm_level_email: item.alarm_level_email,
            alarm_level_phone: item.alarm_level_phone,
            alarm_level_sms: item.alarm_level_sms
        }));
    } catch (error) {
        console.error("Error querying contacts:", error);
        return [];
    }
}

async function getClientOrCustomerAlarmOverride(clientId, customerId) {
    try {
        if (clientId) {
            const client = await dynamoDB.get({
                TableName: CLIENT_TABLE,
                Key: { id: clientId }
            }).promise();

            return client.Item?.enable_or_disable_alarm === true;
        } else if (customerId) {
            const customer = await dynamoDB.get({
                TableName: CUSTOMER_TABLE,
                Key: { id: customerId }
            }).promise();

            return customer.Item?.enable_or_disable_alarm === true;
        }
    } catch (error) {
        console.error("Error checking client/customer alarm override:", error);
    }
    return false;
}

async function clearAlarmType(deviceType, deviceId) {
    const table = deviceType === "Gateway" ? GATEWAY_TABLE : ANALYZER_TABLE;

    const params = {
        TableName: table,
        Key: { id: deviceId },
        UpdateExpression: "SET alarm_type = :val",
        ExpressionAttributeValues: {
            ":val": "None"
        }
    };

    try {
        await dynamoDB.update(params).promise();
        console.log(`Alarm type cleared for ${deviceType} ${deviceId}`);
    } catch (error) {
        console.error(`Failed to clear alarm_type for ${deviceType} ${deviceId}`, error);
    }
}

