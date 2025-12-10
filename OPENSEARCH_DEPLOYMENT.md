# OpenSearch Deployment Guide

## Quick Start

### Prerequisites
- AWS Account with Amplify access
- Node.js 18+ installed
- Amplify CLI configured

### Deployment Steps

#### 1. Install Dependencies
```bash
cd amplify/functions/opensearch-sync
npm install
cd ../../..
```

#### 2. Deploy to Sandbox (for testing)
```bash
npx ampx sandbox
```

This will:
- Create OpenSearch cluster (takes ~15-20 minutes)
- Deploy all Lambda functions
- Enable DynamoDB streams on searchable tables
- Connect Lambda to streams
- Grant permissions

#### 3. Deploy to Production Branch
```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Add OpenSearch integration"
git push origin main
```

Amplify will automatically:
- Detect the `main` branch
- Set environment to `prod`
- Create cluster named `powersight-search-prod`
- Deploy all resources

### Verification

#### Check OpenSearch Cluster
1. Go to AWS Console → OpenSearch Service
2. Look for domain: `powersight-search-{env}`
3. Wait for status to be "Active" (green)
4. Note the endpoint URL

#### Check Lambda Function
1. Go to AWS Console → Lambda
2. Look for function: `opensearch-sync-{random-id}`
3. Check "Configuration" → "Triggers"
4. Should see DynamoDB stream triggers for searchable models

#### Test the Integration

1. **Create a test record via GraphQL:**
   ```graphql
   mutation CreateTestCustomer {
     createCustomer(input: {
       name: "OpenSearch Test"
       company: "Test Company"
       status: Active
       access_status: Enabled
       user_name: "test@example.com"
     }) {
       id
       name
     }
   }
   ```

2. **Check Lambda logs:**
   ```bash
   # Get the function name
   aws lambda list-functions --query 'Functions[?contains(FunctionName, `opensearch-sync`)].FunctionName'

   # View logs
   aws logs tail /aws/lambda/opensearch-sync-{id} --follow
   ```

3. **Verify in OpenSearch:**
   - Go to OpenSearch dashboard
   - Use Dev Tools
   - Run query:
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

4. **Test search via GraphQL:**
   ```graphql
   query SearchTestCustomer {
     searchCustomers(searchTerm: "OpenSearch Test") {
       items
       total
     }
   }
   ```

### Environment-Specific Deployments

#### Development (default)
```bash
npx ampx sandbox
# Creates: powersight-search-dev
```

#### Staging/Test
```bash
# Push to staging branch
git checkout -b staging
git push origin staging
# Creates: powersight-search-test
```

#### Production
```bash
# Push to main branch
git checkout main
git push origin main
# Creates: powersight-search-prod
```

### Monitoring

#### CloudWatch Dashboards
Create a custom dashboard to monitor:

1. **Lambda Metrics:**
   - Invocations
   - Errors
   - Duration
   - Throttles

2. **OpenSearch Metrics:**
   - Cluster status
   - CPU utilization
   - JVM memory pressure
   - Search latency
   - Indexing rate

3. **DynamoDB Stream Metrics:**
   - Stream records processed
   - Iterator age

#### Set Up Alarms

```bash
# Example: Lambda error alarm
aws cloudwatch put-metric-alarm \
  --alarm-name opensearch-sync-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=opensearch-sync-{id}
```

### Troubleshooting

#### Issue: OpenSearch cluster stuck in "Processing"
**Solution:** Wait 15-20 minutes. OpenSearch domains take time to provision.

#### Issue: Lambda not triggered
**Check:**
1. DynamoDB streams enabled:
   ```bash
   aws dynamodb describe-table --table-name Customer-{id} --query 'Table.StreamSpecification'
   ```
2. Event source mapping exists:
   ```bash
   aws lambda list-event-source-mappings --function-name opensearch-sync-{id}
   ```

