import { defineBackend } from '@aws-amplify/backend';
import * as iam from 'aws-cdk-lib/aws-iam';
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

// REST APIs
//import { powersightRestApi, adminQueriesApi, validateEmailApi } from './rest-api/resource';

// OpenSearch
//import { openSearchSync, createOpenSearchCluster } from './opensearch/resource';

export const backend = defineBackend({
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
  // REST APIs
  // powersightRestApi,
  // adminQueriesApi,
  // validateEmailApi,
  // OpenSearch
  //openSearchSync,
});

// TODO: Add OpenSearch cluster configuration using proper CDK backend extension
// The current backend.backend.node.addValidation() approach is not valid for Amplify Gen 2
// Need to use backend.createStack() for custom CDK resources