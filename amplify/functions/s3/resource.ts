import { defineFunction } from '@aws-amplify/backend';

export const s3 = defineFunction({
  name: 's3',
  entry: './handler.ts',
  environment: {
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || '',
  },
  runtime: 22,
  timeoutSeconds: 60,
});