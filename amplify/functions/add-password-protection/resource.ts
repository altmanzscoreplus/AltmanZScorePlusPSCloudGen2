import { defineFunction } from '@aws-amplify/backend';

export const addPasswordProtection = defineFunction({
  name: 'add-password-protection',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
});