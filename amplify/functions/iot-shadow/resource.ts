import { defineFunction } from '@aws-amplify/backend';

export const iotShadow = defineFunction({
  name: 'iot-shadow',
  entry: './handler.ts',
  environment: {
    IOT_ENDPOINT: process.env.IOT_ENDPOINT || '',
    DEFAULT_THING_NAME: process.env.DEFAULT_THING_NAME || 'default-thing',
  },
  runtime: 22,
  timeoutSeconds: 60,
});