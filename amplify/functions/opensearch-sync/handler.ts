import { DynamoDBStreamEvent, DynamoDBRecord } from 'aws-lambda';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

// OpenSearch client configuration - uses the shared cluster
const getClient = async () => {
  return new Client({
    ...AwsSigv4Signer({
      region: process.env.AWS_REGION || 'us-east-1',
      service: 'es',
      getCredentials: defaultProvider(),
    }),
    node: `https://${process.env.OPENSEARCH_ENDPOINT}`,
  });
};

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
  'AlarmMessage',
  'AutoIncrementedId',
  'DeviceStatus',
  'UserLastSelected',
  'EMailAlertSent',
  'AlarmSent',
  'ReadingTest',
  'Phone',
  'DynamoDBEvents',
  'Events'
]);

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing DynamoDB stream event:', JSON.stringify(event, null, 2));
  console.log('OpenSearch Endpoint:', process.env.OPENSEARCH_ENDPOINT);

  const client = await getClient();

  for (const record of event.Records) {
    try {
      await processRecord(client, record);
    } catch (error) {
      console.error('Error processing record:', error);
      // Don't throw error to avoid stopping the batch processing
    }
  }
};

async function processRecord(client: Client, record: DynamoDBRecord) {
  const tableName = record.eventSourceARN?.split('/')[1];
  if (!tableName) {
    console.log('Unable to determine table name from ARN');
    return;
  }

  // Extract the model name (remove the generated suffix and environment suffix)
  // Table format: ModelName-randomid-environment or just ModelName-randomid
  const parts = tableName.split('-');
  const modelName = parts[0];

  // Only process records for searchable models
  if (!SEARCHABLE_MODELS.has(modelName)) {
    console.log(`Skipping non-searchable model: ${modelName} (from table: ${tableName})`);
    return;
  }

  const indexName = modelName.toLowerCase();
  console.log(`Processing record for searchable model: ${modelName} -> index: ${indexName}`);

  switch (record.eventName) {
    case 'INSERT':
    case 'MODIFY':
      if (record.dynamodb?.NewImage) {
        const document = unmarshallDynamoDBRecord(record.dynamodb.NewImage);
        await indexDocument(client, indexName, document);
      }
      break;

    case 'REMOVE':
      if (record.dynamodb?.Keys) {
        const keys = unmarshallDynamoDBRecord(record.dynamodb.Keys);
        await deleteDocument(client, indexName, keys.id);
      }
      break;
  }
}

async function indexDocument(client: Client, indexName: string, document: any) {
  try {
    // Ensure index exists
    const indexExists = await client.indices.exists({ index: indexName });

    if (!indexExists.body) {
      console.log(`Creating index: ${indexName}`);
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 2,
            number_of_replicas: 1,
          },
        },
      });
    }

    const response = await client.index({
      index: indexName,
      id: document.id,
      body: document,
      refresh: true,
    });

    console.log(`Indexed document in ${indexName}:`, response.body);
  } catch (error) {
    console.error(`Error indexing document in ${indexName}:`, error);
    throw error;
  }
}

async function deleteDocument(client: Client, indexName: string, id: string) {
  try {
    const response = await client.delete({
      index: indexName,
      id: id,
      refresh: true,
    });

    console.log(`Deleted document from ${indexName}:`, response.body);
  } catch (error: any) {
    // Ignore 404 errors (document not found)
    if (error.statusCode !== 404) {
      console.error(`Error deleting document from ${indexName}:`, error);
      throw error;
    }
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
      else if ('L' in value) result[key] = (value.L as any[]).map((item: any) => unmarshallDynamoDBRecord({ item }).item);
      else if ('M' in value) result[key] = unmarshallDynamoDBRecord(value.M);
      else if ('NULL' in value) result[key] = null;
      else result[key] = value;
    } else {
      result[key] = value;
    }
  }

  return result;
}
