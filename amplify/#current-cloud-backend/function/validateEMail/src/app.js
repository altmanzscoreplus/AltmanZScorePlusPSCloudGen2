/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express')
const dns = require('dns').promises;
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
  next()
});


const checkMXRecords = async (domain) => {
    console.log('Checking MX records for domain:', domain);
    try {
        const promise = dns.resolveMx(domain);
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('DNS query timed out')), 5000) // Set a timeout for DNS queries
        );
        const mxRecords = await Promise.race([promise, timeout]);
        console.log('MX Records:', mxRecords);
        return { valid: mxRecords.length > 0, error: null };
    } catch (error) {
        console.error('DNS error checking MX records:', error);
        return { valid: false, error: error.message || 'DNS error occurred' };
    }
};

const getDomainFromEmail = (email) => email.split('@')[1];

app.post('/validateEmail', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const domain = getDomainFromEmail(email);
    const result = await checkMXRecords(domain);
    if (result.valid) {
	    res.status(200).json({
		        message: 'Email domain has valid MX records.',
		        url: req.url,
		        body: req.body
	    });

    } else {
	    res.status(400).json({
		    message: `Email domain does not habe valid MX records: ${result.error}`,
		        url: req.url,
		        body: req.body
	    });

    }
  // Add your code here
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app



