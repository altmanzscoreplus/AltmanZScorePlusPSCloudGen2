import { defineBackend } from '@aws-amplify/backend';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

// Email and Notification Functions
import { sendEMail } from './functions/send-email/resource';
import { sendAlarm } from './functions/send-alarm/resource';
import { sendDisconnectAlarm } from './functions/send-disconnect-alarm/resource';

// Batch Delete Functions
import { batchDeleteAnalyzer } from './functions/batch-delete-analyzer/resource';
import { batchDeleteCustomer } from './functions/batch-delete-customer/resource';
import { batchDeleteGateway } from './functions/batch-delete-gateway/resource';

// IoT Functions
import { iotShadow } from './functions/iot-shadow/resource';
import { updateDevice } from './functions/update-device/resource';
import { upgradeFirmware } from './functions/upgrade-firmware/resource';

// Data Processing Functions
import { getAutoIncrementedID } from './functions/get-auto-incremented-id/resource';
import { populateReading } from './functions/populate-reading/resource';

// File and Storage Functions
import { getFileNames } from './functions/get-file-names/resource';
import { getFirmwareFileNames } from './functions/get-firmware-file-names/resource';
import { s3 } from './functions/s3/resource';

// Device Management Functions
import { updateDeviceStatus } from './functions/update-device-status/resource';
import { updateDeviceCommunicationStatusInAnalyzer } from './functions/update-device-communication-status-in-analyzer/resource';
import { updateDeviceCommunicationStatusInGateway } from './functions/update-device-communication-status-in-gateway/resource';
import { updateIoTDataFromDynamoDBToAnalyzer } from './functions/update-iot-data-from-dynamodb-to-analyzer/resource';
import { updateIoTDataFromDynamoDBToGateway } from './functions/update-iot-data-from-dynamodb-to-gateway/resource';

// Query Functions
import { getActiveDeviceRental } from './functions/get-active-device-rental/resource';
import { getAnalyzersForAGateway } from './functions/get-analyzers-for-a-gateway/resource';

// Alert and Protection Functions
import { sendAlert } from './functions/send-alert/resource';
import { addPasswordProtection } from './functions/add-password-protection/resource';

// Admin and Utility Functions
import { adminQueries } from './functions/AdminQueries2855213c/resource';
import { validateEmail } from './functions/validateEMail/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  // Email and Notification Functions
  sendEMail,
  sendAlarm,
  sendDisconnectAlarm,
  // Batch Delete Functions
  batchDeleteAnalyzer,
  batchDeleteCustomer,
  batchDeleteGateway,
  // IoT Functions
  iotShadow,
  updateDevice,
  upgradeFirmware,
  // Data Processing Functions
  getAutoIncrementedID,
  populateReading,
  // File and Storage Functions
  getFileNames,
  getFirmwareFileNames,
  s3,
  // Device Management Functions
  updateDeviceStatus,
  updateDeviceCommunicationStatusInAnalyzer,
  updateDeviceCommunicationStatusInGateway,
  updateIoTDataFromDynamoDBToAnalyzer,
  updateIoTDataFromDynamoDBToGateway,
  // Query Functions
  getActiveDeviceRental,
  getAnalyzersForAGateway,
  // Alert and Protection Functions
  sendAlert,
  addPasswordProtection,
  // Admin and Utility Functions
  adminQueries,
  validateEmail,
});

// ============================================================================
// REST API Configuration
// ============================================================================

// Get the stack from one of the Lambda functions
const apiStack = Stack.of(backend.adminQueries.resources.lambda);

// Create Cognito User Pool Authorizer
const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(apiStack, 'CognitoAuthorizer', {
  cognitoUserPools: [backend.auth.resources.userPool],
  authorizerName: 'PowerSightCognitoAuthorizer',
});

// Create REST API for PowerSight
const powerSightApi = new RestApi(apiStack, 'PowerSightApi', {
  restApiName: 'PowerSightApi',
  description: 'REST API for PowerSight application',
  deploy: true,
  deployOptions: {
    stageName: 'dev',
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
    ],
  },
});

// Create Lambda integrations
const adminQueriesIntegration = new LambdaIntegration(
  backend.adminQueries.resources.lambda
);

const validateEmailIntegration = new LambdaIntegration(
  backend.validateEmail.resources.lambda
);

const batchDeleteAnalyzerIntegration = new LambdaIntegration(
  backend.batchDeleteAnalyzer.resources.lambda
);

const batchDeleteCustomerIntegration = new LambdaIntegration(
  backend.batchDeleteCustomer.resources.lambda
);

const batchDeleteGatewayIntegration = new LambdaIntegration(
  backend.batchDeleteGateway.resources.lambda
);

const getActiveDeviceRentalIntegration = new LambdaIntegration(
  backend.getActiveDeviceRental.resources.lambda
);

const sendAlarmIntegration = new LambdaIntegration(
  backend.sendAlarm.resources.lambda
);

const sendEmailIntegration = new LambdaIntegration(
  backend.sendEMail.resources.lambda
);

const updateDeviceIntegration = new LambdaIntegration(
  backend.updateDevice.resources.lambda
);

const getAutoIncrementedIDIntegration = new LambdaIntegration(
  backend.getAutoIncrementedID.resources.lambda
);

const getFileNamesIntegration = new LambdaIntegration(
  backend.getFileNames.resources.lambda
);