#### Issue: Documents not indexed
**Check:**
1. Lambda logs for errors:
   ```bash
   aws logs tail /aws/lambda/opensearch-sync-{id} --follow
   ```
2. Lambda has permissions:
   ```bash
   aws iam get-role --role-name {lambda-role-name}
   ```
3. OpenSearch cluster health:
   ```bash
   curl -XGET https://{opensearch-endpoint}/_cluster/health
   ```

#### Issue: "Access Denied" errors
**Solution:** Lambda needs IAM permissions to write to OpenSearch. Check:
```bash
aws iam list-attached-role-policies --role-name {lambda-role-name}
```

Should include policy with `es:*` permissions.

### Cleanup

#### Remove from Sandbox
```bash
npx ampx sandbox delete
```

#### Remove from Branch
1. Delete the Amplify app branch in console
2. Or manually delete CloudFormation stack

**Note:** Production cluster has `RemovalPolicy.RETAIN`, so it won't be deleted automatically. Delete manually if needed:
```bash
aws opensearch delete-domain --domain-name powersight-search-prod
```

### Cost Optimization

#### Reduce Costs in Dev/Test
1. **Use smaller instances:**
   - Change `t3.small.search` to `t3.micro.search`
   - Reduce storage to 10GB

2. **Single node cluster:**
   - Change `dataNodes: 2` to `dataNodes: 1`
   - Remove zone awareness

3. **Delete when not in use:**
   ```bash
   npx ampx sandbox delete
   ```

#### Production Best Practices
1. Enable reserved instances for 30-50% savings
2. Use Auto-Tune for optimal performance
3. Set up snapshot policies for backups
4. Monitor unused indices and delete

### Performance Tuning

#### Lambda Configuration
Adjust in [amplify/functions/opensearch-sync/resource.ts](amplify/functions/opensearch-sync/resource.ts):
```typescript
timeoutSeconds: 60,      // Increase if processing large batches
memoryMB: 512,          // Increase if handling large documents
```

#### Batch Size
Adjust in [amplify/backend.ts](amplify/backend.ts):
```typescript
batchSize: 100,         // Reduce if Lambda times out
retryAttempts: 3,       // Increase for better reliability
```

#### OpenSearch Configuration
Adjust in [amplify/backend.ts](amplify/backend.ts):
```typescript
capacity: {
  dataNodes: 3,                              // Scale up for more data
  dataNodeInstanceType: 't3.medium.search',  // Upgrade for better performance
  masterNodes: 3,                            // Add dedicated masters for production
  masterNodeInstanceType: 't3.small.search',
},
ebs: {
  volumeSize: 50,                            // Increase for more data
},
```

### Security Best Practices

1. **Restrict OpenSearch Access:**
   - Update access policies to allow only Lambda
   - Use VPC for private access (optional)

2. **Enable Fine-Grained Access Control:**
   - Uncomment in backend.ts
   - Create master user credentials
   - Store in Secrets Manager

3. **Encryption:**
   - Already enabled: node-to-node, at-rest, HTTPS
   - Consider KMS custom keys for production

4. **Monitoring:**
   - Enable all logging (already configured)
   - Set up CloudWatch alarms
   - Review access logs regularly

### Next Steps

1. **Implement Search Resolvers:** Create custom resolvers for each searchable model
2. **Define Index Mappings:** Optimize field types for better search
3. **Add Synonyms:** Improve search relevance
4. **Implement Autocomplete:** Use edge n-grams
5. **Add Faceted Search:** Use aggregations
6. **Set Up Backups:** Configure automated snapshots

### Support Resources

- [Amplify Gen 2 Docs](https://docs.amplify.aws/react/build-a-backend/)
- [OpenSearch Docs](https://opensearch.org/docs/latest/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Streams Docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)

---

**Ready to Deploy!** 🚀

Follow the steps above to deploy your OpenSearch cluster without using AWS Pipeline.
