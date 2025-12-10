import { defineFunction } from '@aws-amplify/backend';

export const openSearchSync = defineFunction({
  name: 'opensearch-sync',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
  memoryMB: 512,
});
