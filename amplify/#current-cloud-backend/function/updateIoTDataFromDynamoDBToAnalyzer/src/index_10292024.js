const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const ANALYZER_TABLE = process.env.ANALYZER_TABLE;  // Environment variable for the Analyzer table name
const IOT_ANALYZER_TABLE = process.env.IOT_ANALYZER_TABLE;  // Environment variable for the Rich_Analyzer table name
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

	    console.log('New event');

            // If eventId is not present, process the record
            if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
                const newImage = record.dynamodb.NewImage;

                // Extract analyzer_id from the IOT_ANALYZER_TABLE update
                const analyzerId = newImage.id.S;
                const serialNumber = newImage.serial_number.S;
                const deviceStatus = newImage.device_status.S;
                const owner = newImage.owner.S;
                const firmwareVersion = newImage.fw_ver.S;
                const hardwareVersion = newImage.hw_ver.S;
                const createdAt = newImage.createdAt.S;
                const updatedAt = newImage.updatedAt.S;

                // Log the extracted values
                console.log('Extracted values:', {
                    analyzerId, serialNumber, deviceStatus, owner, firmwareVersion, hardwareVersion, createdAt, updatedAt
                });

                // Query the Analyzer table to find the matching ps_analyzer_id
                const analyzerData = await dynamoDB.query({
                    TableName: ANALYZER_TABLE,
                    IndexName: 'byAnalyzerByPSAnalyzerId', // Assuming there's an index on ps_analyzer_id
                    KeyConditionExpression: 'ps_analyzer_id = :ps_analyzer_id',
                    ExpressionAttributeValues: {
                        ':ps_analyzer_id': analyzerId
                    }
                }).promise();

                // Check if the analyzer was found
                if (analyzerData.Items.length > 0) {
                    const analyzerRecord = analyzerData.Items[0];

                    // Update the Analyzer table with relevant data
                    await dynamoDB.update({
                        TableName: ANALYZER_TABLE,
                        Key: {
                            id: analyzerRecord.id  // Use the correct key attribute for your table
                        },
                        //UpdateExpression: 'set serial_number = :serialNumber, communication_status = :deviceStatus, owner = :owner, fw_ver = :firmwareVersion, hw_ver = :hardwareVersion, createdAt = :createdAt, updatedAt = :updatedAt',
                        UpdateExpression: 'set serial_number = :serialNumber, communication_status = :deviceStatus, fw_ver = :firmwareVersion, hw_ver = :hardwareVersion, createdAt = :createdAt, updatedAt = :updatedAt',
                        ExpressionAttributeValues: {
                            ':serialNumber': serialNumber,
                            ':deviceStatus': deviceStatus,
                            //':owner': owner,
                            ':firmwareVersion': firmwareVersion,
                            ':hardwareVersion': hardwareVersion,
                            ':createdAt': createdAt,
                            ':updatedAt': updatedAt
                        }
                    }).promise();

                    console.log(`Successfully updated Analyzer record for ps_analyzer_id: ${analyzerId}`);
                } else {
                    console.log(`No Analyzer record found for ps_analyzer_id: ${analyzerId}`);
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

