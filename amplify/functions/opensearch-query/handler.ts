import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

type OpenSearchClient = Client;

const getClient = async (): Promise<OpenSearchClient> => {
  return new Client({
    ...AwsSigv4Signer({
      region: process.env.AWS_REGION || 'us-east-1',
      service: 'es',
      getCredentials: defaultProvider(),
    }),
    node: `https://${process.env.OPENSEARCH_ENDPOINT}`,
  });
};

export const handler = async (event: any) => {
  console.log('OpenSearch Query Event:', JSON.stringify(event, null, 2));

  const { method, index, body } = event;

  if (method !== 'search') {
    throw new Error(`Unsupported method: ${method}`);
  }

  try {
    const client = await getClient();

    const response = await client.search({
      index: index,
      body: body,
    });

    console.log('OpenSearch Response:', JSON.stringify(response.body, null, 2));
    return response.body;
  } catch (error: any) {
    console.error('OpenSearch Query Error:', error);
    throw new Error(`OpenSearch query failed: ${error.message}`);
  }
};
