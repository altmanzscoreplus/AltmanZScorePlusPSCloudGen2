import { defineFunction } from '@aws-amplify/backend';

export const getAnalyzersForAGateway = defineFunction({
  name: 'get-analyzers-for-a-gateway',
  entry: './handler.ts',
  environment: {
    IOT_ENDPOINT: process.env.IOT_ENDPOINT || '',
    IOT_TOPIC: process.env.IOT_TOPIC || 'powersight/analyzers',
  },
  runtime: 22,
  timeoutSeconds: 60,
});