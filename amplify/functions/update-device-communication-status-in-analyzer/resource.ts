import { defineFunction } from '@aws-amplify/backend';

export const updateDeviceCommunicationStatusInAnalyzer = defineFunction({
  name: 'update-device-communication-status-in-analyzer',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
});