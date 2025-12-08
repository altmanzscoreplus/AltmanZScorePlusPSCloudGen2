import { defineFunction } from '@aws-amplify/backend';

export const getActiveDeviceRental = defineFunction({
  name: 'get-active-device-rental',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
});