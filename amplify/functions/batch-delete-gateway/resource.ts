import { defineFunction } from '@aws-amplify/backend';

export const batchDeleteGateway = defineFunction({
  name: 'batch-delete-gateway',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 300, // 5 minutes for batch operations
});