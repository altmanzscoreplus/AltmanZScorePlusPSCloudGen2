/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	CONNECTION_TABLE
	GATEWAY_TABLE
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const GATEWAY_TABLE = process.env.GATEWAY_TABLE;
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

                    // Search the Gateway table for the crsm field matching the connectionId
                    const gatewayId = await getGatewayIdByCrsm(connectionId);
                    
                    // If a gatewayId is found, update the communication_status
                    if (gatewayId) {
                        await updateGatewayCommunicationStatus(gatewayId, communicationStatus);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error processing DynamoDB event:', error);
        throw new Error('Error processing DynamoDB event');
    }
};

/*async function getGatewayIdByCrsm(connectionId) {
    const params = {
        TableName: GATEWAY_TABLE,
        IndexName: 'crsm-index',  // Ensure an index on crsm exists if not the primary key
        KeyConditionExpression: 'crsm = :connectionId',
        ExpressionAttributeValues: {
            ':connectionId': connectionId
        },
        ProjectionExpression: 'id'  // Only retrieve the id (gateway ID)
    };

    try {
        const result = await dynamoDB.query(params).promise();
        return result.Items.length > 0 ? result.Items[0].id : null;
    } catch (error) {
        console.error(`Error querying Gateway table for crsm ${connectionId}:`, error);
        return null;
    }
}*/

// code changed by Rich

async function getGatewayIdByCrsm(connectionId) {
    const params = {
        TableName: GATEWAY_TABLE,
        FilterExpression: 'crsm = :connectionId',
        ExpressionAttributeValues: {
            ':connectionId': connectionId
        },
        ProjectionExpression: 'id'  // Only retrieve the id (gateway ID)
    };

    console.log(`Scanning Gateway table for crsm: ${connectionId}`);

    try {
        const result = await dynamoDB.scan(params).promise();
        if (result.Items && result.Items.length > 0) {
            console.log(`Found gateway ID: ${result.Items[0].id}`);
            return result.Items[0].id;
        } else {
            console.log(`No gateway ID found for crsm: ${connectionId}`);
            return null;
        }
    } catch (error) {
        console.error(`Error scanning Gateway table for crsm ${connectionId}:`, error);
        return null;
    }
}

async function updateGatewayCommunicationStatus(gatewayId, communicationStatus) {
    const params = {
        TableName: GATEWAY_TABLE,
        Key: {
            'id': gatewayId
        },
        UpdateExpression: 'SET communication_status = :status',
        ExpressionAttributeValues: {
            ':status': communicationStatus
        }
    };

    try {
        await dynamoDB.update(params).promise();
        console.log(`Successfully updated communication_status to ${communicationStatus} for gateway ID ${gatewayId}`);
    } catch (error) {
        console.error(`Error updating communication_status for gateway ID ${gatewayId}:`, error);
    }
}


