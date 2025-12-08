exports.handler = async (event, context) => {
    const { request } = event.Records[0].cf;
    
    // Define your username and password
    const expectedUsername = "admin";
    const expectedPassword = "AmplifyRocks!";
    
    // Extract the user-provided credentials from the request headers
    const providedCredentials = getCredentialsFromHeader(request.headers);
    
    // Check if the provided credentials match the expected ones
    if (!credentialsMatch(expectedUsername, expectedPassword, providedCredentials)) {
        return createUnauthorizedResponse();
    }
    
    // If credentials are valid, allow the request to continue
    return request;
};

function getCredentialsFromHeader(headers) {
    if (!headers || !headers.authorization) {
        return null;
    }
    
    const authHeader = headers.authorization[0].value;
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [username, password] = decodedCredentials.split(':');
    
    return { username, password };
}

function credentialsMatch(expectedUsername, expectedPassword, providedCredentials) {
    return providedCredentials &&
           providedCredentials.username === expectedUsername &&
           providedCredentials.password === expectedPassword;
}

function createUnauthorizedResponse() {
    const unauthorizedResponse = {
        status: '401',
        statusDescription: 'Unauthorized',
        body: 'Unauthorized',
        headers: {
            'www-authenticate': [{ key: 'WWW-Authenticate', value: 'Basic realm="Restricted"' }]
        }
    };
    
    return unauthorizedResponse;
}
