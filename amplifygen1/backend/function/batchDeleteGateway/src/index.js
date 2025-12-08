
// Import the AWS SDK
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// Static configuration for tables and their respective indices
const configurations = [
    { baseTableName: 'Domain', indexName: 'byDomainByGateway' },
    { baseTableName: 'PSFile', indexName: 'byPSFileByGateway' },
    { baseTableName: 'Reading', indexName: 'byReadingByGateway' },
    { baseTableName: 'AnalyzerRental', indexName: 'byAnalyzerRentalByGateway' },
    { baseTableName: 'GatewayRental', indexName: 'byGatewayRentalByGateway' },
    // Add more configurations as needed
];

exports.handler = async (event) => {
    // Extract gatewayId from the event object provided by the API
    console.log('event',event);

    let  body  = JSON.parse(event.body);
    
    console.log('gatewayId ',body.gatewayId);

    // Retrieve the table name suffix from Lambda environment variables
    const tableSuffix = process.env.TABLE_SUFFIX;
    console.log('tableSuffix ',tableSuffix);

    // delete data from child tables
	
    try {
        for (const config of configurations) {
            // Append the suffix to the base table name
            const tableName = `${config.baseTableName}${tableSuffix}`;
	    console.log('tableName ',tableName);

            const items = await queryDynamoDB(tableName, config.indexName, body.gatewayId);
            if (items.length === 0) {
                console.log(`No items found for gatewayId ${body.gatewayId} in table ${tableName} using index ${config.indexName}`);
                continue;
            }

            // Assuming the primary key is 'id'
            for (const item of items) {
                await deleteFromDynamoDB(tableName, { id: item.id });
                console.log(`Deleted item with ID ${item.id} from table ${tableName}`);
            }
        }
	
	// Delete data from Gateway Table
	
        try {
		const gatewayItems = await queryItemById(`Gateway${tableSuffix}`,body.gatewayId);


        if (!gatewayItems) {
                console.log(`No items found for gatewayId ${body.gatewayId} in table Gateway${tableSuffix}`);
            }
	else console.log('Gateway',JSON.stringify(gatewayItems, null, 2));  // The '2' here sets the number of spaces used for indentation

        if (gatewayItems && gatewayItems.id) {
		console.log('deleting gateway record');
                console.log(`await deleteFromDynamoDB(Gateway${tableSuffix}, id: ${gatewayItems.id}`);
                try {
			await deleteFromDynamoDB(`Gateway${tableSuffix}`, { id: gatewayItems.id });
                	console.log(`Deleted item with ID ${gatewayItems.id} from table Gateway${tableSuffix}`);
		}
		catch (error)
		{
			 console.error('Caught an error:', error);
		}
	}
	}
		catch (error)
		{
			 console.error('Caught an error:', error);
		}


        return {
            statusCode: 200,
            headers: {
			            "Access-Control-Allow-Origin": "*", // Allows all domains
			            "Access-Control-Allow-Headers": "Content-Type",
			            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
	    },
            body: JSON.stringify({ message: "All specified items deleted successfully" })
        };
    } catch (err) {
        console.error("Error in processing:", JSON.stringify(err, null, 2));
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        };
    }
};

async function queryDynamoDB(tableName, indexName, gatewayId) {
    const params = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: 'gateway_id = :gatewayId',
        ExpressionAttributeValues: {
            ':gatewayId': gatewayId
        }
    };

    try {
        const data = await docClient.query(params).promise();
        return data.Items;
    } catch (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        throw err;
    }
}

// Function to query an item by its primary key (id) in a DynamoDB table
async function queryItemById(tableName, id) {

    const params = {
        TableName: tableName,
        Key: {
		id:id
	}
    };

    try {
        const data = await docClient.get(params).promise();
        return data.Item;  // Returns the item or undefined if not found
    } catch (err) {
        console.error("Unable to retrieve item. Error:", JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteFromDynamoDB(tableName, key) {

    console.log(`In deleteFromDynamoDB tableName ${tableName} key`,JSON.stringify(key,null,2));

    const params = {
        TableName: tableName,
        Key: key
    };


    try {
        await docClient.delete(params).promise();
        return { message: "Delete successful" };
    } catch (err) {
        console.error("Unable to delete. Error:", JSON.stringify(err, null, 2));
        throw err;
    }
}

