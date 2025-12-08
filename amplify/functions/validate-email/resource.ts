import { defineFunction } from '@aws-amplify/backend';

export const validateEmail = defineFunction({
  name: 'validate-email',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
});