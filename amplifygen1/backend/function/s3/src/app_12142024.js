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

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


// 1. HeadObjectCommand
app.get('/s3/head-object/:key', async (req, res) => {
  const { key } = req.params;
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
app.get('/s3/get-object/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3Client.send(command);
    response.Body.pipe(res); // Stream the file directly to the response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. DeleteObjectCommand
app.delete('/s3/delete-object/:key', async (req, res) => {
  const { key } = req.params;
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
app.post('/s3/put-object/:key', async (req, res) => {
  const { key } = req.params;
  const { body } = req;
  try {
    const command = new PutObjectCommand({ 
      Bucket: BUCKET_NAME, 
      Key: key, 
      Body: JSON.stringify(body) // Assuming JSON body
    });
    const response = await s3Client.send(command);
    //res.set({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. GetObjectTaggingCommand
app.get('/s3/get-object-tagging/:key', async (req, res) => {
  const { key } = req.params;
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
app.post('/s3/put-object-tagging/:key', async (req, res) => {
  const { key } = req.params;
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
app.get('/s3/get-signed-url/:key', async (req, res) => {
  const { key } = req.params;
  const { expiresIn } = req.query; // Optional query param for expiration time in seconds
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresIn ? parseInt(expiresIn) : 3600 });
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
