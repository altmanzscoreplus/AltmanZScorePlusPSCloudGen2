import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

// OpenSearch client configuration - now uses the shared cluster
const client = new Client({
  ...AwsSigv4Signer({
    region: process.env.AWS_REGION || 'us-east-1',
    service: 'es',
    getCredentials: () => Promise.resolve({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    }),
  }),
  node: process.env.OPENSEARCH_ENDPOINT!,
});

// Mapping of DynamoDB table names to OpenSearch indices
// This ensures all searchable models use the shared cluster
const SEARCHABLE_MODELS = new Set([
  'Customer',
  'Contact', 
  'Gateway',
  'GatewayRental',
  'Analyzer',
  'AnalyzerRental',
  'Reading',
  'Client',
  'PSFile',
  'Domain',
  'GatewayAlarmLevelAndInterval',
  'AnalyzerAlarmLevelAndInterval',
  'CustomerAlarmLevelAndInterval',
  'ClientAlarmLevelAndInterval',
  'GlobalAlarmLevelAndInterval',
  'AdminAlarmLevelAndInterval',
  'AdminContact',
  'AlarmMessage'
]);

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing DynamoDB stream event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (error) {
      console.error('Error processing record:', error);
      // Don't throw error to avoid stopping the batch processing
    }
  }
};

async function processRecord(record: DynamoDBRecord) {
  const tableName = record.eventSourceARN?.split('/')[1];
  if (!tableName) {
    console.log('Unable to determine table name from ARN');
    return;
  }

  // Extract the model name (remove the generated suffix)
  const modelName = tableName.split('-')[0];
  
  // Only process records for searchable models
  if (!SEARCHABLE_MODELS.has(modelName)) {
    console.log(`Skipping non-searchable model: ${modelName}`);
    return;
  }
  
  const indexName = modelName.toLowerCase();
  console.log(`Processing record for searchable model: ${modelName} -> index: ${indexName}`);

  switch (record.eventName) {
    case 'INSERT':
    case 'MODIFY':
      if (record.dynamodb?.NewImage) {
        const document = unmarshallDynamoDBRecord(record.dynamodb.NewImage);
        await indexDocument(indexName, document);
      }
      break;
    
    case 'REMOVE':
      if (record.dynamodb?.Keys) {
        const keys = unmarshallDynamoDBRecord(record.dynamodb.Keys);
        await deleteDocument(indexName, keys.id);
      }
      break;
  }
}

async function indexDocument(indexName: string, document: any) {
  try {
    const response = await client.index({
      index: indexName,
      id: document.id,
      body: document,
    });
    
    console.log(`Indexed document in ${indexName}:`, response.body);
  } catch (error) {
    console.error(`Error indexing document in ${indexName}:`, error);
  }
}

async function deleteDocument(indexName: string, id: string) {
  try {
    const response = await client.delete({
      index: indexName,
      id: id,
    });
    
    console.log(`Deleted document from ${indexName}:`, response.body);
  } catch (error) {
    console.error(`Error deleting document from ${indexName}:`, error);
  }
}

function unmarshallDynamoDBRecord(record: any): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'object' && value !== null) {
      // Handle DynamoDB attribute types
      if ('S' in value) result[key] = value.S;
      else if ('N' in value) result[key] = Number(value.N);
      else if ('BOOL' in value) result[key] = value.BOOL;
      else if ('SS' in value) result[key] = value.SS;
      else if ('NS' in value) result[key] = (value.NS as string[]).map(Number);
      else if ('L' in value) result[key] = (value.L as any[]).map(unmarshallDynamoDBRecord);
      else if ('M' in value) result[key] = unmarshallDynamoDBRecord(value.M);
      else if ('NULL' in value) result[key] = null;
      else result[key] = value;
    } else {
      result[key] = value;
    }
  }
  
  return result;
}