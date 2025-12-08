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
const pinpoint = new AWS.Pinpoint({ region: process.env.PINPOINT_REGION });

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
const ORIGINATION_NUMBER = process.env.ORIGINATION_NUMBER;
const ALARM_MESSAGE_TABLE = process.env.ALARM_MESSAGE_TABLE;

const ALERT_INTERVAL = 60 * 60;
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL || "support@powersight.com";

const oneMinuteMs = 60 * 1000;

const { DateTime } = require('luxon');
const tzLookup = require('tz-lookup');


const connectionScanParams = { TableName: process.env.CONNECTION_TABLE };

exports.handler = async (event) => {
    //console.log("Received event:", JSON.stringify(event, null, 2));

    const now = Date.now(); // current time in milliseconds

    // Scan Results need to be inside the event to ensure the contents are cleared out
    let scanResults = [];
    let seenIds = new Set();

    let lastEvaluatedKey = null;
    let gateway = null;
    let analyzer = null;

    console.log(`now ${now}`);

    //sendSMS('+19739440408', 'Test');
    //	sendVoiceMessage('+19739440408', 'Test');

    do {
        const result = await dynamoDB.scan({
            ...connectionScanParams,
            ConsistentRead: true, // ✅ ensures strong consistency if base table
            ExclusiveStartKey: lastEvaluatedKey
        }).promise();

        //scanResults.push(...result.Items);
        if (result.Items) {
            for (const item of result.Items) {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    scanResults.push(item);
                }
            }
        }

        lastEvaluatedKey = result.LastEvaluatedKey;

        console.log(`Fetched ${scanResults.length} records so far`);
        console.log("LastEvaluatedKey:", lastEvaluatedKey);

    } while (lastEvaluatedKey);



    // Print the specific device if found
    //const targetDevice = scanResults.find(d => d.id === "8944501411219946534");
    //const targetDevice = scanResults.find(d => d.id );
    //
    //if (targetDevice) {
    //   console.log("Target device found:", JSON.stringify(targetDevice, null, 2));
    //    } else {
    //console.log("Device with ID 8944501411219946534 not found in disconnected devices.");
    //       console.log("Device with ID not found in disconnected devices.");
    //  }

    // Only disconnected devices that have been disconnected for at least 1 minute
    const disconnectedDevices = scanResults.filter(record => {
        return record.status === "disconnected" &&
            record.disconnected_timestamp &&
            now - record.disconnected_timestamp >= oneMinuteMs &&
            record.disconnectReason === "MQTT_KEEP_ALIVE_TIMEOUT" &&
            //!(record.id && record.id.startsWith("iotconsole")) && record.id == '8944501411219946534';
            !(record.id && record.id.startsWith("iotconsole"));
    });

    console.log(`Total disconnected devices to process: ${disconnectedDevices.length}`);
    console.log("Filtered disconnected devices (MQTT_KEEP_ALIVE_TIMEOUT, >= 1 minute):", JSON.stringify(disconnectedDevices, null, 2));


    for (const record of disconnectedDevices) {
        const deviceId = record.id;
        const disconnectTime = record.disconnected_timestamp;
        const currentTime = Date.now();
        const timeDifference = Math.floor((currentTime - disconnectTime) / 1000); // in seconds
        const disconnectReason = record.disconnectReason;

        /*
            const eventId = `cloudwatch-${deviceId}-${disconnectTime}`; // Unique eventId
    
            if (await checkDuplicate(eventId)) {
                console.log(`Duplicate event detected: ${eventId}, skipping.`);
                continue;
            }
    
            await markAsProcessed(eventId);
            */
        /*for (const record of event.Records) {
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
            */

        let deviceData = await getDeviceData(deviceId);
        if (!deviceData) {
            console.log(`Device ${deviceId} not found in Gateway or Analyzer tables. Exiting function.`);
            continue; // continue to the next record
        }

        // Adding in disconnect reason for alarm message
        if (deviceData.gateway) {
            deviceData.gateway.disconnectReason = disconnectReason || "unknown";
        }
        
        if (deviceData.analyzer) {
            deviceData.analyzer.disconnectReason = disconnectReason || "unknown";
        }
        
        console.log('deviceData :', deviceData);

        if (deviceData.gateway) {
            console.log("Processing gateway logic...", JSON.stringify(deviceData.gateway, null, 2));
            let { id, client_id, customer_id, device_type, enable_or_disable_alarm } = deviceData.gateway;


            let adminAlarm = await getAdminAlarmInterval(device_type, timeDifference);
            console.log('adminAlarm :', adminAlarm);

            if (adminAlarm && timeDifference >= adminAlarm.interval) {
                console.log(`Disconnected for ${timeDifference}, Admin alarm threshold ${adminAlarm.level} breached for device ${deviceId}, sending admin alarms.`);
                
                // Need to add the interval to the device so the message content can be updated
                deviceData.gateway.alarmInterval = formatInterval(adminAlarm.interval);

                let adminContacts = await getAdminContacts(adminAlarm.level);
                for (let contact of adminContacts) {
                    console.log("Contact:", contact);
                    var localTime = getLocalTimeFromGpsLocation("", disconnectTime, true);
                    await sendAlarm(deviceId, deviceData.gateway, contact, adminAlarm.level, localTime);
                    await logAlarmSent(deviceData.id, device_type, deviceId, currentTime, contact, adminAlarm.level);
                }
            }
            else{
                console.log('No Admin Alarm')
            }
            
            if (enable_or_disable_alarm) {
                console.log(`Override enabled at device level for ${deviceId}, ending process.`);
                continue;
            }

            const alarmOverride = await getClientOrCustomerAlarmOverride(client_id, customer_id);

            if (alarmOverride) {
                const idType = client_id ? `client ${client_id}` : `customer ${customer_id}`;
                console.log(`Alarm override enabled at ${idType} level for device ${deviceId}, skipping alarm.`);
                continue;
            }

            let { closestAlarmInterval, alarmLevel } = await determineBreachedAlarm(device_type, id, client_id, customer_id, timeDifference);

            if (!closestAlarmInterval) {
                console.log(`No alarm threshold breached for device ${deviceId}, ending process.`);
                continue;
            }

            let contacts = await getContacts(client_id, customer_id);

            if (!contacts.length) {
                const idType = client_id ? `client ${client_id}` : `customer ${customer_id}`;
                console.log(`No contacts found for ${idType}, ending process.`);
                continue;
            }
            
            // Need to add the interval to the device so the message content can be updated
            deviceData.gateway.alarmInterval = formatInterval(closestAlarmInterval);

            for (let contact of contacts) {
                await sendAlarm(deviceId, deviceData.gateway, contact, alarmLevel);
            }

            await logAlarmSent(deviceId, device_type, currentTime, "Client");
        }

        if (deviceData.analyzer) {
            console.log("Processing analyzer  logic...", JSON.stringify(deviceData.analyzer, null, 2));
            let { id, client_id, customer_id, device_type, enable_or_disable_alarm } = deviceData.analyzer;


            let adminAlarm = await getAdminAlarmInterval(device_type, timeDifference);
            console.log('adminAlarm :', adminAlarm);

            if (adminAlarm && timeDifference >= adminAlarm.interval) {
                console.log(`Disconnected for ${timeDifference}, Admin alarm threshold ${adminAlarm.level} breached for device ${deviceId}, sending admin alarms.`);
                
                // Need to add the interval to the device so the message content can be updated
                deviceData.analyzer.alarmInterval = formatInterval(adminAlarm.interval);
                
                let adminContacts = await getAdminContacts(adminAlarm.level);
                for (let contact of adminContacts) {
                    console.log("Contact:", contact);
                    var localTime = getLocalTimeFromGpsLocation("", disconnectTime, true);
                    await sendAlarm(deviceId, deviceData.analyzer, contact, adminAlarm.level, localTime);
                    await logAlarmSent(deviceData.id, device_type, deviceId, currentTime, contact, adminAlarm.level);
                }
            }
            if (enable_or_disable_alarm) {
                console.log(`Override enabled at device level for ${deviceId}, ending process.`);
                continue;
            }

            const alarmOverride = await getClientOrCustomerAlarmOverride(client_id, customer_id);

            if (alarmOverride) {
                const idType = client_id ? `client ${client_id}` : `customer ${customer_id}`;
                console.log(`Alarm override enabled at ${idType} level for device ${deviceId}, skipping alarm.`);
                continue;
            }

            let { closestAlarmInterval, alarmLevel } = await determineBreachedAlarm(device_type, id, client_id, customer_id, timeDifference);

            if (!closestAlarmInterval) {
                console.log(`No alarm threshold breached for device ${deviceId}, ending process.`);
                continue;
            }

            let contacts = await getContacts(client_id, customer_id);

            if (!contacts.length) {
                const idType = client_id ? `client ${client_id}` : `customer ${customer_id}`;
                console.log(`No contacts found for ${idType}, ending process.`);
                continue;
            }

            // Need to add the interval to the device so the message content can be updated
            deviceData.analyzer.alarmInterval = formatInterval(closestAlarmInterval);

            for (let contact of contacts) {
                await sendAlarm(deviceId, deviceData.analyzer, contact, alarmLevel);
            }

            await logAlarmSent(deviceId, device_type, currentTime, "Client");
        }

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
    const MATCH_WINDOW = 60; // seconds

    const sources = [
        await getAlarmInterval(deviceType === "Gateway" ? GATEWAY_ALARM_TABLE : ANALYZER_ALARM_TABLE, deviceId),
        await getAlarmInterval(CLIENT_ALARM_TABLE, clientId),
        await getAlarmInterval(CUSTOMER_ALARM_TABLE, customerId),
        await getGlobalAlarmInterval()
    ].filter(Boolean);

    const applicable = sources.filter(alarm => {
        return timeDifference >= Number(alarm.alarm_interval) &&
               timeDifference < Number(alarm.alarm_interval) + MATCH_WINDOW;
    });

    if (applicable.length === 0) {
        return { closestAlarmInterval: null, alarmLevel: null };
    }

    const closest = applicable.reduce((prev, curr) => {
        return Math.abs(timeDifference - curr.alarm_interval) < Math.abs(timeDifference - prev.alarm_interval) ? curr : prev;
    });

    return {
        closestAlarmInterval: closest.alarm_interval,
        alarmLevel: closest.level
    };
}

