import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

Amplify.configure(outputs);

// Create the GraphQL client
export const client = generateClient<Schema>();

// Export common Amplify modules that might be used in your app
export { 
  Amplify,
  outputs as amplifyConfig 
};

// Example of how to use the client (remove this in production)
console.log('Amplify configured successfully');
console.log('Available auth groups:', outputs.auth?.groups);