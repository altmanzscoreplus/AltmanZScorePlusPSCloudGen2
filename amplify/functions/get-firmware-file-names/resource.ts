import { defineFunction } from '@aws-amplify/backend';

export const getFirmwareFileNames = defineFunction({
  name: 'get-firmware-file-names',
  entry: './handler.ts',
  environment: {
    FIRMWARE_S3_BUCKET: process.env.FIRMWARE_S3_BUCKET || '',
  },
  runtime: 22,
  timeoutSeconds: 30,
});