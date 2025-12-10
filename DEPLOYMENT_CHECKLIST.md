# OpenSearch Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Changes Complete
- [x] OpenSearch cluster configuration in `backend.ts`
- [x] Lambda sync function created (`handler.ts`)
- [x] DynamoDB stream connections configured
- [x] IAM permissions granted
- [x] Environment variables configured
- [x] All TypeScript errors resolved

### Dependencies Installed
- [x] `@opensearch-project/opensearch` v2.13.0
- [x] `@aws-sdk/credential-provider-node` v3.943.0
- [x] All dev dependencies (@types/aws-lambda, @types/node, typescript)

### Configuration Verified
- [x] Environment-based resource naming (dev/test/prod)
- [x] 28 searchable models configured
- [x] API Gateway with environment suffix
- [x] Data API with environment suffix

---

## 🚀 Deployment Steps

### Option 1: Sandbox Deployment (Testing)

```bash
# From project root
npx ampx sandbox
```

**What happens:**
- Creates resources in your AWS account
- Uses `dev` environment
- Watches for file changes
- Good for testing

**Time:** ~15-20 minutes (OpenSearch cluster creation)

---

### Option 2: Branch Deployment (Production)

```bash
# Commit all changes
git add .
git commit -m "Add OpenSearch integration without AWS Pipeline"
git push origin main
```

**What happens:**
- Amplify Hosting triggers build
- Deploys to production environment
- Uses branch-specific settings (main = prod)

**Time:** ~20-25 minutes (includes build + deploy)

---

## 📊 Monitor Deployment

### 1. CloudFormation Stack

**Console:** AWS CloudFormation

**What to check:**
- Stack name: `amplify-{app-name}-{branch}-{random}`
- Status: Should progress from `CREATE_IN_PROGRESS` → `CREATE_COMPLETE`
- Resources: ~150+ resources created

**Key Resources:**
- OpenSearch domain: `powersight-search-{env}`
- Lambda function: `opensearch-sync-{id}`
- DynamoDB tables: 40+ tables with streams enabled

---

### 2. OpenSearch Domain

**Console:** Amazon OpenSearch Service

**What to check:**
- Domain name: `powersight-search-{env}`
- Status: Processing → Active (takes 15-20 min)
- Cluster health: Green or Yellow
- Endpoint: `https://xxx.{region}.es.amazonaws.com`

**Configuration:**
- Nodes: 2x t3.small.search
- Storage: 20GB GP3 per node
- Version: OpenSearch 2.11
- Encryption: Enabled (at-rest, in-transit)

---

### 3. Lambda Function

**Console:** AWS Lambda

**What to check:**
- Function name: Contains `opensearch-sync`
- Runtime: Node.js 22
- Memory: 512 MB
- Timeout: 60 seconds

**Triggers (should have 28):**
Check "Configuration" → "Triggers":
- Customer table stream
- Contact table stream
- Gateway table stream
- (... 25 more)

**Environment Variables:**
- `OPENSEARCH_ENDPOINT`: Should be set to OpenSearch endpoint
- `AWS_REGION`: Should be set to your region

---

### 4. DynamoDB Streams

**Console:** Amazon DynamoDB → Tables

**What to check:**
Pick any searchable model table (e.g., Customer):
- Go to "Exports and streams" tab
- DynamoDB stream details: Should show "Enabled"
- Stream view type: NEW_AND_OLD_IMAGES
- Associated Lambda: opensearch-sync function

---

## 🧪 Post-Deployment Testing

### Test 1: Create a Record

```graphql
mutation CreateTestCustomer {
  createCustomer(input: {
    name: "OpenSearch Test Customer"
    company: "Test Company Inc"
    status: Active
    access_status: Enabled
    user_name: "test@example.com"
    gateway_timeout: 300
    analyzer_timeout: 300
    enable_or_disable_alarm: true
  }) {
    id
    name
    company
  }
}
```

**Expected:** Record created successfully

---

### Test 2: Check Lambda Logs

**Console:** CloudWatch → Log groups → `/aws/lambda/opensearch-sync-{id}`

**What to look for:**
```
Processing DynamoDB stream event
OpenSearch Endpoint: xxx.{region}.es.amazonaws.com
Processing record for searchable model: Customer -> index: customer
Creating index: customer
Indexed document in customer
```

**If you see errors:**
- Check IAM permissions
- Verify OpenSearch endpoint is correct
- Ensure OpenSearch cluster is Active

---

### Test 3: Verify in OpenSearch

**Using AWS Console:**
1. Go to OpenSearch Service
2. Click on your domain
3. Click "OpenSearch Dashboards URL"
4. Go to Dev Tools
5. Run query:
   ```json
   GET customer/_search
   {
     "query": {
       "match": {
         "name": "OpenSearch Test"
       }
     }
   }
   ```

