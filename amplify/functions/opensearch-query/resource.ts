import { defineFunction } from '@aws-amplify/backend';

export const openSearchQuery = defineFunction({
  name: 'opensearch-query',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
  memoryMB: 256,
});