const iotShadowIntegration = new LambdaIntegration(
  backend.iotShadow.resources.lambda
);

const upgradeFirmwareIntegration = new LambdaIntegration(
  backend.upgradeFirmware.resources.lambda
);

const getFirmwareFileNamesIntegration = new LambdaIntegration(
  backend.getFirmwareFileNames.resources.lambda
);

const s3Integration = new LambdaIntegration(
  backend.s3.resources.lambda
);

// Add API routes with Cognito authorization
// AdminQueries uses proxy path to handle multiple operations:
// GET: /listUsers, /listUsersInGroup, /getUser, /listGroupsForUser, /listGroups
// POST: /addUserToGroup, /removeUserFromGroup, /confirmUserSignUp, /disableUser,
//       /enableUser, /createGroup, /createUser, /setUserPassword, /signUserOut
// DELETE: /removeUserFromGroup
const adminQueriesPath = powerSightApi.root.addResource('adminQueries');
const adminQueriesProxy = adminQueriesPath.addResource('{proxy+}');
adminQueriesProxy.addMethod('ANY', adminQueriesIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

const validateEmailPath = powerSightApi.root.addResource('validateEmail');
validateEmailPath.addMethod('POST', validateEmailIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

// Batch Delete endpoints
powerSightApi.root
  .addResource('batchDeleteAnalyzer')
  .addMethod('POST', batchDeleteAnalyzerIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

powerSightApi.root
  .addResource('batchDeleteCustomer')
  .addMethod('POST', batchDeleteCustomerIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

powerSightApi.root
  .addResource('batchDeleteGateway')
  .addMethod('POST', batchDeleteGatewayIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// Query endpoints
powerSightApi.root
  .addResource('getActiveDeviceRental')
  .addMethod('GET', getActiveDeviceRentalIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// Email and Notification endpoints
powerSightApi.root
  .addResource('sendAlarm')
  .addMethod('POST', sendAlarmIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

powerSightApi.root
  .addResource('sendEMail')
  .addMethod('POST', sendEmailIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// Device Management endpoints
const updateDevicePath = powerSightApi.root.addResource('updateDevice');
updateDevicePath.addMethod('POST', updateDeviceIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

const sendPSFilePath = powerSightApi.root.addResource('sendPSFile');
sendPSFilePath.addMethod('POST', updateDeviceIntegration, {
  authorizationType: AuthorizationType.COGNITO,
  authorizer: cognitoAuthorizer,
});

// Data Processing endpoints
powerSightApi.root
  .addResource('getAutoIncrementedID')
  .addMethod('GET', getAutoIncrementedIDIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

powerSightApi.root
  .addResource('getFileNames')
  .addMethod('GET', getFileNamesIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// IoT Shadow endpoints
const iotShadowResource = powerSightApi.root.addResource('IoTShadow');

iotShadowResource
  .addResource('createShadow')
  .addMethod('POST', iotShadowIntegration, {
    authorizationType: AuthorizationType.NONE,
  });

iotShadowResource
  .addResource('deleteShadow')
  .addMethod('DELETE', iotShadowIntegration, {
    authorizationType: AuthorizationType.NONE,
  });

iotShadowResource
  .addResource('getShadow')
  .addMethod('GET', iotShadowIntegration, {
    authorizationType: AuthorizationType.NONE,
  });

iotShadowResource
  .addResource('listNamedShadows')
  .addMethod('GET', iotShadowIntegration, {
    authorizationType: AuthorizationType.NONE,
  });

iotShadowResource
  .addResource('updateShadow')
  .addMethod('PUT', iotShadowIntegration, {
    authorizationType: AuthorizationType.NONE,
  });

iotShadowResource
  .addResource('AddToWhitelist')
  .addMethod('POST', iotShadowIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

iotShadowResource
  .addResource('RemoveFromWhitelist')
  .addMethod('DELETE', iotShadowIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// Firmware endpoints
powerSightApi.root
  .addResource('upgradeFirmware')
  .addMethod('POST', upgradeFirmwareIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

powerSightApi.root
  .addResource('getFirmwareFileNames')
  .addMethod('GET', getFirmwareFileNamesIntegration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// S3 endpoints
const s3Resource = powerSightApi.root.addResource('s3');

s3Resource
  .addResource('get-object')
  .addMethod('GET', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

s3Resource
  .addResource('delete-object')
  .addMethod('DELETE', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

s3Resource
  .addResource('get-object-tagging')
  .addMethod('GET', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

s3Resource
  .addResource('put-object-tagging')
  .addMethod('PUT', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

s3Resource
  .addResource('get-signed-url')
  .addMethod('GET', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

s3Resource
  .addResource('head-object')
  .addMethod('GET', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

s3Resource
  .addResource('put-object')
  .addMethod('PUT', s3Integration, {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  });

// Add API output to backend
backend.addOutput({
  custom: {
    API: {
      [powerSightApi.restApiName]: {
        endpoint: powerSightApi.url,
        region: Stack.of(powerSightApi).region,
        apiName: powerSightApi.restApiName,
      },
    },
  },
});

// TODO: Add OpenSearch cluster configuration using proper CDK backend extension
// The current backend.backend.node.addValidation() approach is not valid for Amplify Gen 2
// Need to use backend.createStack() for custom CDK resources

export default backend;