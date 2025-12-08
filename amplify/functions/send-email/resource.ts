import { defineFunction } from '@aws-amplify/backend';

export const sendEMail = defineFunction({
  name: 'send-email',
  entry: './handler.ts',
  environment: {
    SENDER_EMAIL: process.env.SENDER_EMAIL || 'noreply@powersight.com',
  },
  runtime: 22,
  timeoutSeconds: 30,
});