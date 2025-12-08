import { defineFunction } from '@aws-amplify/backend';

export const populateReading = defineFunction({
  name: 'populate-reading',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
});