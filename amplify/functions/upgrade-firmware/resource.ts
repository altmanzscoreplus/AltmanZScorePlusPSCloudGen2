import { defineFunction } from '@aws-amplify/backend';

export const upgradeFirmware = defineFunction({
  name: 'upgrade-firmware',
  entry: './handler.ts',
  environment: {
    FIRMWARE_BUCKET_NAME: process.env.FIRMWARE_BUCKET_NAME || '',
    IOT_DEVICE_ENDPOINT: process.env.IOT_DEVICE_ENDPOINT || '',
    THING_NAME: process.env.THING_NAME || '',
  },
  runtime: 22,
  timeoutSeconds: 300, // 5 minutes for firmware operations
});