**Expected Response:**
```json
{
  "hits": {
    "total": { "value": 1 },
    "hits": [{
      "_source": {
        "id": "...",
        "name": "OpenSearch Test Customer",
        "company": "Test Company Inc"
      }
    }]
  }
}
```

---

### Test 4: Search via GraphQL

```graphql
query SearchTestCustomer {
  searchCustomers(searchTerm: "OpenSearch Test") {
    items
    total
  }
}
```

**Note:** This requires custom search resolvers to be implemented.
For now, you can verify data is in OpenSearch using Dev Tools (Test 3).

---

## 🔍 Troubleshooting

### Issue: CloudFormation fails during OpenSearch creation

**Possible Causes:**
- AWS account limits (check Service Quotas)
- Invalid domain name
- IAM permissions

**Resolution:**
```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name {stack-name} \
  --max-items 20
```

---

### Issue: Lambda not triggered

**Check:**
1. DynamoDB streams enabled:
   ```bash
   aws dynamodb describe-table \
     --table-name Customer-{id} \
     --query 'Table.StreamSpecification'
   ```

2. Event source mappings exist:
   ```bash
   aws lambda list-event-source-mappings \
     --function-name opensearch-sync-{id}
   ```

3. Lambda has execution role

**Resolution:**
- Re-deploy if streams not enabled
- Check CloudFormation for errors

---

### Issue: "Access Denied" in Lambda logs

**Cause:** Lambda doesn't have permissions to write to OpenSearch

**Check:**
```bash
# Get Lambda role
aws lambda get-function-configuration \
  --function-name opensearch-sync-{id} \
  --query 'Role'

# Check role policies
aws iam list-attached-role-policies \
  --role-name {role-name}
```

**Resolution:**
- Should have policy allowing `es:*` on OpenSearch domain
- Re-deploy if missing

---

### Issue: TypeScript errors during build

**See:** [OPENSEARCH_FINAL_FIXES.md](OPENSEARCH_FINAL_FIXES.md)

**Quick fix:**
```bash
cd amplify/functions/opensearch-sync
rm -rf node_modules package-lock.json
npm install
cd ../../..
```

---

## 📈 Success Criteria

### ✅ Deployment Successful When:

1. **CloudFormation:**
   - Stack status: `CREATE_COMPLETE` or `UPDATE_COMPLETE`
   - No failed resources

2. **OpenSearch:**
   - Domain status: Active
   - Cluster health: Green or Yellow
   - Endpoint accessible

3. **Lambda:**
   - Function deployed successfully
   - 28 DynamoDB triggers configured
   - Environment variables set

4. **DynamoDB:**
   - Streams enabled on all searchable tables
   - Event source mappings active

5. **Data Flow:**
   - Create record → Appears in DynamoDB
   - Lambda logs show "Indexed document"
   - Document queryable in OpenSearch

---

## 🎯 Next Steps After Deployment

### 1. Implement Search Resolvers

Create custom resolvers for GraphQL search queries:
- `searchCustomers`
- `searchContacts`
- `searchGateways`
- `searchAnalyzers`

### 2. Define Index Mappings

Optimize OpenSearch indices with explicit mappings:
```typescript
// In amplify/opensearch/resource.ts
{
  customer: {
    properties: {
      name: { type: 'text', analyzer: 'standard' },
      company: { type: 'text', analyzer: 'standard' },
      ps_customer_id: { type: 'keyword' }
    }
  }
}
```

### 3. Add Monitoring

Set up CloudWatch alarms for:
- Lambda errors
- Lambda duration > threshold
- OpenSearch cluster health
- DynamoDB stream lag

### 4. Implement Backfill

Add a one-time script to index existing DynamoDB data:
```bash
# Read all records from DynamoDB
# Send to Lambda or directly to OpenSearch
```

### 5. Test Search Performance

- Run search queries
- Monitor latency
- Adjust OpenSearch cluster size if needed

---

## 📞 Support

### Resources:
- [OPENSEARCH_IMPLEMENTATION.md](OPENSEARCH_IMPLEMENTATION.md) - Architecture details
- [OPENSEARCH_DEPLOYMENT.md](OPENSEARCH_DEPLOYMENT.md) - Detailed deployment guide
- [OPENSEARCH_FINAL_FIXES.md](OPENSEARCH_FINAL_FIXES.md) - TypeScript error fixes

### AWS Documentation:
- [Amplify Gen 2](https://docs.amplify.aws/react/build-a-backend/)
- [OpenSearch Service](https://docs.aws.amazon.com/opensearch-service/)
- [Lambda with DynamoDB Streams](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html)

---

## ✅ Final Status

- ✅ All code changes complete
- ✅ All TypeScript errors resolved
- ✅ All dependencies installed
- ✅ Environment configuration done
- ✅ Documentation complete
- ✅ **READY FOR DEPLOYMENT** 🚀

---

**Go ahead and deploy!** Your OpenSearch integration is ready without AWS Pipeline. 🎉
