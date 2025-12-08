/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AWS = require('aws-sdk');
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Methods", "*")
  next()
});


const defaultThingName=process.env.DefaultThingName;

// Initialize the IoT Data Plane client
const iotdata = new AWS.IotData({ endpoint: process.env.IOT_ENDPOINT });

// POST: Add a deviceId to the whitelist

app.post('/IoTShadow/addToWhitelist', async (req, res) => {
  var { thingName, shadowName, deviceName } = req.body; // Expect thingName, shadowName, and deviceName in the request body

  thingName = thingName ?? defaultThingName;

  if (!thingName || !shadowName || !deviceName) {
    return res.status(400).json({ error: 'thingName, shadowName, and deviceName are required' });
  }

  // Ensure deviceName does not exceed 12 characters
  if (deviceName.length > 12) {
    return res.status(400).json({ error: 'deviceName cannot exceed 12 characters' });
  }

  try {
    // Get the current shadow
    const shadowParams = {
      thingName: thingName,
      shadowName: shadowName
    };

    const shadowData = await iotdata.getThingShadow(shadowParams).promise();
    const payload = JSON.parse(shadowData.payload);

    let updatedShadow;

    console.log('payload', shadowData.payload);

    // If payload exists and contains the state and desired sections
    if (payload && payload.state && payload.state.desired) {
      // Ensure whitelist section exists
      let whitelist = payload.state.desired.whitelist || [];

      // Add the deviceName to the whitelist if it's not already present
      if (!whitelist.includes(deviceName)) {
        whitelist.push(deviceName);
      }

      // Update the shadow with the new whitelist
      updatedShadow = {
        state: {
          desired: {
            ...payload.state.desired,
            whitelist: whitelist
          }
        }
      };

    } else {
      // If desired state does not exist or is not correctly structured, create the desired state and whitelist
      updatedShadow = {
        state: {
          desired: {
            whitelist: [deviceName] // Adding the deviceName to a new whitelist
          }
        }
      };
    }

    const updateParams = {
      thingName: thingName,
      shadowName: shadowName,
      payload: JSON.stringify(updatedShadow)
    };

    await iotdata.updateThingShadow(updateParams).promise();

    return res.status(200).json({ message: 'Device added to whitelist', updatedWhitelist: updatedShadow.state.desired.whitelist });
  } catch (error) {
    console.error('Error adding device to whitelist:', error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE: Remove a deviceName from the whitelist
app.delete('/IoTShadow/removeFromWhitelist', async (req, res) => {
  var { thingName, shadowName, deviceName } = req.body; // Expect thingName, shadowName, and deviceName in the request body

  thingName=thingName ?? defaultThingName;

  if (!thingName || !shadowName || !deviceName) {
    return res.status(400).json({ error: 'thingName, shadowName, and deviceName are required' });
  }

  try {
    // Get the current shadow
    const shadowParams = {
      thingName: thingName,
      shadowName: shadowName
    };

    const shadowData = await iotdata.getThingShadow(shadowParams).promise();
    const payload = JSON.parse(shadowData.payload);

    // Filter the whitelist to remove the deviceName
    let whitelist = payload.state.desired.whitelist || [];
    whitelist = whitelist.filter(device => device !== deviceName);

    // Update the shadow with the new whitelist
    const updatedShadow = {
      state: {
        desired: {
          whitelist: whitelist
        }
      }
    };

    const updateParams = {
      thingName: thingName,
      shadowName: shadowName,
      payload: JSON.stringify(updatedShadow)
    };

    await iotdata.updateThingShadow(updateParams).promise();

    return res.status(200).json({ message: 'Device removed from whitelist', updatedWhitelist: whitelist });
  } catch (error) {
    console.error('Error removing device from whitelist:', error);
    return res.status(500).json({ error: error.message });
  }
});
// Create a new shadow for a device
app.post('/IoTShadow/createShadow', async (req, res) => {
    var { thingName, shadowName, state } = req.body;

    thingName=thingName ?? defaultThingName;
    state = state ?? {};

    const params = {
	thingName:thingName,
	shadowName:shadowName,
        payload: JSON.stringify({ state })
    };

    try {
        const data = await iotdata.updateThingShadow(params).promise();
        res.json({ message: 'Shadow created successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a shadow for a device
app.delete('/IoTShadow/deleteShadow', async (req, res) => {
    var { thingName , shadowName } = req.body;
    thingName=thingName ?? defaultThingName;

    const params = {
	thingName:thingName,
	shadowName:shadowName
    };

    try {
        const data = await iotdata.deleteThingShadow(params).promise();
        res.json({ message: 'Shadow deleted successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the shadow of a device
app.get('/IoTShadow/getShadow', async (req, res) => {
    var {thingName, shadowName} = req.query;
    thingName=thingName ?? defaultThingName;

    const params = {
	    thingName:thingName,
	    shadowName:shadowName
    };

    try {
        const data = await iotdata.getThingShadow(params).promise();
        res.json({ message: 'Shadow retrieved successfully', data: JSON.parse(data.payload) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List thingNamed shadows for a device
app.get('/IoTShadow/listNamedShadows', async (req, res) => {
    var {thingName} = req.query;
    thingName=thingName ?? defaultThingName;

    const params = {
	    thingName: thingName
    };

    try {
        const data = await iotdata.listNamedShadowsForThing(params).promise();
        res.json({ message: 'Named shadows listed successfully', shadows: data.results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update the shadow of a device
app.post('/IoTShadow/updateShadow', async (req, res) => {
    var { thingName , shadowName , state } = req.body;
    thingName=thingName ?? defaultThingName;
    state = state ?? {};

    const params = {
        thingName,
	shadowName:shadowName,
        payload: JSON.stringify({ state })
    };

    try {
        const data = await iotdata.updateThingShadow(params).promise();
        res.json({ message: 'Shadow updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
