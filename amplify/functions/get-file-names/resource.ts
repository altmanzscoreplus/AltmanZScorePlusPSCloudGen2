import { defineFunction } from '@aws-amplify/backend';

export const getFileNames = defineFunction({
  name: 'get-file-names',
  entry: './handler.ts',
  environment: {
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || '',
  },
  runtime: 22,
  timeoutSeconds: 30,
});