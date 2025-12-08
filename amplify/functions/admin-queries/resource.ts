import { defineFunction } from '@aws-amplify/backend';

export const adminQueries = defineFunction({
  name: 'admin-queries',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
});