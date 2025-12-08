import { defineFunction } from '@aws-amplify/backend';

export const getAutoIncrementedID = defineFunction({
  name: 'get-auto-incremented-id',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
});