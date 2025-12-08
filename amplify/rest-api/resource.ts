import { defineHttpApi } from '@aws-amplify/backend';

export const powersightRestApi = defineHttpApi({
  name: 'powersight-rest-api',
  definition: {
    '/batchDeleteAnalyzer': {
      methods: ['POST', 'PUT', 'DELETE'],
      handler: {
        entry: '../functions/batch-delete-analyzer/handler.ts',
        name: 'batch-delete-analyzer'
      }
    },
    '/batchDeleteCustomer': {
      methods: ['POST', 'PUT', 'DELETE'],
      handler: {
        entry: '../functions/batch-delete-customer/handler.ts',
        name: 'batch-delete-customer'
      }
    },
    '/batchDeleteGateway': {
      methods: ['POST', 'PUT', 'DELETE'],
      handler: {
        entry: '../functions/batch-delete-gateway/handler.ts',
        name: 'batch-delete-gateway'
      }
    },
    '/getActiveDeviceRental': {
      methods: ['GET'],
      handler: {
        entry: '../functions/get-active-device-rental/handler.ts',
        name: 'get-active-device-rental'
      }
    },
    '/getAnalyzersForAGateway': {
      methods: ['GET'],
      handler: {
        entry: '../functions/get-analyzers-for-a-gateway/handler.ts',
        name: 'get-analyzers-for-a-gateway'
      }
    },
    '/sendAlarm': {
      methods: ['POST'],
      handler: {
        entry: '../functions/send-alarm/handler.ts',
        name: 'send-alarm'
      }
    },
    '/sendAlert': {
      methods: ['POST'],
      handler: {
        entry: '../functions/send-alert/handler.ts',
        name: 'send-alert'
      }
    },
    '/sendEMail': {
      methods: ['POST'],
      handler: {
        entry: '../functions/send-email/handler.ts',
        name: 'send-email'
      }
    },
    '/updateDevice': {
      methods: ['POST', 'GET', 'PUT'],
      handler: {
        entry: '../functions/update-device/handler.ts',
        name: 'update-device'
      }
    },
    '/sendPSFile': {
      methods: ['POST', 'GET', 'PUT'],
      handler: {
        entry: '../functions/update-device/handler.ts',
        name: 'update-device'
      }
    },
    '/getAutoIncrementedID': {
      methods: ['GET'],
      handler: {
        entry: '../functions/get-auto-incremented-id/handler.ts',
        name: 'get-auto-incremented-id'
      }
    },
    '/getFileNames': {
      methods: ['GET', 'DELETE'],
      handler: {
        entry: '../functions/get-file-names/handler.ts',
        name: 'get-file-names'
      }
    },
    '/IoTShadow/createShadow': {
      methods: ['POST'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/IoTShadow/deleteShadow': {
      methods: ['DELETE'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/IoTShadow/getShadow': {
      methods: ['GET'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/IoTShadow/listNamedShadows': {
      methods: ['GET'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/IoTShadow/updateShadow': {
      methods: ['PUT'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/IoTShadow/AddToWhitelist': {
      methods: ['POST', 'PUT'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/IoTShadow/RemoveFromWhitelist': {
      methods: ['POST', 'PUT', 'DELETE'],
      handler: {
        entry: '../functions/iot-shadow/handler.ts',
        name: 'iot-shadow'
      }
    },
    '/upgradeFirmware': {
      methods: ['POST'],
      handler: {
        entry: '../functions/upgrade-firmware/handler.ts',
        name: 'upgrade-firmware'
      }
    },
    '/getFirmwareFileNames': {
      methods: ['GET'],
      handler: {
        entry: '../functions/get-firmware-file-names/handler.ts',
        name: 'get-firmware-file-names'
      }
    },
    '/s3/get-object': {
      methods: ['GET'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    '/s3/delete-object': {
      methods: ['DELETE'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    '/s3/get-object-tagging': {
      methods: ['GET'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    '/s3/put-object-tagging': {
      methods: ['POST', 'PUT'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    '/s3/get-signed-url': {
      methods: ['GET'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    '/s3/head-object': {
      methods: ['HEAD'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    '/s3/put-object': {
      methods: ['POST', 'PUT'],
      handler: {
        entry: '../functions/s3/handler.ts',
        name: 's3'
      }
    },
    // Device management APIs
    '/updateDeviceStatus': {
      methods: ['POST', 'PUT'],
      handler: {
        entry: '../functions/update-device-status/handler.ts',
        name: 'update-device-status'
      }
    },
    '/updateDeviceCommunicationStatus': {
      methods: ['POST', 'PUT'],
      handler: {
        entry: '../functions/update-device-communication-status/handler.ts',
        name: 'update-device-communication-status'
      }
    },
    '/syncGatewayWithIoT': {
      methods: ['POST'],
      handler: {
        entry: '../functions/sync-gateway-with-iot/handler.ts',
        name: 'sync-gateway-with-iot'
      }
    },
    '/syncAnalyzerWithIoT': {
      methods: ['POST'],
      handler: {
        entry: '../functions/sync-analyzer-with-iot/handler.ts',
        name: 'sync-analyzer-with-iot'
      }
    },
    '/addPasswordProtection': {
      methods: ['POST'],
      handler: {
        entry: '../functions/add-password-protection/handler.ts',
        name: 'add-password-protection'
      }
    }
  }
});

// Create separate API for Admin functions
export const adminQueriesApi = defineHttpApi({
  name: 'admin-queries-api',
  definition: {
    '/listUsers': {
      methods: ['GET'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/listUsersInGroup': {
      methods: ['GET'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/getUser': {
      methods: ['GET'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/listGroupsForUser': {
      methods: ['GET'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/listGroups': {
      methods: ['GET'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/addUserToGroup': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/removeUserFromGroup': {
      methods: ['POST', 'DELETE'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/confirmUserSignUp': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/disableUser': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/enableUser': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/createGroup': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/createUser': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    },
    '/setUserPassword': {
      methods: ['POST'],
      handler: {
        entry: '../functions/AdminQueries2855213c/handler.ts',
        name: 'AdminQueries2855213c'
      }
    }
  }
});

// Email validation API
export const validateEmailApi = defineHttpApi({
  name: 'validate-email-api',
  definition: {
    '/validate': {
      methods: ['POST'],
      handler: {
        entry: '../functions/validateEMail/handler.ts',
        name: 'validateEMail'
      }
    }
  }
});