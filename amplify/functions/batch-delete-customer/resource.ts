import { defineFunction } from '@aws-amplify/backend';

export const batchDeleteCustomer = defineFunction({
  name: 'batch-delete-customer',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 300, // 5 minutes for batch operations
});