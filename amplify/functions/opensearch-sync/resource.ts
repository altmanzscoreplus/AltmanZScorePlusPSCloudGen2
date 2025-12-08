import { defineFunction } from '@aws-amplify/backend';

export const openSearchSync = defineFunction({
  name: 'opensearch-sync',
  entry: './handler.ts',
  environment: {
    OPENSEARCH_ENDPOINT: process.env.OPENSEARCH_ENDPOINT || '',
    OPENSEARCH_CLUSTER_NAME: process.env.OPENSEARCH_CLUSTER_NAME || 'powersight-search-cluster',
  },
  runtime: 22,
  timeoutSeconds: 60,
  memoryMB: 512,
});
