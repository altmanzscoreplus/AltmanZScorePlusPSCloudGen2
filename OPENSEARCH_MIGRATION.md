# OpenSearch Migration to Single Shared Cluster

## Overview
This document outlines the migration from multiple OpenSearch clusters (one per collection) to a single shared OpenSearch cluster for the PowerSight Gen2 project.

## Migration Changes

### Before (Multiple Clusters)
- Each searchable model had its own OpenSearch cluster
- 18 separate OpenSearch clusters needed to be managed
- Higher cost and complexity in infrastructure management

### After (Single Shared Cluster)
- One unified OpenSearch cluster: `powersight-search-cluster`
- Individual indices within the cluster for each searchable model
- Reduced cost and simplified management

## Files Modified

### 1. `/amplify/opensearch/resource.ts` (NEW)
- **Purpose**: Centralized OpenSearch cluster configuration
- **Key Features**:
  - Single cluster definition with project-wide naming
  - Index mappings for searchable models
  - Proper security and access configurations
  - OpenSearch sync function definition

### 2. `/amplify/backend.ts` (UPDATED)
- **Changes**:
  - Added OpenSearch cluster creation
  - Configured IAM permissions for sync function
  - Added environment variables for cluster access
  - Connected DynamoDB streams to unified sync function

### 3. `/amplify/functions/opensearch-sync/handler.ts` (UPDATED)
- **Changes**:
  - Added filtering for searchable models only
  - Updated to work with shared cluster architecture
  - Improved logging for better debugging
  - Fixed TypeScript type issues

### 4. `/amplify/backend/opensearch.ts` (DEPRECATED)
- **Status**: Marked as deprecated with migration notes
- **Purpose**: Documents the old configuration for reference

### 5. `/amplify/data/resource.ts` (UPDATED)
- **Changes**: Added comments about DynamoDB stream configuration

## Searchable Models (18 total)
All of these models now use the shared OpenSearch cluster:

| Model | Index Name | Primary Search Fields |
|-------|------------|----------------------|
| Customer | `customer` | name, company, ps_customer_id |
| Contact | `contact` | name, email, phone, title |
| Gateway | `gateway` | ps_gateway_id, serial_number, crsm |
| Analyzer | `analyzer` | ps_analyzer_id, device_id, serial_number |
| Client | `client` | name, user_name, ps_client_id |
| Reading | `reading` | Data fields |
| PSFile | `psfile` | File metadata |
| Domain | `domain` | Domain characteristics |
| GatewayRental | `gatewayrental` | Rental information |
| AnalyzerRental | `analyzerrental` | Rental information |
| GatewayAlarmLevelAndInterval | `gatewayalarmlevel` | Alarm settings |
| AnalyzerAlarmLevelAndInterval | `analyzeralarmlevel` | Alarm settings |
| CustomerAlarmLevelAndInterval | `customeralarmlevel` | Alarm settings |
| ClientAlarmLevelAndInterval | `clientalarmlevel` | Alarm settings |
| GlobalAlarmLevelAndInterval | `globalalarmlevel` | Alarm settings |
| AdminAlarmLevelAndInterval | `adminalarmlevel` | Alarm settings |
| AdminContact | `admincontact` | Admin contact info |
| AlarmMessage | `alarmmessage` | Alarm message content |

## Architecture Benefits

### Cost Optimization
- **Before**: 18 separate OpenSearch clusters
- **After**: 1 shared cluster with 18 indices
- **Savings**: Significant reduction in OpenSearch infrastructure costs

### Management Simplification
- Single cluster to monitor and maintain
- Unified backup and security policies
- Simplified scaling decisions

### Performance
- Better resource utilization across indices
- Shared cluster resources for optimal performance
- Consistent query performance across models

## Technical Implementation

### Cluster Configuration
```typescript
const clusterName = 'powersight-search-cluster'
// Instance: 2x t3.small.search nodes
// Storage: 20GB GP3 EBS per node
// Security: Node-to-node encryption, HTTPS enforced
```

### DynamoDB Integration
- DynamoDB streams automatically trigger the unified sync function
- The sync function filters for searchable models only
- Documents are indexed to appropriate indices within the shared cluster

### Search Resolvers
- Existing search resolvers (searchCustomers, searchContacts, etc.) unchanged
- They specify the correct index within the shared cluster
- No client-side changes required

## Deployment Notes

### Prerequisites
- Ensure proper IAM permissions are in place
- OpenSearch domain will be created during deployment
- DynamoDB streams will be automatically configured

### Environment Variables
The following environment variables are automatically set:
- `OPENSEARCH_ENDPOINT`: The cluster endpoint URL
- `OPENSEARCH_DOMAIN_ARN`: The cluster ARN for permissions
- `OPENSEARCH_CLUSTER_NAME`: The cluster name

### Rollback Plan
If rollback is needed:
1. Revert to the previous configuration in `/amplify/backend/opensearch.ts`
2. Restore individual cluster configurations
3. Update the sync function to handle multiple clusters

## Monitoring and Maintenance

### Health Checks
- Monitor single cluster health instead of 18 clusters
- Use CloudWatch metrics for the unified cluster
- Set up alarms for cluster status and performance

### Index Management
- Each model's data goes to its designated index
- Index templates can be configured for consistent mappings
- Lifecycle policies can be applied cluster-wide

## Migration Status: ✅ COMPLETED

All components have been updated to use the single shared OpenSearch cluster architecture. The migration provides cost optimization, simplified management, and maintained search functionality across all searchable models.