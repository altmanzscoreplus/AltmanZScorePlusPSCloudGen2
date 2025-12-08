import type { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ListUsersCommand, AdminGetUserCommand, AdminCreateUserCommand, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Admin queries event:', JSON.stringify(event, null, 2));

    // Verify admin permissions (this would typically check JWT claims)
    const isAdmin = await verifyAdminPermissions(event);
    if (!isAdmin) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Admin permissions required'
        })
      };
    }

    const { resource, httpMethod } = event;
    const userPoolId = process.env.USER_POOL_ID;

    if (!userPoolId) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'USER_POOL_ID environment variable not set'
        })
      };
    }

    // Handle different admin operations
    if (resource.includes('/listUsers') && httpMethod === 'POST') {
      return await listUsers(userPoolId);
    } else if (resource.includes('/getUser') && httpMethod === 'POST') {
      const { username } = JSON.parse(event.body || '{}');
      return await getUser(userPoolId, username);
    } else if (resource.includes('/createUser') && httpMethod === 'POST') {
      const { username, email, tempPassword } = JSON.parse(event.body || '{}');
      return await createUser(userPoolId, username, email, tempPassword);
    } else if (resource.includes('/deleteUser') && httpMethod === 'POST') {
      const { username } = JSON.parse(event.body || '{}');
      return await deleteUser(userPoolId, username);
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Unsupported admin operation'
        })
      };
    }

  } catch (error) {
    console.error('Error in admin queries:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Admin operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function verifyAdminPermissions(event: any): Promise<boolean> {
  // TODO: Implement proper JWT token verification and group membership check
  // This should verify that the user belongs to Admin or AdminMaster groups
  console.log('TODO: Implement admin permission verification');
  return true; // Temporary - should be replaced with actual verification
}

async function listUsers(userPoolId: string) {
  try {
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 60
    });

    const response = await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        users: response.Users || [],
        paginationToken: response.PaginationToken
      })
    };
  } catch (error) {
    throw error;
  }
}

async function getUser(userPoolId: string, username: string) {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: username
    });

    const response = await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: response
      })
    };
  } catch (error) {
    throw error;
  }
}

async function createUser(userPoolId: string, username: string, email: string, tempPassword: string) {
  try {
    const command = new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        }
      ],
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS' // Don't send welcome email
    });

    const response = await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: response.User,
        message: 'User created successfully'
      })
    };
  } catch (error) {
    throw error;
  }
}

async function deleteUser(userPoolId: string, username: string) {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: username
    });

    await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'User deleted successfully'
      })
    };
  } catch (error) {
    throw error;
  }
}