import { defineFunction } from '@aws-amplify/backend';

export const updateDevice = defineFunction({
  name: 'update-device',
  entry: './handler.ts',
  environment: {
    IOT_ENDPOINT: process.env.IOT_ENDPOINT || '',
  },
  runtime: 22,
  timeoutSeconds: 30,
});