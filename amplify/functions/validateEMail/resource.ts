import { defineFunction } from '@aws-amplify/backend';

export const validateEmail = defineFunction({
  name: 'validateEMail',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
});