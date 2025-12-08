const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const GATEWAY_TABLE = process.env.GATEWAY_TABLE;  // Environment variable for the Gateway table name
const IOT_GATEWAY_TABLE = process.env.IOT_GATEWAY_TABLE;  // Environment variable for the Rich_Gateway table name
const EVENT_TABLE = process.env.EVENT_TABLE;  // Environment variable for the Event table name

exports.handler = async (event) => {
    try {
        // Log the received event
        console.log('Received event:', JSON.stringify(event, null, 2));

        // Iterate over the records in the event
        for (const record of event.Records) {
            const eventId = record.eventID;

            // Check if the eventId is already present in the Event table
            const eventCheck = await dynamoDB.get({
                TableName: EVENT_TABLE,
                Key: {
                    eventid: eventId
                }
            }).promise();

            if (eventCheck.Item) {
                // If eventId is present, skip processing
                console.log(`Event ID ${eventId} already processed. Skipping.`);
                continue;
            }

            // If eventId is not present, process the record
            if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
                const newImage = record.dynamodb.NewImage;

                // Extract gateway_id from the IOT_GATEWAY_TABLE update
                const gatewayId = newImage.id.S;
                const serialNumber = newImage.serial_number.S;
                //const deviceStatus = newImage.device_status.S;
                //const owner = newImage.owner.S;
                const firmwareVersion = newImage.fw_ver.S;
                const hardwareVersion = newImage.hw_ver.S;
                const createdAt = newImage.createdAt.S;
                const updatedAt = newImage.updatedAt.S;
                const csrm = newImage.csrm.S;

                // Log the extracted values
                console.log('Extracted values:', {
                    gatewayId, serialNumber, firmwareVersion, hardwareVersion, createdAt, updatedAt, csrm
                    //gatewayId, serialNumber, deviceStatus, owner, firmwareVersion, hardwareVersion, createdAt, updatedAt
                });

                // Query the Gateway table to find the matching ps_gateway_id
                const gatewayData = await dynamoDB.query({
                    TableName: GATEWAY_TABLE,
                    IndexName: 'byGatewayByPSGatewayId', // Assuming there's an index on ps_gateway_id
                    KeyConditionExpression: 'ps_gateway_id = :ps_gateway_id',
                    ExpressionAttributeValues: {
                        ':ps_gateway_id': gatewayId
                    }
                }).promise();

                // Check if the gateway was found
                if (gatewayData.Items.length > 0) {
                    const gatewayRecord = gatewayData.Items[0];

                    // Update the Gateway table with relevant data
                    await dynamoDB.update({
                        TableName: GATEWAY_TABLE,
                        Key: {
                            id: gatewayRecord.id  // Use the correct key attribute for your table
                        },
                        //UpdateExpression: 'set serial_number = :serialNumber, communication_status = :deviceStatus, owner = :owner, fw_ver = :firmwareVersion, hw_ver = :hardwareVersion, createdAt = :createdAt, updatedAt = :updatedAt',
                        //UpdateExpression: 'set serial_number = :serialNumber, communication_status = :deviceStatus, fw_ver = :firmwareVersion, hw_ver = :hardwareVersion, createdAt = :createdAt, updatedAt = :updatedAt',
			    UpdateExpression: 'set serial_number = :serialNumber, fw_ver = :firmwareVersion, hw_ver = :hardwareVersion, createdAt = :createdAt, updatedAt = :updatedAt, csrm = :csrm',
                        ExpressionAttributeValues: {
                            ':serialNumber': serialNumber,
                            //':deviceStatus': deviceStatus,
                            //':owner': owner,
                            ':firmwareVersion': firmwareVersion,
                            ':hardwareVersion': hardwareVersion,
                            ':createdAt': createdAt,
                            ':updatedAt': updatedAt,
                            ':csrm': csrm
                        }
                    }).promise();

                    console.log(`Successfully updated Gateway record for ps_gateway_id: ${gatewayId}`);
                } else {
                    console.log(`No Gateway record found for ps_gateway_id: ${gatewayId}`);
                }

                // Calculate TTL (current time + 24 hours in epoch time)
                const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

                // Insert the eventId into the Event table to mark it as processed
                await dynamoDB.put({
                    TableName: EVENT_TABLE,
                    Item: {
                        eventid: eventId,
                        ttl: ttl
                    }
                }).promise();

                console.log(`Event ID ${eventId} marked as processed with TTL set to ${ttl}.`);
            }
        }
    } catch (error) {
        console.error('Error processing DynamoDB stream:', error);
        throw new Error('Error processing DynamoDB stream');
    }
};

