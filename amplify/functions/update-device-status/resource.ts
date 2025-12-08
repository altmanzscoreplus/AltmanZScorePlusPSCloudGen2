import { defineFunction } from '@aws-amplify/backend';

export const updateDeviceStatus = defineFunction({
  name: 'update-device-status',
  entry: './handler.ts',
  environment: {
    DEVICE_TIMEOUT: process.env.DEVICE_TIMEOUT || '300', // 5 minutes default
  },
  runtime: 22,
  timeoutSeconds: 60,
});