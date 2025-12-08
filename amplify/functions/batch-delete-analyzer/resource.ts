import { defineFunction } from '@aws-amplify/backend';

export const batchDeleteAnalyzer = defineFunction({
  name: 'batch-delete-analyzer',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
});