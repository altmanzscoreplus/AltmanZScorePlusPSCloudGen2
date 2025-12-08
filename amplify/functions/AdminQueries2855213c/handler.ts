import type { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminConfirmSignUpCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminUserGlobalSignOutCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CreateGroupCommand,
  ListGroupsCommand,
  ListUsersCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const userPoolId = process.env.USERPOOL_ID;

const allowedGroups = ["Admin", "AdminMaster", "CustomerMaster", "ClientMaster"];

interface CognitoUser {
  Username: string;
  UserAttributes: Array<{Name: string; Value: string}>;
  UserStatus: string;
  Enabled: boolean;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('AdminQueries event:', JSON.stringify(event, null, 2));

    const path = event.path;
    const method = event.httpMethod;

    // Check if user has required permissions
    const userGroups = event.requestContext?.authorizer?.claims?.['cognito:groups']?.split(',') || [];
    if (!userGroups.some((group: string) => allowedGroups.includes(group))) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'User does not have permissions to perform administrative tasks'
        })
      };
    }

    let response;

    switch (`${method}:${path}`) {
      case 'GET:/listUsers':
        response = await handleListUsers(event.queryStringParameters);
        break;
      case 'GET:/listUsersInGroup':
        response = await handleListUsersInGroup(event.queryStringParameters);
        break;
      case 'GET:/getUser':
        response = await handleGetUser(event.queryStringParameters);
        break;
      case 'GET:/listGroupsForUser':
        response = await handleListGroupsForUser(event.queryStringParameters);
        break;
      case 'GET:/listGroups':
        response = await handleListGroups(event.queryStringParameters);
        break;
      case 'POST:/addUserToGroup':
        response = await handleAddUserToGroup(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/removeUserFromGroup':
        response = await handleRemoveUserFromGroup(JSON.parse(event.body || '{}'));
        break;
      case 'DELETE:/removeUserFromGroup':
        response = await handleRemoveUserFromGroup(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/confirmUserSignUp':
        response = await handleConfirmUserSignUp(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/disableUser':
        response = await handleDisableUser(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/enableUser':
        response = await handleEnableUser(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/createGroup':
        response = await handleCreateGroup(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/createUser':
        response = await handleCreateUser(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/setUserPassword':
        response = await handleSetUserPassword(JSON.parse(event.body || '{}'));
        break;
      case 'POST:/signUserOut':
        response = await handleSignUserOut(JSON.parse(event.body || '{}'), event.requestContext?.authorizer?.claims);
        break;
      default:
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Route not found' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('AdminQueries error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function handleListUsers(params: any) {
  const command = new ListUsersCommand({
    UserPoolId: userPoolId,
    Limit: params?.limit ? parseInt(params.limit) : 25,
    PaginationToken: params?.token
  });

  const result = await cognitoClient.send(command);
  
  // Rename to NextToken for consistency
  const response = {
    ...result,
    NextToken: result.PaginationToken
  };
  delete response.PaginationToken;
  
  return response;
}

async function handleListUsersInGroup(params: any) {
  if (!params?.groupname) {
    throw new Error('groupname is required');
  }

  const command = new ListUsersInGroupCommand({
    GroupName: params.groupname,
    UserPoolId: userPoolId,
    Limit: params?.limit ? parseInt(params.limit) : 25,
    NextToken: params?.token
  });

  return await cognitoClient.send(command);
}

async function handleGetUser(params: any) {
  if (!params?.username) {
    throw new Error('username is required');
  }

  const command = new AdminGetUserCommand({
    UserPoolId: userPoolId,
    Username: params.username
  });

  return await cognitoClient.send(command);
}

async function handleListGroupsForUser(params: any) {
  if (!params?.username) {
    throw new Error('username is required');
  }

  const command = new AdminListGroupsForUserCommand({
    UserPoolId: userPoolId,
    Username: params.username,
    Limit: params?.limit ? parseInt(params.limit) : 25,
    NextToken: params?.token
  });

  const result = await cognitoClient.send(command);
  
  // Filter out sensitive information
  result.Groups?.forEach((group) => {
    delete group.UserPoolId;
    delete group.LastModifiedDate;
    delete group.CreationDate;
    delete group.Precedence;
    delete group.RoleArn;
  });

  return result;
}

async function handleListGroups(params: any) {
  const command = new ListGroupsCommand({
    UserPoolId: userPoolId,
    Limit: params?.limit ? parseInt(params.limit) : 25,
    NextToken: params?.token
  });

  const result = await cognitoClient.send(command);

  return result;
}

async function handleAddUserToGroup(body: any) {
  if (!body.username || !body.groupname) {
    throw new Error('username and groupname are required');
  }

  const command = new AdminAddUserToGroupCommand({
    GroupName: body.groupname,
    UserPoolId: userPoolId,
    Username: body.username
  });

  await cognitoClient.send(command);
  
  return {
    message: `Success adding ${body.username} to ${body.groupname}`
  };
}

async function handleRemoveUserFromGroup(body: any) {
  if (!body.username || !body.groupname) {
    throw new Error('username and groupname are required');
  }

  const command = new AdminRemoveUserFromGroupCommand({
    GroupName: body.groupname,
    UserPoolId: userPoolId,
    Username: body.username
  });

  await cognitoClient.send(command);
  
  return {
    message: `Removed ${body.username} from ${body.groupname}`
  };
}

async function handleConfirmUserSignUp(body: any) {
  if (!body.username) {
    throw new Error('username is required');
  }

  const command = new AdminConfirmSignUpCommand({
    UserPoolId: userPoolId,
    Username: body.username
  });

  await cognitoClient.send(command);
  
  return {
    message: `Confirmed ${body.username} registration`
  };
}

async function handleDisableUser(body: any) {
  if (!body.username) {
    throw new Error('username is required');
  }

  const command = new AdminDisableUserCommand({
    UserPoolId: userPoolId,
    Username: body.username
  });

  await cognitoClient.send(command);
  
  return {
    message: `Disabled ${body.username}`
  };
}

async function handleEnableUser(body: any) {
  if (!body.username) {
    throw new Error('username is required');
  }

  const command = new AdminEnableUserCommand({
    UserPoolId: userPoolId,
    Username: body.username
  });

  await cognitoClient.send(command);
  
  return {
    message: `Enabled ${body.username}`
  };
}

async function handleCreateGroup(body: any) {
  if (!body.groupname) {
    throw new Error('groupname is required');
  }

  const command = new CreateGroupCommand({
    UserPoolId: userPoolId,
    GroupName: body.groupname,
    Description: body.description
  });

  const result = await cognitoClient.send(command);
  
  return {
    message: `Created group ${body.groupname}`,
    group: result.Group
  };
}

async function handleCreateUser(body: any) {
  if (!body.username) {
    throw new Error('username is required');
  }

  const userAttributes = [];
  if (body.email) userAttributes.push({ Name: 'email', Value: body.email });
  if (body.phone) userAttributes.push({ Name: 'phone_number', Value: body.phone });

  const command = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: body.username,
    UserAttributes: userAttributes,
    TemporaryPassword: body.temporaryPassword,
    MessageAction: body.messageAction || 'SEND'
  });

  const result = await cognitoClient.send(command);
  
  return {
    message: `Created user ${body.username}`,
    user: result.User
  };
}

async function handleSetUserPassword(body: any) {
  if (!body.username || !body.password) {
    throw new Error('username and password are required');
  }

  const command = new AdminSetUserPasswordCommand({
    UserPoolId: userPoolId,
    Username: body.username,
    Password: body.password,
    Permanent: body.permanent !== false
  });

  await cognitoClient.send(command);
  
  return {
    message: `Set password for ${body.username}`
  };
}

async function handleSignUserOut(body: any, claims: any) {
  if (!body.username) {
    throw new Error('username is required');
  }

  // Security check: only allow users to sign themselves out unless admin
  const requestingUser = claims?.username;
  if (body.username !== requestingUser && !allowedGroups.some(group => 
    claims?.['cognito:groups']?.includes(group)
  )) {
    throw new Error('Only the user can sign themselves out');
  }

  const command = new AdminUserGlobalSignOutCommand({
    UserPoolId: userPoolId,
    Username: body.username
  });

  await cognitoClient.send(command);
  
  return {
    message: `Signed out ${body.username} from all devices`
  };
}