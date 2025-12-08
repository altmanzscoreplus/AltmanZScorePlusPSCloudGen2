// DEPRECATED: This file is now replaced by /amplify/opensearch/resource.ts
// 
// The OpenSearch configuration has been migrated to use a single shared cluster
// instead of individual clusters per collection. 
//
// New architecture:
// 1. Single OpenSearch cluster named "powersight-search-cluster"
// 2. Individual indices within the cluster for each searchable model
// 3. Unified OpenSearch sync function handling all DynamoDB stream events
// 4. Custom GraphQL resolvers using the shared cluster
//
// All searchable models now use the shared cluster:
export const DEPRECATED_searchableModels = [
  'Customer',      // -> customer index
  'Contact',       // -> contact index  
  'Gateway',       // -> gateway index
  'Analyzer',      // -> analyzer index
  'Client',        // -> client index
  'Reading',       // -> reading index
  'PSFile',        // -> psfile index
  'Domain',        // -> domain index
  'GatewayRental', // -> gatewayrental index
  'AnalyzerRental', // -> analyzerrental index
  'GatewayAlarmLevelAndInterval',     // -> gatewayalarmlevel index
  'AnalyzerAlarmLevelAndInterval',    // -> analyzeralarmlevel index
  'CustomerAlarmLevelAndInterval',    // -> customeralarmlevel index
  'ClientAlarmLevelAndInterval',      // -> clientalarmlevel index
  'GlobalAlarmLevelAndInterval',      // -> globalalarmlevel index
  'AdminAlarmLevelAndInterval',       // -> adminalarmlevel index
  'AdminContact',  // -> admincontact index
  'AlarmMessage'   // -> alarmmessage index
];

// Migration completed:
// ✅ Single OpenSearch cluster created
// ✅ DynamoDB streams configured to trigger unified sync function
// ✅ Custom GraphQL resolvers updated to use shared cluster indices
// ✅ IAM roles configured for cluster access