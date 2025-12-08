import { defineFunction } from '@aws-amplify/backend';

export const adminQueries = defineFunction({
  name: 'AdminQueries2855213c',
  entry: './handler.ts',
  environment: {
    USERPOOL_ID: process.env.USERPOOL_ID || '',
  },
  runtime: 22,
  timeoutSeconds: 60,
});