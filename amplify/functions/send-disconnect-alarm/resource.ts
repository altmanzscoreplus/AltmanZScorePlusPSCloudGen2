import { defineFunction } from '@aws-amplify/backend';

export const sendDisconnectAlarm = defineFunction({
  name: 'send-disconnect-alarm',
  entry: './handler.ts',
  environment: {
    PINPOINT_APP_ID: process.env.PINPOINT_APP_ID || '',
    PINPOINT_REGION: process.env.PINPOINT_REGION || 'us-west-1',
    ORIGINATION_NUMBER: process.env.ORIGINATION_NUMBER || '',
    SES_RECIPIENT_EMAIL: process.env.SES_RECIPIENT_EMAIL || '',
  },
  runtime: 22,
  timeoutSeconds: 300, // 5 minutes for complex alarm processing
});