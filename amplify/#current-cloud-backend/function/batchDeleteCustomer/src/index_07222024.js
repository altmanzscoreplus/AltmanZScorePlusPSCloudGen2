
// Import the AWS SDK
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// Static configuration for tables and their respective indices
const configurations = [
    { baseTableName: 'Domain', indexName: 'byDomainByCustomer' },
    { baseTableName: 'PSFile', indexName: 'byPSFileByCustomer' },
    { baseTableName: 'Client', indexName: 'byClientByCustomer' },
    { baseTableName: 'Reading', indexName: 'byReadingByCustomer' },
    { baseTableName: 'AnalyzerRental', indexName: 'byAnalyzerRentalByCustomer' },
    { baseTableName: 'GatewayRental', indexName: 'byGatewayRentalByCustomer' },
    { baseTableName: 'Contact', indexName: 'ContactByCustomer' },
    // Add more configurations as needed
];

// Configure AWS SDK with your region
AWS.config.update({ region: process.env.rehion });

// Create an instance of the CognitoIdentityServiceProvider
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

/**
 * Function to delete a Cognito user by user ID
 * @param {string} userPoolId - The ID of the Cognito User Pool
 * @param {string} userId - The user ID of the user to delete
 */
async function deleteUser(userPoolId, userId) {
  const params = {
    UserPoolId: userPoolId,
    Username: userId,
  };

  try {
    await cognitoIdentityServiceProvider.adminDeleteUser(params).promise();
    console.log(`User ${userId} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete user ${userId}:`, error);
  }
}

// Replace with your User Pool ID and the user ID you want to delete
const userPoolId = 'us-west-1_F0uiXhSAc';

exports.handler = async (event) => {
    // Extract customerId from the event object provided by the API
    console.log('event',event);

    let  body  = JSON.parse(event.body);
    
    console.log('customerId ',body.customerId);

    // Retrieve the table name suffix from Lambda environment variables
    const tableSuffix = process.env.TABLE_SUFFIX;
    console.log('tableSuffix ',tableSuffix);

    // delete data from child tables
	
    try {
        for (const config of configurations) {
            // Append the suffix to the base table name
            const tableName = `${config.baseTableName}${tableSuffix}`;
	    console.log('tableName ',tableName);

            const items = await queryDynamoDB(tableName, config.indexName, body.customerId);
            if (items.length === 0) {
                console.log(`No items found for customerId ${body.customerId} in table ${tableName} using index ${config.indexName}`);
                continue;
            }

            // Assuming the primary key is 'id'
            for (const item of items) {
		const userId = item.email;;
		
		// Call the deleteUser function
		if (tableName=='Contact') {
			try {
				deleteUser(userPoolId, userId);
			}
			catch (error)
			{
				console.error(`Failed to delete user ${userId}:`,error);
			}
		}

                await deleteFromDynamoDB(tableName, { id: item.id });
                console.log(`Deleted item with ID ${item.id} from table ${tableName}`);
            }
        }
	
	// Delete data from Customer Table
	
        try {
		const customerItems = await queryItemById(`Customer${tableSuffix}`,body.customerId);


        if (!customerItems) {
                console.log(`No items found for customerId ${body.customerId} in table Customer${tableSuffix}`);
            }
	else console.log('Customer',JSON.stringify(customerItems, null, 2));  // The '2' here sets the number of spaces used for indentation

        if (customerItems && customerItems.id) {
		console.log('deleting customer record');
                console.log(`await deleteFromDynamoDB(Customer${tableSuffix}, id: ${customerItems.id}`);
                try {
			await deleteFromDynamoDB(`Customer${tableSuffix}`, { id: customerItems.id });
                	console.log(`Deleted item with ID ${customerItems.id} from table Customer${tableSuffix}`);
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

async function queryDynamoDB(tableName, indexName, customerId) {
    const params = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: 'customer_id = :customerId',
        ExpressionAttributeValues: {
            ':customerId': customerId
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

