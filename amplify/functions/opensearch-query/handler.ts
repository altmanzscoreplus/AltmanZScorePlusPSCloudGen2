/// <reference path="../opensearch-sync/opensearch.d.ts" />
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

// Field mappings for each model type
const SEARCH_FIELDS: Record<string, string[]> = {
  customer: ['name^3', 'company^2', 'nameLowerCase^3', 'companyLowerCase^2', 'ps_customer_id^2', 'user_name'],
  contact: ['name^3', 'nameLowerCase^3', 'email^2', 'phone', 'title'],
  gateway: ['ps_gateway_id^3', 'serial_number^3', 'model^2', 'site_location', 'room_location'],
  analyzer: ['ps_analyzer_id^3', 'serial_number^3', 'model^2', 'site_location', 'room_location'],
};

export const handler = async (event: any) => {
  console.log('OpenSearch Query Event:', JSON.stringify(event, null, 2));

  const { searchTerm, limit = 20, nextToken } = event.arguments;
  const fieldName = event.info?.fieldName || '';

  // Determine the index name from the field name
  // e.g., searchCustomers -> customer
  const indexName = fieldName.replace('search', '').toLowerCase().replace(/s$/, '');

  if (!SEARCH_FIELDS[indexName]) {
    throw new Error(`Unsupported search type: ${fieldName}`);
  }

  try {
    const client = await getClient();

    const searchBody: any = {
      query: {
        multi_match: {
          query: searchTerm,
          fields: SEARCH_FIELDS[indexName],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      },
      size: limit,
    };

    // Handle pagination
    if (nextToken) {
      try {
        searchBody.search_after = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8'));
      } catch (e) {
        console.error('Error parsing nextToken:', e);
      }
    }

    const response: any = await (client as any).search({
      index: indexName,
      body: searchBody,
    });

    console.log('OpenSearch Response:', JSON.stringify(response.body, null, 2));

    const hits = response.body.hits?.hits || [];
    const total = response.body.hits?.total?.value || 0;

    const items = hits.map((hit: any) => ({
      ...hit._source,
      _score: hit._score,
    }));

    // Generate nextToken from the last item's sort values
    const newNextToken = hits.length > 0 && hits.length === limit
      ? Buffer.from(JSON.stringify(hits[hits.length - 1].sort)).toString('base64')
      : null;

    return {
      items,
      total,
      nextToken: newNextToken,
    };
  } catch (error: any) {
    console.error('OpenSearch Query Error:', error);
    throw new Error(`OpenSearch query failed: ${error.message}`);
  }
};
