import { defineFunction } from '@aws-amplify/backend';

export const updateIoTDataFromDynamoDBToAnalyzer = defineFunction({
  name: 'update-iot-data-from-dynamodb-to-analyzer',
  entry: './handler.ts',
  environment: {
    IOT_ENDPOINT: process.env.IOT_ENDPOINT || '',
  },
  runtime: 22,
  timeoutSeconds: 120,
});