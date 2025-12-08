import { defineFunction } from '@aws-amplify/backend';

export const sendAlarm = defineFunction({
  name: 'send-alarm',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
});