/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	AWS_BUCKET_NAME
Amplify Params - DO NOT EDIT */

// Import dependencies
const express = require('express');
const { S3Client, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand, PutObjectCommand, GetObjectTaggingCommand, PutObjectTaggingCommand } = require('@aws-sdk/client-s3');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')


// AWS S3 Client configuration
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT")
  next()
});


function detectStringType(input) {
    if (isJSON(input)) {
        return 'JSON';
    } else if (isBase64(input)) {
        return 'Base64';
    } else {
        return 'Plain Text';
    }
}

// Check if the string is valid JSON
function isJSON(string) {
    try {
        const obj = JSON.parse(string);
        // Additional check: Ensure it's an object or array
        return typeof obj === 'object' || Array.isArray(obj);
    } catch (e) {
        return false;
    }
}

// Check if the string is valid Base64
function isBase64(string) {
    if (typeof string !== 'string' || string.length % 4 !== 0) {
        return false;
    }
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
    return base64Regex.test(string);
}
// 1. HeadObjectCommand
app.get('/s3/head-object', async (req, res) => {

  const { key } = req.query;
  console.log(`key ${key}`);

  try {
    const command = new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3Client.send(command);
    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ metadata: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GetObjectCommand
app.get('/s3/get-object', async (req, res) => {
  const { key } = req.query;
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3Client.send(command);
    response.Body.pipe(res); // Stream the file directly to the response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. DeleteObjectCommand
app.delete('/s3/delete-object', async (req, res) => {
  const { key } = req.query;
  try {
    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3Client.send(command);
    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PutObjectCommand
app.put('/s3/put-object', async (req, res) => {
   console.log('put-object');

  //console.log(JSON.stringify(req));

  //const key = "test.txt";
  //const body = {"name": "example", "description": "Sample data"};
  const { key,data,type } = req.body;


  //console.log(`key ${key} data ${data} type ${type}`);

  //const { body } = req.body;
  //console.log(`body ${body}`);

  try {
    /*const command = new PutObjectCommand({ 
      Bucket: BUCKET_NAME, 
      Key: key, 
      Body: typeof data === 'string' ? (Buffer.from(data, 'base64').toString('base64') === data ? Buffer.from(data, 'base64') : data) : JSON.stringify(data) // Assuming base64 encoded binary data // Assuming JSON data

      //Body: JSON.stringify(data) // Assuming JSON body
      //Body: JSON.stringify(data) // Assuming JSON body
    });*/

const Body = (() => {

        switch (type) {
            case 'Base64':
                return Buffer.from(data, 'base64'); // Handle Base64-encoded binary
            case 'JSON':
                return JSON.stringify(data); // Handle JSON string
            case 'Plain Text':
            default:
                return data; // Treat as plain text
        }
    }

)();

	  /*
     const Body = (() => {
	      if (typeof rawBody === 'string') {
		              const isBase64 = (str) => {
				                try {
							            return Buffer.from(str, 'base64').toString('base64') === str;
							          } catch {
									              return false;
									            }
				              };

		              if (isBase64(rawBody)) {
				                return Buffer.from(rawBody, 'base64'); // Handle base64-encoded binary
				              }
		              return rawBody; // Treat as plain text
		            }
	      return JSON.stringify(rawBody); // Handle JSON object
	    })();
	    */

     const command = new PutObjectCommand({ 
	      Bucket: BUCKET_NAME, 
	      Key: key, 
	      Body 
	    });

    const response = await s3Client.send(command);
    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ success: true, response });
  } catch (error) {
    console.log('error',JSON.stringify(error.message));
    res.status(500).json({ error: error.message });
  }
});

// 5. GetObjectTaggingCommand
app.get('/s3/get-object-tagging', async (req, res) => {
  const { key } = req.query;
  try {
    const command = new GetObjectTaggingCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3Client.send(command);
    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ tags: response.TagSet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. PutObjectTaggingCommand
app.post('/s3/put-object-tagging', async (req, res) => {
  const { key } = req.query;
  const { tags } = req.body; // Expected format: { tags: [{ Key: "tagKey", Value: "tagValue" }, ...] }
  try {
    const command = new PutObjectTaggingCommand({ 
      Bucket: BUCKET_NAME, 
      Key: key, 
      Tagging: { TagSet: tags }
    });
    const response = await s3Client.send(command);
    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. getSignedURL
app.get('/s3/get-signed-url', async (req, res) => {
  const { key } = req.query;
  const { expiresIn } = req.query.expiresIn ? parseInt(req.query.expiresIn) : 3600; // Optional query param for expiration time in seconds
  console.log(`key ${key} expiresIn ${expiresIn}`);

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresIn ? parseInt(expiresIn) : 3600 });  
    console.log(`signedUrl = ${signedUrl}`);

    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
