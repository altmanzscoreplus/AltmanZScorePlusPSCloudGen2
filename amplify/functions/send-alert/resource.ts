import { defineFunction } from '@aws-amplify/backend';

export const sendAlert = defineFunction({
  name: 'send-alert',
  entry: './handler.ts',
  environment: {
    SENDER_EMAIL: process.env.SENDER_EMAIL || 'noreply@powersight.com',
    PINPOINT_APP_ID: process.env.PINPOINT_APP_ID || '',
    ORIGINATION_NUMBER: process.env.ORIGINATION_NUMBER || '',
  },
  runtime: 22,
  timeoutSeconds: 300,
});