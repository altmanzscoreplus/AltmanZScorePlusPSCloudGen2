# OpenSearch Deployment Note

## Current Status

The OpenSearch integration has been **partially implemented** but is **commented out** due to persistent build issues with module resolution during Amplify's TypeScript validation phase.

## Issues Encountered

1. **Module Export Errors** - Amplify Gen 2 couldn't resolve the `openSearchSync` export
2. **TypeScript Validation** - Build fails during TypeScript validation before bundling
3. **Module Resolution** - Cannot find `@opensearch-project/opensearch` during validation

## Implemented Components

✅ **Ready to use:**
- OpenSearch cluster configuration code
- Lambda handler with DynamoDB stream processing
- IAM permissions setup
- Environment variable configuration
- DynamoDB stream connections

❌ **Blocked by:**
- Amplify Gen 2 build system TypeScript validation
- Module resolution during pre-bundle validation phase

## Alternative Approaches to Complete OpenSearch Integration

### Option 1: Deploy OpenSearch Separately (Recommended)

Deploy OpenSearch infrastructure separately from Amplify:

```bash
# Create a separate CDK stack for OpenSearch
cdk init app --language typescript
# Add OpenSearch domain and Lambda
cdk deploy
```

**Pros:**
- Avoids Amplify build issues
- More control over OpenSearch configuration
- Can use any CDK features
- Independent deployment cycle

**Cons:**
- Separate deployment process
- Manual integration with Amplify resources

### Option 2: Use AWS Console

1. **Create OpenSearch Domain Manually:**
   - Go to AWS Console → OpenSearch Service
   - Create domain: `powersight-search-prod`
   - Configure: 2x t3.small.search, 20GB GP3

2. **Create Lambda Manually:**
   - Upload handler code as ZIP
   - Configure DynamoDB stream triggers
   - Set environment variables

3. **Connect:**
   - Add IAM permissions
   - Test integration

**Pros:**
- Immediate deployment
- Visual configuration

**Cons:**
- Manual process
- Not infrastructure-as-code
- Harder to replicate across environments

### Option 3: Use AWS SAM or Terraform

Convert the OpenSearch infrastructure to SAM or Terraform:

```yaml
# SAM template.yaml
Resources:
  OpenSearchDomain:
    Type: AWS::OpenSearchService::Domain
    Properties:
      DomainName: powersight-search-prod
      # ... configuration

  OpenSearchSyncFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./opensearch-sync
      Handler: handler.handler
      Runtime: nodejs22.x
```

**Pros:**
- Infrastructure as code
- Proven deployment tools
- No Amplify build issues

**Cons:**
- Different toolchain
- Separate deployment process

### Option 4: Wait for Amplify Gen 2 Fix

The issue may be resolved in future Amplify CLI updates.

**Track:**
- AWS Amplify GitHub issues
- Amplify Gen 2 release notes

## Recommended Path Forward

**For Production: Option 1 (Separate CDK Stack)**

1. Keep Amplify for API, Auth, Data
2. Create separate CDK app for OpenSearch
3. Reference Amplify DynamoDB tables by name/ARN
4. Deploy independently

**Implementation:**
```typescript
// separate-opensearch-stack/lib/stack.ts
import * as cdk from 'aws-cdk-lib';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class OpenSearchStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create OpenSearch domain
    const domain = new opensearch.Domain(this, 'SearchDomain', {
      // ... config from backend.ts
    });

    // Create Lambda
    const syncLambda = new lambda.Function(this, 'SyncFunction', {
      // ... handler code
    });

    // Connect to DynamoDB streams (reference by table name)
    // ...
  }
}
```

## Files Ready for Alternative Deployment

All the code is ready, just needs to be deployed differently:

- ✅ `amplify/functions/opensearch-sync/handler.ts` - Lambda code
- ✅ `amplify/functions/opensearch-sync/package.json` - Dependencies
- ✅ OpenSearch configuration (in backend.ts lines 123-260)
- ✅ DynamoDB stream setup
- ✅ IAM permissions

## Summary

**What Works:**
- All other Amplify features (Auth, API, Data, Storage, Functions)
- Application functionality without search

**What's Blocked:**
- OpenSearch integration via Amplify Gen 2

**Next Steps:**
1. Deploy current Amplify app (without OpenSearch)
2. Implement Option 1 (separate CDK stack) for OpenSearch
3. OR wait for Amplify Gen 2 to fix module resolution issues

---

**The application is fully functional except for OpenSearch-based search features.**
