/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	CONNECTION_TABLE
	ANALYZER_TABLE
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const ANALYZER_TABLE = process.env.ANALYZER_TABLE;
const CONNECTION_TABLE = process.env.CONNECTION_TABLE;
const EVENT_TABLE = process.env.EVENT_TABLE;  // Environment variable for the Event table name

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        // Iterate over the records in the event
        for (const record of event.Records) 
        {
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

            const approximateTime = record.dynamodb.ApproximateCreationDateTime;
            
            // Convert the approximate time to Pacific Time
            const pacificTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Los_Angeles',
                dateStyle: 'short',
                timeStyle: 'long',
            }).format(new Date(approximateTime * 1000));

            console.log(`${eventId}: ${pacificTime}`);   
            
            if (record.eventName === 'MODIFY') {
                const newStatus = record.dynamodb.NewImage.status.S;
                const connectionId = record.dynamodb.Keys.id.S;

                // Check if the status is connected or disconnected
                if (newStatus === 'connected' || newStatus === 'disconnected') {
                    // Determine the new communication status
                    const communicationStatus = newStatus === 'connected' ? 'Communicating' : 'Offline';

                    // Search the Analyzer table for the csrm field matching the connectionId
                    const [analyzerId, ps_analyzer_id] = await getAnalyzerIdByCrsm(connectionId);
                     
                    // If an analyzerId is found, update the communication_status
                    if (analyzerId) {
                        await updateAnalyzerCommunicationStatus(analyzerId, ps_analyzer_id, communicationStatus);
                    }
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

                // console.log(`Event ID ${eventId} marked as processed with TTL set to ${ttl}.`);                   
            }
        }
    } catch (error) {
        console.error('Error processing DynamoDB event:', error);
        throw new Error('Error processing DynamoDB event');
    }
};

async function getAnalyzerIdByCsrm(connectionId) {
    const params = {
        TableName: ANALYZER_TABLE,
        IndexName: 'csrm-index',  // Ensure an index on csrm exists if not the primary key
        KeyConditionExpression: 'csrm = :connectionId',
        ExpressionAttributeValues: {
            ':connectionId': connectionId
        },
        ProjectionExpression: 'id'  // Only retrieve the id (analyzer ID)
    };

    try {
        const result = await dynamoDB.query(params).promise();
        return result.Items.length > 0 ? result.Items[0].id : null;
    } catch (error) {
        console.error(`Error querying Analyzer table for csrm ${connectionId}:`, error);
        return null;
    }
}

async function getAnalyzerIdByCrsm(connectionId) {
    const params = {
        TableName: ANALYZER_TABLE,
        FilterExpression: 'crsm = :connectionId',
        ExpressionAttributeValues: {
            ':connectionId': connectionId
        },
        ProjectionExpression: 'id, ps_analyzer_id'  // Retrieve both id and ps_gateway_id
    };

    // console.log(`Scanning Gateway table for crsm: ${connectionId}`);

    try {
        const result = await dynamoDB.scan(params).promise();
        if (result.Items && result.Items.length > 0) {
            // console.log(`analyzer ID: ${result.Items[0].ps_analyzer_id}`);
            // console.log(`analyzer ID: ${result.Items[0].id}`);
            return [result.Items[0].id, result.Items[0].ps_analyzer_id];
        } else {
            console.log(`No analyzer ID found for crsm: ${connectionId}`);
            return [null, null];
        }
    } catch (error) {
        console.error(`Error scanning Analyzer table for crsm ${connectionId}:`, error);
        return [null, null];
    }
}

async function updateAnalyzerCommunicationStatus(analyzerId, communicationStatus) {
    const params = {
        TableName: ANALYZER_TABLE,
        Key: {
            'id': analyzerId
        },
        UpdateExpression: 'SET communication_status = :status',
        ExpressionAttributeValues: {
            ':status': communicationStatus
        }
    };

    try {
        await dynamoDB.update(params).promise();
        console.log(`${ps_analyzer_id}: ${communicationStatus}`);
        // console.log(`Successfully updated communication_status to ${communicationStatus} for analyzer ID ${analyzerId}`);
    } catch (error) {
        console.error(`Error updating communication_status for analyzer ID ${analyzerId}:`, error);
    }
}

