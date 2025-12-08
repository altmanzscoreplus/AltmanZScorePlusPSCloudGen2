/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	DEVICE_DATA_TABLE
	DEVICE_STATUS_TABLE
	DEVICE_TIMEOUT
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
/*exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    return {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
        body: JSON.stringify('Hello from Lambda!'),
    };
};
*/

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Get environment variables
const DEVICE_DATA_TABLE = process.env.DEVICE_DATA_TABLE; // Replace with your actual data table in environment variable
const DEVICE_STATUS_TABLE = process.env.DEVICE_STATUS_TABLE; // Table to store device status in environment variable
const DEVICE_TIMEOUT = parseInt(process.env.DEVICE_TIMEOUT, 10) || 300000; // Timeout from environment variable, default to 300000 ms (5 minutes)

// Function to get the latest device data from DynamoDB
async function getLatestDeviceData(deviceId) {
  const params = {
    TableName: DEVICE_DATA_TABLE,
    KeyConditionExpression: 'device_id = :deviceId',
    ExpressionAttributeValues: {
      ':deviceId': deviceId
    },
    ScanIndexForward: false, // Get the latest item first
    Limit: 1
  };

  try {
    const result = await dynamoDB.query(params).promise();
    return result.Items.length ? result.Items[0] : null;
  } catch (error) {
    console.error('Error querying device data:', error);
    throw error;
  }
}

// Function to get the previous device status from DynamoDB
async function getDeviceStatus(deviceId) {
  const params = {
    TableName: DEVICE_STATUS_TABLE,
    Key: {
      'device_id': deviceId
    }
  };

  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item ? result.Item : null;
  } catch (error) {
    console.error('Error retrieving device status:', error);
    throw error;
  }
}

// Function to update the device status in DynamoDB
async function updateDeviceStatus(deviceId, status) {
  const params = {
    TableName: DEVICE_STATUS_TABLE,
    Item: {
      'device_id': deviceId,
      'status': status,
      'last_checked': new Date().toISOString()
    }
  };

  try {
    await dynamoDB.put(params).promise();
    console.log(`Device ${deviceId} status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
}

// Function to check if the device has started or stopped sending data
async function checkDeviceStatus(deviceId) {
  try {
    // Get the latest device data
    const latestData = await getLatestDeviceData(deviceId);
    const currentTime = Date.now();
    const lastSeen = latestData ? new Date(latestData.timestamp).getTime() : null;

    let isSending = false;
    if (lastSeen && currentTime - lastSeen <= DEVICE_TIMEOUT) {
      isSending = true; // Device is currently sending data
    }

    // Get the previous status from the DeviceStatus table
    const previousStatusData = await getDeviceStatus(deviceId);
    const previousStatus = previousStatusData ? previousStatusData.status : 'stopped';

    // Detect state change
    if (isSending && previousStatus === 'stopped') {
      console.log(`Device ${deviceId} has started sending data.`);
    } else if (!isSending && previousStatus === 'sending') {
      console.log(`Device ${deviceId} has stopped sending data.`);
    }

    // Update the status in DynamoDB if changed
    const newStatus = isSending ? 'sending' : 'stopped';
    if (newStatus !== previousStatus) {
      await updateDeviceStatus(deviceId, newStatus);
    }

  } catch (error) {
    console.error('Error checking device status:', error);
  }
}

// Lambda handler function (entry point)
exports.handler = async (event) => {
  const devices = ['device_123']; // Add more device IDs as needed
  for (const deviceId of devices) {
    await checkDeviceStatus(deviceId);
  }
};

