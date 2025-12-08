import { defineFunction } from '@aws-amplify/backend';

export const updateDeviceCommunicationStatusInGateway = defineFunction({
  name: 'update-device-communication-status-in-gateway',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
});