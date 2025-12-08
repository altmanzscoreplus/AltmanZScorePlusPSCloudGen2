
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// Access the ReadingTableName environment variable
const tableName = process.env.ReadingTableName;
const eventTableName = process.env.EventTableName;
const moment = require('moment');

// Function to get current system time + 24 hours in epoch seconds
function getFutureEpochTime() {
    const futureTime = new Date(new Date().getTime() + 24*60*60*1000);
    return Math.floor(futureTime.getTime() / 1000);
}

async function queryOrInsertEvent(eventID) {
    const params = {
        TableName: eventTableName,
        Key: {
            'eventID': eventID
        }
    };

    try {
        const data = await docClient.get(params).promise();
        if (!data.Item) {
            // No item found, insert new item
            const epochTime = getFutureEpochTime();
            const insertParams = {
                TableName: eventTableName,
                Item: {
                    'eventID': eventID,
                    'epochTime': epochTime
                }
            };

            await docClient.put(insertParams).promise();
            console.log(`New record inserted: eventID = ${eventID}, epochTime = ${epochTime}`);
        } else {
            // Item found
            console.log(`Record found:`, data.Item);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

exports.handler = async (event) => {
    console.log("Event: ", JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        console.log('Record: ', JSON.stringify(record, null, 2));
        console.log('eventID:',record.eventID);
        const found=await queryOrInsertEvent(record.eventID); 
        if (found) {
		console.log('Record found:',record.eventID);
		continue;
	}
	else console.log('new record:',record.eventID);

        if (record.eventName == 'INSERT') {
            const newItem = record.dynamodb.NewImage;

		console.log('data:',newItem.data);
	   // Convert createdAt to a JavaScript Date object and add 15 minutes
	   const expireAtDate = moment(newItem.createdAt.S).add(15, 'minutes');
	   // Format back to ISO 8601 string if that's what your table expects
	   const expireAt = expireAtDate.toISOString();
	   const expireAtDateTime = new Date(expireAt);
           const expireAtEpochTime = Math.floor(expireAtDateTime.getTime()/1000);
           const params = {
                TableName: tableName, // Use the environment variable for table name
                Item: {
                    analyzer_id: newItem.analyzer_id.S,
                    createdAt: newItem.createdAt.S,
                    data: newItem.data.M,
                    gateway_id: newItem.gateway_id.S,
                    updatedAt: newItem.updatedAt.S,
                    expireAt: expireAt,
                    expireAtEpochTime: expireAtEpochTime
                }
            };

            try {
                await docClient.put(params).promise();
                console.log(`Item inserted into ${tableName} successfully`);
            } catch (error) {
                console.error(`Error inserting item into ${tableName}:`, error);
            }
        }
    }
};

