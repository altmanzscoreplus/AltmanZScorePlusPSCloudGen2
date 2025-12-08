import { defineFunction } from '@aws-amplify/backend';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

// OpenSearch configuration for the project
export const opensearchConfig = {
  // Single cluster name based on project name
  clusterName: 'powersight-search-cluster',
  
  // Models that require search functionality (from backend/opensearch.ts)
  searchableModels: [
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
  ],
  
  // Index mappings for each model
  indexMappings: {
    customer: {
      properties: {
        ps_customer_id: { type: 'keyword' },
        name: { type: 'text', analyzer: 'standard' },
        nameLowerCase: { type: 'text', analyzer: 'standard' },
        company: { type: 'text', analyzer: 'standard' },
        companyLowerCase: { type: 'text', analyzer: 'standard' },
        user_name: { type: 'keyword' },
        status: { type: 'keyword' },
        access_status: { type: 'keyword' }
      }
    },
    contact: {
      properties: {
        name: { type: 'text', analyzer: 'standard' },
        nameLowerCase: { type: 'text', analyzer: 'standard' },
        email: { type: 'keyword' },
        phone: { type: 'keyword' },
        title: { type: 'text', analyzer: 'standard' },
        customer_id: { type: 'keyword' },
        client_id: { type: 'keyword' }
      }
    },
    gateway: {
      properties: {
        ps_gateway_id: { type: 'keyword' },
        model: { type: 'keyword' },
        serial_number: { type: 'keyword' },
        site_location: { type: 'text', analyzer: 'standard' },
        room_location: { type: 'text', analyzer: 'standard' },
        crsm: { type: 'keyword' },
        customer_id: { type: 'keyword' },
        client_id: { type: 'keyword' }
      }
    },
    analyzer: {
      properties: {
        ps_analyzer_id: { type: 'keyword' },
        device_id: { type: 'keyword' },
        serial_number: { type: 'keyword' },
        model: { type: 'keyword' },
        site_location: { type: 'text', analyzer: 'standard' },
        room_location: { type: 'text', analyzer: 'standard' },
        circuit: { type: 'text', analyzer: 'standard' },
        crsm: { type: 'keyword' },
        gateway_id: { type: 'keyword' },
        customer_id: { type: 'keyword' },
        client_id: { type: 'keyword' }
      }
    }
    // Add more index mappings as needed for other searchable models
  }
};

export function createOpenSearchCluster(scope: Construct, projectName: string) {
  const stack = Stack.of(scope);
  const clusterName = `${projectName}-search-cluster`;
  
  // Create OpenSearch domain
  const openSearchDomain = new opensearch.Domain(scope, 'PowersightSearchDomain', {
    version: opensearch.EngineVersion.OPENSEARCH_2_11,
    domainName: clusterName.toLowerCase(),
    
    // Cluster configuration
    capacity: {
      dataNodes: 2,
      dataNodeInstanceType: 't3.small.search',
      masterNodes: 0, // For small clusters, master nodes are not needed
    },
    
    // Storage configuration
    ebs: {
      volumeSize: 20,
      volumeType: ec2.EbsDeviceVolumeType.GP2,
    },
    
    // Security configuration
    nodeToNodeEncryption: true,
    encryptionAtRest: {
      enabled: true,
    },
    enforceHttps: true,
    
    // Access policies
    accessPolicies: [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: [
          'es:ESHttpGet',
          'es:ESHttpPost',
          'es:ESHttpPut',
          'es:ESHttpDelete',
          'es:ESHttpHead',
        ],
        resources: [`arn:aws:es:${stack.region}:${stack.account}:domain/${clusterName.toLowerCase()}/*`],
        conditions: {
          IpAddress: {
            'aws:SourceIp': ['*'] // In production, restrict this to your VPC CIDR
          }
        }
      })
    ],
    
    // Network configuration
    // zoneAwareness: {
    //   enabled: true,
    //   availabilityZoneCount: 2
    // },
    
    // Logging
    logging: {
      slowSearchLogEnabled: true,
      appLogEnabled: true,
      slowIndexLogEnabled: true,
    },
    
    // Fine-grained access control - commented out due to type compatibility
    // fineGrainedAccessControl: {
    //   masterUserName: 'opensearch-admin',
    // },
    
    // Advanced options
    advancedOptions: {
      'rest.action.multi.allow_explicit_index': 'true',
      'indices.fielddata.cache.size': '40%',
      'indices.query.bool.max_clause_count': '10000',
    },
    
    // Removal policy for development - using RemovalPolicy from aws-cdk-lib
    // removalPolicy is set at the construct level, not in Domain props
  });
  
  return {
    domain: openSearchDomain,
    endpoint: openSearchDomain.domainEndpoint,
    arn: openSearchDomain.domainArn,
    clusterName
  };
}

// Lambda function for OpenSearch synchronization
export const openSearchSync = defineFunction({
  name: 'opensearch-sync',
  entry: '../functions/opensearch-sync/handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
  environment: {
    OPENSEARCH_CLUSTER_NAME: opensearchConfig.clusterName,
  },
});