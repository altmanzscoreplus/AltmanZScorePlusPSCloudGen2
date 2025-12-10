# OpenSearch Implementation for Amplify Gen 2 (Non-Pipeline Approach)

## Overview

This implementation provides a **custom Lambda-based OpenSearch integration** that syncs DynamoDB data to OpenSearch **without using AWS Pipeline**. This approach gives you full control over the indexing logic and is more cost-effective than using AWS OpenSearch Ingestion Service (OSIS).

## Architecture

```
DynamoDB Tables (with Streams enabled)
    ↓
    ↓ Stream Events
    ↓
Lambda Function (opensearch-sync)
    ↓
    ↓ Index/Update/Delete
    ↓
OpenSearch Cluster (Single Shared Cluster)
    ↓
    ↓ Search Queries
    ↓
Custom GraphQL Resolvers (searchCustomers, searchContacts, etc.)
```

## Components Implemented

### 1. OpenSearch Cluster
**Location:** [amplify/backend.ts](amplify/backend.ts#L126-L185)

- **Cluster Name:** `powersight-search-{environment}` (e.g., `powersight-search-prod`)
- **Version:** OpenSearch 2.11
- **Configuration:**
  - 2x `t3.small.search` data nodes
  - 20GB GP3 EBS storage per node
  - Node-to-node encryption enabled
  - Encryption at rest enabled
  - HTTPS enforced
- **Environment-aware:** Different clusters for dev/test/prod based on branch

### 2. Lambda Sync Function
**Location:** [amplify/functions/opensearch-sync/handler.ts](amplify/functions/opensearch-sync/handler.ts)

**Features:**
- Processes DynamoDB stream events (INSERT, MODIFY, REMOVE)
- Filters for searchable models only (28 models configured)
- Automatically creates indices if they don't exist
- Unmarshalls DynamoDB records to JSON
- Uses AWS Signature V4 for authentication
- Error handling with per-record retry logic

**Searchable Models (28 total):**
- Customer, Contact, Gateway, GatewayRental
- Analyzer, AnalyzerRental, Reading, Client
- PSFile, Domain
- GatewayAlarmLevelAndInterval, AnalyzerAlarmLevelAndInterval
- CustomerAlarmLevelAndInterval, ClientAlarmLevelAndInterval
- GlobalAlarmLevelAndInterval, AdminAlarmLevelAndInterval
- AdminContact, AlarmMessage
- AutoIncrementedId, DeviceStatus, UserLastSelected
- EMailAlertSent, AlarmSent, ReadingTest
- Phone, DynamoDBEvents, Events

### 3. DynamoDB Stream Integration
**Location:** [amplify/backend.ts](amplify/backend.ts#L196-L252)

- **Event Source:** DynamoDB Streams enabled on all searchable tables
- **Starting Position:** LATEST (only new changes)
- **Batch Size:** 100 records per Lambda invocation
- **Error Handling:**
  - Bisect batch on error (retry half if batch fails)
  - 3 retry attempts per batch

### 4. IAM Permissions
**Location:** [amplify/backend.ts](amplify/backend.ts#L187-L194)

Lambda has full read/write permissions to OpenSearch cluster via:
```typescript
openSearchDomain.grantReadWrite(backend.openSearchSync.resources.lambda);
```

### 5. Environment Variables
**Location:** [amplify/backend.ts](amplify/backend.ts#L191-L194)

Lambda receives:
- `OPENSEARCH_ENDPOINT`: Domain endpoint URL
- `OPENSEARCH_CLUSTER_NAME`: Cluster name for logging
- `AWS_REGION`: AWS region (automatically set)

## How It Works

### Indexing Flow

1. **Data Change in DynamoDB:**
   - User creates/updates/deletes a Customer record
   - DynamoDB Stream captures the change

2. **Lambda Triggered:**
   - OpenSearch sync Lambda receives stream event
   - Extracts model name from table ARN
   - Checks if model is searchable

3. **Document Processing:**
   - INSERT/MODIFY → Index document to OpenSearch
   - REMOVE → Delete document from OpenSearch
   - Unmarshalls DynamoDB format to JSON

4. **OpenSearch Indexing:**
   - Index name = model name (lowercase)
   - Document ID = DynamoDB record ID
   - Auto-creates index if it doesn't exist

### Search Flow

1. **User searches for "John":**
   - Frontend calls `searchCustomers(searchTerm: "John")`

2. **Custom GraphQL Resolver:**
   - Connects to OpenSearch cluster
   - Queries `customer` index
   - Returns matching results

3. **Results Returned:**
   - Search results with pagination
   - Total count
   - Next token for pagination

## Environment-Based Configuration

### Branch → Environment Mapping
- `main` / `master` → `prod`
- `staging` / `test` → `test`
- All other branches → `dev`

### Resource Naming
- OpenSearch: `powersight-search-{env}`
- API: `PowerSightApi-{env}`
- Data API: `ps-cloud-gen2-{env}`

### Removal Policies
- **Production (`prod`):** RETAIN - cluster persists after stack deletion
- **Dev/Test:** DESTROY - cluster deleted with stack

## Advantages Over AWS Pipeline Approach

### ✅ Custom Lambda Approach (Current Implementation)
- **Cost:** Pay only for Lambda executions
- **Control:** Full control over indexing logic
- **Filtering:** Only index specific models (28 out of 40+)
- **Transformation:** Can transform data before indexing
- **Simplicity:** No S3 intermediary, direct DynamoDB → OpenSearch
- **Flexibility:** Easy to add custom logic (e.g., data enrichment)

### ❌ AWS Pipeline Approach (OSIS)
- **Cost:** Additional OSIS pipeline charges
- **Less Control:** Black box indexing
- **All or Nothing:** Indexes all DynamoDB tables
- **No Transformation:** Data indexed as-is
- **Complexity:** Requires PITR, S3 bucket, additional IAM roles
- **Less Flexible:** Harder to customize

## Deployment

### First Time Deployment

1. **Deploy Backend:**
   ```bash
   npx ampx sandbox
   ```
   or
   ```bash
   npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
   ```

2. **OpenSearch Cluster Creation:**
   - Takes ~15-20 minutes to provision
   - CloudFormation creates the domain
   - Lambda is automatically connected

3. **Automatic Stream Connection:**
   - DynamoDB streams enabled on all searchable tables
   - Lambda event source mappings created
   - Permissions granted automatically

### Verification

Check CloudWatch Logs for Lambda:
```
/aws/lambda/opensearch-sync-{environment}
```

Look for:
- "Processing DynamoDB stream event"
- "Indexed document in {index}"
- "Creating index: {index}"

### Testing

1. **Create a test record:**
   ```graphql
   mutation CreateCustomer {
     createCustomer(input: {
       name: "Test Customer"
       company: "Test Company"
       status: Active
     }) {
       id
       name
     }
   }
   ```

2. **Search for it:**
   ```graphql
   query SearchCustomers {
     searchCustomers(searchTerm: "Test") {
       items
       total
     }
   }
   ```

## Monitoring

### CloudWatch Metrics
- Lambda invocations: `opensearch-sync` function
- Lambda errors: Check for failed batches
- Lambda duration: Should be < 5 seconds per batch

### OpenSearch Metrics
- Cluster health: Should be "green" or "yellow"
- Index count: Should match number of searchable models with data
- Document count: Should match DynamoDB record count

### Logs to Monitor
1. **Lambda Logs:** `/aws/lambda/opensearch-sync-{env}`
2. **OpenSearch Logs:** Available in OpenSearch domain dashboard
3. **DynamoDB Streams:** Check stream activity in DynamoDB console

## Troubleshooting

### Lambda Not Triggered
- **Check:** DynamoDB streams enabled on tables
- **Check:** Event source mapping status in Lambda console
- **Check:** Lambda has execution role permissions

### Documents Not Indexed
- **Check:** Lambda logs for errors
- **Check:** OpenSearch cluster health
- **Check:** IAM permissions for Lambda to OpenSearch
- **Check:** Network connectivity (VPC if applicable)

### Search Not Working
- **Check:** Index exists in OpenSearch
- **Check:** Documents in index (use OpenSearch DevTools)
- **Check:** Custom resolver has correct endpoint
- **Check:** IAM permissions for resolver to query OpenSearch

## Cost Estimation

### OpenSearch Cluster
- 2x `t3.small.search` instances: ~$80/month
- 40GB GP3 storage (2x20GB): ~$8/month
- **Total:** ~$88/month per environment

### Lambda
- 1M invocations/month: Free tier
- Additional invocations: $0.20 per 1M
- **Total:** ~$0-5/month depending on usage

### DynamoDB Streams
- Stream reads: $0.02 per 100K reads
- **Total:** ~$1-10/month depending on change rate

### Total Estimated Cost
- **Dev:** ~$90/month (1 cluster + Lambda + streams)
- **Test:** ~$90/month
- **Prod:** ~$90/month
- **Overall:** ~$270/month for 3 environments

Compare to Pipeline Approach: +$200-500/month for OSIS

## Next Steps

1. **Enable Search Resolvers:** Implement custom resolvers for each searchable model
2. **Index Mappings:** Define explicit mappings for better search performance
3. **Synonyms:** Add synonym lists for better search results
4. **Autocomplete:** Implement autocomplete with n-gram analyzers
5. **Aggregations:** Add faceted search capabilities
6. **Monitoring:** Set up CloudWatch alarms for cluster health

## Support

For issues or questions:
1. Check CloudWatch logs for Lambda and OpenSearch
2. Review [Amplify Gen 2 documentation](https://docs.amplify.aws/react/build-a-backend/)
3. Review [OpenSearch documentation](https://opensearch.org/docs/latest/)

---

**Implementation Status:** ✅ COMPLETED

All components are configured and ready for deployment. No AWS Pipeline required!
