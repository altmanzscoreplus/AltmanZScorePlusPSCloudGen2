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

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        // Process each record in the event
        for (const record of event.Records) {
            if (record.eventName === 'MODIFY') {
                const newStatus = record.dynamodb.NewImage.status.S;
                const connectionId = record.dynamodb.Keys.id.S;

                // Check if the status is connected or disconnected
                if (newStatus === 'connected' || newStatus === 'disconnected') {
                    // Determine the new communication status
                    const communicationStatus = newStatus === 'connected' ? 'Communicating' : 'Offline';

                    // Search the Analyzer table for the csrm field matching the connectionId
                    const analyzerId = await getAnalyzerIdByCsrm(connectionId);
                    
                    // If an analyzerId is found, update the communication_status
                    if (analyzerId) {
                        await updateAnalyzerCommunicationStatus(analyzerId, communicationStatus);
                    }
                }
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
        console.log(`Successfully updated communication_status to ${communicationStatus} for analyzer ID ${analyzerId}`);
    } catch (error) {
        console.error(`Error updating communication_status for analyzer ID ${analyzerId}:`, error);
    }
}