// async function determineBreachedAlarm(deviceType, deviceId, clientId, customerId, timeDifference) {
//     console.log(`determineBreachedAlarm ${deviceType} ${deviceId} ${clientId} ${customerId} ${timeDifference}`);
//     let alarmIntervals = [
//         await getAlarmInterval(deviceType === "Gateway" ? GATEWAY_ALARM_TABLE : ANALYZER_ALARM_TABLE, deviceId),
//         await getAlarmInterval(CLIENT_ALARM_TABLE, clientId),
//         await getAlarmInterval(CUSTOMER_ALARM_TABLE, customerId)//,
//         //await getGlobalAlarmInterval()
//     ].filter(Boolean);

//     if (alarmIntervals.length === 0) return { closestAlarmInterval: null, alarmLevel: null };

//     let closestAlarm = alarmIntervals.reduce((prev, curr) => Math.abs(timeDifference - prev.interval) < Math.abs(timeDifference - curr.interval) ? prev : curr);

//     return { closestAlarmInterval: closestAlarm.interval, alarmLevel: closestAlarm.level };
// }

async function getAlarmInterval(table, id) {
    console.log(`getAlarmInterval ${table} ${id}`);
    try {
        const result = await dynamoDB.query({ TableName: table, KeyConditionExpression: "id = :id", ExpressionAttributeValues: { ":id": id } }).promise();
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
    const MATCH_WINDOW = 60; // seconds

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

        // Filter items where timeDifference is within the MATCH_WINDOW range
        // const applicable = result.Items.filter(item => {
        //     return timeDifference >= Number(item.interval) &&
        //         timeDifference < Number(item.interval) + MATCH_WINDOW;
        // });

        const applicable = result.Items.filter(item => {
            const alarmInterval = Number(item.alarm_interval);
            const upperLimit = alarmInterval + MATCH_WINDOW;

            console.log(`\nChecking item:
            timeDifference              = ${timeDifference}
            item.alarm_level            = ${item.alarm_level}
            item.alarm_interval         = ${alarmInterval}
            item.alarm_interval + MATCH = ${upperLimit}`);

            return timeDifference >= alarmInterval && timeDifference < upperLimit;});

        
        if (applicable.length === 0) {
            return null;
        }
        
        // Find the one with the closest interval to the timeDifference
        const closest = applicable.reduce((prev, curr) => {
            return Math.abs(timeDifference - Number(curr.alarm_interval)) < Math.abs(timeDifference - Number(prev.alarm_interval)) ? curr : prev;
        });

        return {
            interval: Number(closest.alarm_interval),
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

async function sendAlarm(deviceId, device, contact, alarmLevel, localTime) {
    console.log(`sendAlarm deviceId ${deviceId} contact email ${contact.email} phone ${contact.phone} alarm level ${alarmLevel}`)

    const message = await getAlarmMessage(alarmLevel);
    const updatedMessage = updateAlarmMessage(device, message)
    console.log(`message ${updatedMessage}`);


    if (contact.alarm_level_email === alarmLevel) await sendEmail(contact.email, `PowerSight Remote Monitoring Alarm: ${device.model}-${device.serial_number}`, `${updatedMessage} Last communication was on ${localTime}`);
    if (contact.alarm_level_sms === alarmLevel) await sendEmail(contact.email, `PowerSight Remote Monitoring Alarm: ${device.model}-${device.serial_number}`, `${updatedMessage} Last communication was on ${localTime}`); // await sendSMS(contact.phone, `PowerSight Remote Monitoring Alarm ${alarmLevel} : ${device.model}-${device.serial_number} - ${updatedMessage} Last communication was on ${localTime}`);
    if (contact.alarm_level_phone === alarmLevel) await sendEmail(contact.email, `PowerSight Remote Monitoring Alarm: ${device.model}-${device.serial_number}`, `${updatedMessage} Last communication was on ${localTime}`); // await sendVoiceMessage(contact.phone, `PowerSight Remote Monitoring Alarm ${alarmLevel} : ${device.model}-${device.serial_number} - ${updatedMessage} Last communication was on ${localTime}`);
}


// Function to send an email
async function sendEmail(recipientEmail, subjectMessage, message) {
    if (!recipientEmail) return;

    const params = {
        Source: SES_SENDER_EMAIL,
        Destination: { ToAddresses: [recipientEmail] },
        Message: {
            Subject: { Data: subjectMessage },
            Body: { Text: { Data: message } }
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
        const response = await pinpoint.sendMessages(params).promise();
        console.log('Full response from Pinpoint:', JSON.stringify(response, null, 2));
        const result = response['MessageResponse']['Result'][phoneNumber];
        const messageId = result['MessageId'];

        console.log(`SMS sent successfully to ${phoneNumber}, Message ID: ${messageId}`);
        console.log(`SMS sent successfully to ${phoneNumber}`);
    } catch (error) {
        console.error("Error sending SMS:", error);
    }
}

// Function to send a voice message via AWS Pinpoint
async function sendVoiceMessage(phoneNumber, message) {
    if (!phoneNumber || !PINPOINT_APP_ID) return;

    /*const params = {
        ApplicationId: PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: { [phoneNumber]: { ChannelType: "VOICE" } },
            MessageConfiguration: { VoiceMessage: { Body: message, LanguageCode: "en-US", VoiceId: "Joanna" } }
        }
    };*/

    //const ORIGINATION_NUMBER="+1 888-629-2916";

    const params = {
        ApplicationId: PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: {
                [phoneNumber]: { ChannelType: "VOICE" }
            },
            MessageConfiguration: {
                VoiceMessage: {
                    Body: message,
                    LanguageCode: "en-US",
                    VoiceId: "Joanna",
                    OriginationNumber: ORIGINATION_NUMBER
                }
            }
        }
    };


    try {
        const response = await pinpoint.sendMessages(params).promise();
        console.log('Full response from Pinpoint:', JSON.stringify(response, null, 2));
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
        recepient = contact.email;
        alarm_delivery_method = 'EMAIL';
    }
    else if (contact.alarm_level_phone === alarm_level) {
        recepient = contact.phone;
        alarm_delivery_method = 'PHONE';
    }
    else if (contact.alarm_level_sms === alarm_level) {
        recepient = contact.sms;
        alarm_delivery_method = 'SMS';
    }

    const nowISOString = new Date(Date.now()).toISOString(); // ISO 8601 format
    
    const params = {
        TableName: ALARM_SENT_TABLE,
        Item: {
            id: AWS.util.uuid.v4(),
            device_id: deviceId,
            device_type: device_type,
            crsm: crsm,
            alarm_sent_at: timestamp,
            alarm_delivery_method: alarm_delivery_method,
            alarm_recipient: recepient,
            createdAt: nowISOString,
            updatedAt: nowISOString
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

    let gateway = null;
    let analyzer = null;

    let gatewayParams = {
        TableName: GATEWAY_TABLE,
        IndexName: "byGatewayBycrsm",
        KeyConditionExpression: "crsm = :deviceId",
        ExpressionAttributeValues: { ":deviceId": deviceId }
    };

    try {
        let gatewayResult = await dynamoDB.query(gatewayParams).promise();
        if (gatewayResult.Items.length > 0) {
            gateway = gatewayResult.Items[0];
            if (gateway.active_inactive_status === "Active" && gateway.allocated_unallocated_status === "Allocated") {
                gateway = {
                    id: gateway.id,
                    client_id: gateway.client_id,
                    customer_id: gateway.customer_id,
                    device_type: "Gateway",
                    enable_or_disable_alarm: gateway.enable_or_disable_alarm,
                    gps_location: gateway.gps_location,
                    active_inactive_status: gateway.active_inactive_status,
                    model: gateway.model,
                    serial_number: gateway.serial_number
                };
                console.log(`Found gateway ${JSON.stringify(gateway, null, 2)}`);
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
            analyzer = analyzerResult.Items[0];
            if (analyzer.active_inactive_status === "Active" && analyzer.assigned_unassigned_status === "Assigned") {
                analyzer = {
                    id: analyzer.id,
                    client_id: analyzer.client_id,
                    customer_id: analyzer.customer_id,
                    device_type: "Analyzer",
                    enable_or_disable_alarm: analyzer.enable_or_disable_alarm,
                    gps_location: analyzer.gps_location,
                    active_inactive_status: gateway.active_inactive_status,
                    model: gateway.model,
                    serial_number: gateway.serial_number
                };
                console.log(`Found analyzer ${JSON.stringify(analyzer, null, 2)}`);
            }
        }
    } catch (error) {
        console.error("Error querying Analyzer table:", error);
    }


    if (!gateway && !analyzer) {
        console.log(`Null Gateway and Analyzer`)
        console.log(`Gateway: ${gateway}`)
        console.log(`Analyzer: ${analyzer}`)
        return null;
    }

    return { gateway, analyzer };
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

async function getAlarmMessage(alarmLevel) {
    const params = {
        TableName: process.env.ALARM_MESSAGE_TABLE,
        Key: { alarm_level: alarmLevel }
    };

    try {
        const result = await dynamoDB.get(params).promise();
        if (result.Item && result.Item.message) {
            return result.Item.message;
        } else {
            console.warn(`No alarm message found for alarm_level ${alarmLevel}, using default message.`);
            return `Device disconnected with alarm level: ${alarmLevel}`; // Default fallback
        }
    } catch (error) {
        console.error(`Error fetching alarm message for level ${alarmLevel}:`, error);
        return `Device disconnected with alarm level: ${alarmLevel}`; // Default fallback
    }
}

function updateAlarmMessage(deviceData, message) {
    // Replace placeholders in the message using direct key lookup
    message = message.replace(/{(\w+)}/g, (match, key) => {
        return deviceData[key] !== undefined ? deviceData[key] : match;
    });

    return message;
}

function formatInterval(secondsInput) {
    const seconds = Number(secondsInput);

    if (isNaN(seconds) || seconds <= 0) {
        return "Invalid input. Please enter a positive number of seconds.";
    }

    if (seconds < 3600) {
        const minutes = seconds / 60;
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        const hours = seconds / 3600;
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
}

function formatToLocalTime(nowMillis, timezone) {
    try {
        const localTime = DateTime.fromMillis(nowMillis, { zone: timezone });
        return localTime.toFormat('MMM dd, yyyy HH-mm-ss');
    } catch (error) {
        console.error(`Error formatting time to timezone ${timezone}:`, error);
        return null;
    }
}

function getTimeZone(latitude, longitude) {
    try {
        const timezone = tzLookup(latitude, longitude);
        console.log(`Derived timezone: ${timezone} for lat: ${latitude}, lon: ${longitude}`);
        return timezone;
    } catch (error) {
        console.error(`Error deriving timezone for lat ${latitude}, lon ${longitude}:`, error);
        return null;
    }
}


function getLocalTimeFromGpsLocation(gpsLocation, nowMillis, forceUtc = false) {
    try {
        let timezone;

        if (forceUtc) {
            timezone = 'UTC';
            console.log("Forcing UTC timezone.");
        } else {
            if (!gpsLocation) {
                console.warn("GPS location is missing.");
                return null;
            }

            const [latStr, lonStr] = gpsLocation.split(",");
            const latitude = parseFloat(latStr);
            const longitude = parseFloat(lonStr);

            if (isNaN(latitude) || isNaN(longitude)) {
                console.warn(`Invalid GPS coordinates: ${gpsLocation}`);
                return null;
            }

            timezone = tzLookup(latitude, longitude);
            console.log(`Derived timezone: ${timezone} for coordinates (${latitude}, ${longitude})`);
        }

        // Format with timezone abbreviation
        const localTime = DateTime.fromMillis(nowMillis, { zone: timezone })
            .toFormat('MMM dd, yyyy HH-mm-ss z');

        return localTime;
    } catch (error) {
        console.error("Error deriving local time from GPS location:", error);
        return null;
    }
}