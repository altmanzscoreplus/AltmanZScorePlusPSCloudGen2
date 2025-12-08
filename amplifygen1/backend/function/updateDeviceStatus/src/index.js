
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.DEVICE_STATUS_TABLE; // Change to your DynamoDB table name

exports.handler = async (event) => {
    console.log("Received IoT Event:", JSON.stringify(event, null, 2));

    try {
        for (const record of event.Records || []) {
            const payload = JSON.parse(record.message);
            const deviceId = payload.device_id;
            const timestamp = Math.floor(Date.now() / 1000); // Current epoch time

            if (!deviceId) {
                console.error("Missing device_id in payload:", payload);
                continue;
            }

            // Update last_seen timestamp in DynamoDB
            await dynamoDB.put({
                TableName: TABLE_NAME,
                Item: {
                    device_id: deviceId,
                    last_seen: timestamp,
                    alert_level: 0  // Reset alert level
                }
            }).promise();

            console.log(`Updated device ${deviceId} status in DynamoDB`);
        }

        return { status: "processed" };
    } catch (error) {
        console.error("Error processing IoT event:", error);
        return { status: "error", message: error.message };
    }
};

