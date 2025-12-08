import { defineFunction } from '@aws-amplify/backend';

export const updateIoTDataFromDynamoDBToGateway = defineFunction({
  name: 'update-iot-data-from-dynamodb-to-gateway',
  entry: './handler.ts',
  environment: {
    IOT_ENDPOINT: process.env.IOT_ENDPOINT || '',
  },
  runtime: 22,
  timeoutSeconds: 120,
});