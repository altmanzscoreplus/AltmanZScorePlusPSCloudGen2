import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createHash, randomBytes } from 'crypto';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface PasswordProtectionRequest {
  entityType: 'gateway' | 'analyzer' | 'customer' | 'client';
  entityId: string;
  password: string;
  protectionLevel: 'view' | 'edit' | 'admin';
  expiresAt?: string;
  description?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Add password protection event:', JSON.stringify(event, null, 2));

    const request: PasswordProtectionRequest = JSON.parse(event.body || '{}');

    // Validate required fields
    const validation = validateRequest(request);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid request',
          details: validation.errors
        })
      };
    }

    // Check if entity exists
    const entityExists = await verifyEntityExists(request.entityType, request.entityId);
    if (!entityExists) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Entity not found',
          details: `${request.entityType} with ID ${request.entityId} does not exist`
        })
      };
    }

    // Generate salt and hash password
    const salt = randomBytes(32).toString('hex');
    const passwordHash = hashPassword(request.password, salt);

    // Create password protection entry
    const protectionId = `${request.entityType}-${request.entityId}-${Date.now()}`;
    const protection = {
      id: protectionId,
      entity_type: request.entityType,
      entity_id: request.entityId,
      password_hash: passwordHash,
      salt: salt,
      protection_level: request.protectionLevel,
      description: request.description || '',
      expires_at: request.expiresAt || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: event.requestContext?.authorizer?.claims?.sub || 'system'
    };

    // Save password protection
    await savePasswordProtection(protection);

    // Update entity with password protection flag
    await updateEntityProtectionStatus(request.entityType, request.entityId, true);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Password protection added successfully',
        protection_id: protectionId,
        entity_type: request.entityType,
        entity_id: request.entityId,
        protection_level: request.protectionLevel,
        expires_at: request.expiresAt,
        created_at: protection.created_at
      })
    };

  } catch (error) {
    console.error('Error adding password protection:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to add password protection',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

function validateRequest(request: PasswordProtectionRequest) {
  const errors: string[] = [];

  if (!request.entityType) {
    errors.push('entityType is required');
  }

  if (!request.entityId) {
    errors.push('entityId is required');
  }

  if (!request.password || request.password.length < 8) {
    errors.push('password is required and must be at least 8 characters long');
  }

  if (!request.protectionLevel) {
    errors.push('protectionLevel is required');
  }

  const validEntityTypes = ['gateway', 'analyzer', 'customer', 'client'];
  if (request.entityType && !validEntityTypes.includes(request.entityType)) {
    errors.push(`entityType must be one of: ${validEntityTypes.join(', ')}`);
  }

  const validProtectionLevels = ['view', 'edit', 'admin'];
  if (request.protectionLevel && !validProtectionLevels.includes(request.protectionLevel)) {
    errors.push(`protectionLevel must be one of: ${validProtectionLevels.join(', ')}`);
  }

  // Validate password strength
  if (request.password) {
    const passwordValidation = validatePasswordStrength(request.password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Validate expiration date if provided
  if (request.expiresAt) {
    const expirationDate = new Date(request.expiresAt);
    if (isNaN(expirationDate.getTime())) {
      errors.push('expiresAt must be a valid ISO 8601 date string');
    } else if (expirationDate <= new Date()) {
      errors.push('expiresAt must be a future date');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validatePasswordStrength(password: string) {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function hashPassword(password: string, salt: string): string {
  const hash = createHash('pbkdf2');
  hash.update(password + salt);
  return hash.digest('hex');
}

async function verifyEntityExists(entityType: string, entityId: string): Promise<boolean> {
  try {
    const tableNames = {
      gateway: 'Gateway',
      analyzer: 'Analyzer',
      customer: 'Customer',
      client: 'Client'
    };

    const tableName = tableNames[entityType as keyof typeof tableNames];
    if (!tableName) {
      return false;
    }

    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { id: entityId }
    });

    const result = await docClient.send(getCommand);
    return !!result.Item;
  } catch (error) {
    console.error('Error verifying entity exists:', error);
    return false;
  }
}

async function savePasswordProtection(protection: any) {
  const putCommand = new PutCommand({
    TableName: 'PasswordProtection',
    Item: protection,
    ConditionExpression: 'attribute_not_exists(id)'
  });

  await docClient.send(putCommand);
}

async function updateEntityProtectionStatus(entityType: string, entityId: string, isProtected: boolean) {
  try {
    const tableNames = {
      gateway: 'Gateway',
      analyzer: 'Analyzer',
      customer: 'Customer',
      client: 'Client'
    };

    const tableName = tableNames[entityType as keyof typeof tableNames];
    if (!tableName) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const updateCommand = new UpdateCommand({
      TableName: tableName,
      Key: { id: entityId },
      UpdateExpression: 'SET password_protected = :isProtected, updated_at = :updatedAt',
      ExpressionAttributeValues: {
        ':isProtected': isProtected,
        ':updatedAt': new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);
  } catch (error) {
    console.error('Error updating entity protection status:', error);
    // Don't throw error as this is not critical
  }
}