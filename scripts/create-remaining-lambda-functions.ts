#!/usr/bin/env node

/**
 * Script to create the remaining 10 Lambda functions
 * Run with: npx ts-node scripts/create-remaining-lambda-functions.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface FunctionConfig {
  name: string;
  category: 'iot' | 'data' | 'alert' | 'auth';
  timeout: number;
  environment?: Record<string, string>;
  dependencies: string[];
}

const remainingFunctions: FunctionConfig[] = [
  {
    name: 'update-device-status',
    category: 'iot',
    timeout: 30,
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb'],
  },
  {
    name: 'update-device-communication-status-in-analyzer',
    category: 'iot', 
    timeout: 30,
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb'],
  },
  {
    name: 'update-device-communication-status-in-gateway',
    category: 'iot',
    timeout: 30, 
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb'],
  },
  {
    name: 'update-iot-data-from-dynamodb-to-analyzer',
    category: 'iot',
    timeout: 60,
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb', '@aws-sdk/client-iot-data-plane'],
  },
  {
    name: 'update-iot-data-from-dynamodb-to-gateway', 
    category: 'iot',
    timeout: 60,
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb', '@aws-sdk/client-iot-data-plane'],
  },
  {
    name: 'get-active-device-rental',
    category: 'data',
    timeout: 30,
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb'],
  },
  {
    name: 'get-analyzers-for-a-gateway',
    category: 'data', 
    timeout: 30,
    dependencies: ['@aws-sdk/client-dynamodb', '@aws-sdk/lib-dynamodb', '@aws-sdk/client-iot-data-plane'],
  },
  {
    name: 'send-alert',
    category: 'alert',
    timeout: 60,
    dependencies: ['@aws-sdk/client-ses', '@aws-sdk/client-pinpoint'],
  },
  {
    name: 'add-password-protection',
    category: 'auth',
    timeout: 30,
    dependencies: ['@aws-sdk/client-cognito-identity-provider'],
  }
];

function createResourceFile(func: FunctionConfig): string {
  const envVars = func.environment ? 
    `\n  environment: {\n${Object.entries(func.environment).map(([key, value]) => `    ${key}: process.env.${key} || '${value}',`).join('\n')}\n  },` : '';

  return `import { defineFunction } from '@aws-amplify/backend';

export const ${func.name.replace(/-/g, '')} = defineFunction({
  name: '${func.name}',
  entry: './handler.ts',${envVars}
  runtime: 20,
  timeoutSeconds: ${func.timeout},
});`;
}

function createHandlerFile(func: FunctionConfig): string {
  const imports = func.category === 'iot' ? `
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
${func.dependencies.includes('@aws-sdk/client-iot-data-plane') ? "import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane';" : ''}

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
${func.dependencies.includes('@aws-sdk/client-iot-data-plane') ? 'const iotClient = new IoTDataPlaneClient({ region: process.env.AWS_REGION });' : ''}` : 
    func.category === 'data' ? `
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);` :
    func.category === 'alert' ? `
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PinpointClient, SendMessagesCommand } from '@aws-sdk/client-pinpoint';

const sesClient = new SESClient({ region: process.env.AWS_REGION });
const pinpointClient = new PinpointClient({ region: process.env.AWS_REGION });` :
    `import type { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });`;

  const handlerType = func.category === 'iot' ? 'Handler' : 'APIGatewayProxyHandler';
  const returnType = func.category === 'iot' ? `{
      statusCode: 200,
      body: JSON.stringify({
        message: '${func.name} completed successfully'
      })
    }` : `{
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '${func.name} completed successfully'
      })
    }`;

  return `${imports}

export const handler: ${handlerType} = async (event) => {
  try {
    console.log('${func.name} event:', JSON.stringify(event, null, 2));
    
    // TODO: Implement ${func.name} logic
    // This function needs to be implemented based on the original Gen 1 code
    
    return ${returnType};
  } catch (error) {
    console.error('Error in ${func.name}:', error);
    ${func.category === 'iot' ? 'throw error;' : `return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: '${func.name} failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };`}
  }
};`;
}

function createPackageJson(func: FunctionConfig): string {
  const deps = func.dependencies.reduce((acc, dep) => {
    acc[dep] = '^3.645.0';
    return acc;
  }, {} as Record<string, string>);

  return JSON.stringify({
    name: `${func.name}-function`,
    version: '1.0.0',
    type: 'module',
    dependencies: deps,
    devDependencies: {
      '@types/aws-lambda': '^8.10.145'
    }
  }, null, 2);
}

// Create directories and files
console.log('Creating remaining Lambda functions...\n');

for (const func of remainingFunctions) {
  const functionDir = path.join('amplify', 'functions', func.name);
  
  // Create directory
  fs.mkdirSync(functionDir, { recursive: true });
  
  // Create files
  fs.writeFileSync(path.join(functionDir, 'resource.ts'), createResourceFile(func));
  fs.writeFileSync(path.join(functionDir, 'handler.ts'), createHandlerFile(func));
  fs.writeFileSync(path.join(functionDir, 'package.json'), createPackageJson(func));
  
  console.log(`✅ Created ${func.name} (${func.category})`);
}

console.log('\n🎉 All remaining functions created successfully!');
console.log('\nNext steps:');
console.log('1. Review each function handler and implement the TODO sections');
console.log('2. Add the new functions to amplify/backend.ts');
console.log('3. Configure environment variables as needed');
console.log('4. Test each function individually');