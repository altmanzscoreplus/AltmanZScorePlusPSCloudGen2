
// Import the AWS SDK
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// Static configuration for tables and their respective indices
const configurations = [
    { baseTableName: 'Domain', indexName: 'byDomainByAnalyzer' },
    { baseTableName: 'PSFile', indexName: 'byPSFileByAnalyzer' },
    { baseTableName: 'Reading', indexName: 'byReadingByAnalyzer' },
    { baseTableName: 'AnalyzerRental', indexName: 'byAnalyzerRentalByAnalyzer' },
    // Add more configurations as needed
];

exports.handler = async (event) => {
    // Extract analyzerId from the event object provided by the API
    console.log('event',event);

    let  body  = JSON.parse(event.body);
    
    console.log('analyzerId ',body.analyzerId);

    // Retrieve the table name suffix from Lambda environment variables
    const tableSuffix = process.env.TABLE_SUFFIX;
    console.log('tableSuffix ',tableSuffix);

    // delete data from child tables
	
    try {
        for (const config of configurations) {
            // Append the suffix to the base table name
            const tableName = `${config.baseTableName}${tableSuffix}`;
	    console.log('tableName ',tableName);

            const items = await queryDynamoDB(tableName, config.indexName, body.analyzerId);
            if (items.length === 0) {
                console.log(`No items found for analyzerId ${body.analyzerId} in table ${tableName} using index ${config.indexName}`);
                continue;
            }

            // Assuming the primary key is 'id'
            for (const item of items) {
                await deleteFromDynamoDB(tableName, { id: item.id });
                console.log(`Deleted item with ID ${item.id} from table ${tableName}`);
            }
        }
	
	// Delete data from Analyzer Table
	
        try {
		const analyzerItems = await queryItemById(`Analyzer${tableSuffix}`,body.analyzerId);


        if (!analyzerItems) {
                console.log(`No items found for analyzerId ${body.analyzerId} in table Analyzer${tableSuffix}`);
            }
	else console.log('Analyzer',JSON.stringify(analyzerItems, null, 2));  // The '2' here sets the number of spaces used for indentation

        if (analyzerItems && analyzerItems.id) {
		console.log('deleting analyzer record');
                console.log(`await deleteFromDynamoDB(Analyzer${tableSuffix}, id: ${analyzerItems.id}`);
                try {
			await deleteFromDynamoDB(`Analyzer${tableSuffix}`, { id: analyzerItems.id });
                	console.log(`Deleted item with ID ${analyzerItems.id} from table Analyzer${tableSuffix}`);
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

async function queryDynamoDB(tableName, indexName, analyzerId) {
    const params = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: 'analyzer_id = :analyzerId',
        ExpressionAttributeValues: {
            ':analyzerId': analyzerId
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

