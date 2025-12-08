
const aws = require('aws-sdk');
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require('fs').promises;

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

app.post('/sendEMail', async function(req, res) {
  const senderEmail = process.env.SENDER_EMAIL;
  const receiverEmail = req.body; // assuming receiver_email is passed in the event

    if (!senderEmail) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'SENDER_EMAIL environment variable is not set'
            }),
        };
    }

    if (!receiverEmail) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'receiver_email is not provided in the request'
            }),
        };
    }

    const params = {
        Destination: {
            ToAddresses: [receiverEmail],
        },
        Message: {
            Body: {
                Text: { Data: "Hello, this is a test email from AWS SES via Lambda!" },
            },
            Subject: { Data: "Test Email from Lambda" },
        },
        Source: senderEmail,
    };

    try {
        await ses.sendEmail(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Email sent successfully'
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to send email',
                error: error.message,
            }),
        };
    }
});



app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
