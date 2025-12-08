# PowerSight Gen 2 - IoT Monitoring System

A comprehensive IoT monitoring and alarm system built with **AWS Amplify Gen 2**, featuring real-time device tracking, intelligent alerting, and centralized search capabilities.

## Overview

PowerSight Gen 2 is a complete migration from Amplify Gen 1 to Gen 2, leveraging modern TypeScript, AWS SDK v3, and Node.js 22. This system manages IoT devices (Gateways and Analyzers), monitors their status, and provides sophisticated alarm escalation capabilities.

## Key Features

- **27 DynamoDB Tables** with complex relationships and secondary indexes
- **25+ Lambda Functions** for device management, alarms, and data processing
- **GraphQL API** with full CRUD operations and custom queries
- **REST APIs** for device operations, IoT shadow management, and file handling
- **Centralized OpenSearch Cluster** for full-text search across 18 models
- **Real-time Alarms** via Email (SES), SMS (Pinpoint), and Phone
- **IoT Core Integration** for device shadow management and OTA updates
- **Multi-tenant Architecture** with hierarchical permissions (Admin, Customer, Client)
- **Firmware Management** with OTA update capabilities

## Architecture

### Technology Stack

- **Backend Framework**: AWS Amplify Gen 2
- **Runtime**: Node.js 22.x
- **Language**: TypeScript 5.7+
- **AWS SDK**: v3 (modular)
- **Infrastructure**: AWS CDK 2.x
- **Database**: Amazon DynamoDB
- **Search**: Amazon OpenSearch Service
- **Authentication**: Amazon Cognito
- **API**: AWS AppSync (GraphQL) + API Gateway (REST)
- **Storage**: Amazon S3
- **IoT**: AWS IoT Core
- **Messaging**: Amazon Pinpoint, Amazon SES

## Prerequisites

- **Node.js**: >= 22.0.0
- **npm**: >= 10.0.0
- **AWS CLI**: Configured with appropriate credentials
- **AWS Account**: With appropriate permissions
- **Amplify CLI**: Latest version

## Quick Start

### 1. Installation

```bash
# Clone and install
git clone https://github.com/your-org/powersight-gen2.git
cd powersight-gen2
npm install
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your AWS configuration
# Configure Amplify
npm run configure
```

### 3. Development

```bash
# Start sandbox environment (deploys to AWS)
npm run sandbox
```

### 4. Deployment

```bash
# Deploy to production
npm run deploy:prod
```

## Project Structure

```
powersight-gen2/
├── amplify/
│   ├── auth/resource.ts              # Cognito configuration
│   ├── data/resource.ts              # GraphQL schema (688 lines, 27 models)
│   ├── storage/resource.ts           # S3 configuration
│   ├── functions/                    # 25+ Lambda functions
│   ├── rest-api/resource.ts          # REST API definitions
│   ├── opensearch/resource.ts        # OpenSearch cluster
│   └── backend.ts                    # Main configuration
├── .env.example                      # Environment template
├── amplify.yml                       # CI/CD configuration
├── package.json                      # Dependencies (Node 22, AWS SDK v3)
├── tsconfig.json                     # TypeScript config (ES2022)
└── README.md
```

## Key Components

### Data Models (27 Tables)
- Customer, Client, Gateway, Analyzer
- Contact, Reading, PSFile
- Alarm configurations and tracking
- Device status and rentals
- And 18 more...

### Lambda Functions (25+)
- **Alarms**: send-email, send-alarm, send-disconnect-alarm
- **IoT**: iot-shadow, update-device, upgrade-firmware
- **Batch**: batch-delete-analyzer/customer/gateway
- **Files**: s3, get-file-names, get-firmware-file-names
- **Search**: opensearch-sync
- **Admin**: admin-queries, validate-email
- And more...

### APIs
- **GraphQL**: Full CRUD + custom queries/mutations
- **REST**: 22+ endpoints for device ops, IoT shadows, files, admin

## Authentication & Authorization

### User Groups
1. AdminMaster - Full system access
2. Admin - Organization access
3. CustomerMaster - Customer master
4. Customer - Customer access
5. ClientMaster - Client master
6. Client - Client access

### Authorization
- Owner-based: Users access their own data
- Group-based: Specific groups have CRUD permissions
- Authenticated: Read access for all authenticated users

## Search (OpenSearch)

18 searchable models with full-text search:
- Customer, Contact, Gateway, Analyzer
- Reading, PSFile, Domain
- All alarm models

```graphql
query SearchGateways($searchTerm: String!) {
  searchGateways(searchTerm: $searchTerm, limit: 20) {
    items { id ps_gateway_id site_location }
  }
}
```

## Monitoring & Alarms

- **10 Alarm Levels** (None → Level_10)
- **3 Delivery Methods**: Email, SMS, Phone
- **Hierarchical**: Device → Client → Customer → Global
- **Smart Features**: Deduplication, timezone-aware, escalation

## Deployment

### Sandbox (Development)
```bash
npm run sandbox
```

### Production
```bash
npm run deploy:prod
```

### CI/CD
Uses [amplify.yml](amplify.yml) for automatic deployment via Amplify Console.

## Environment Variables

Key variables (see [.env.example](.env.example)):
- `AWS_REGION`: AWS region
- `SENDER_EMAIL`: SES sender email
- `PINPOINT_APP_ID`: Pinpoint app ID
- `IOT_ENDPOINT`: IoT Core endpoint
- `OPENSEARCH_ENDPOINT`: OpenSearch cluster
- And more...

## Migration from Gen 1

This project has been fully migrated from Amplify Gen 1 to Gen 2:

**Key Changes:**
- ✅ GraphQL schema → TypeScript
- ✅ AWS SDK v2 → v3 (modular)
- ✅ Node.js → 22.x
- ✅ VTL resolvers → TypeScript
- ✅ Multiple OpenSearch collections → Single cluster
- ✅ Auth rules → Gen 2 syntax

## Scripts

```bash
npm run sandbox          # Start dev environment
npm run deploy:prod      # Deploy to production
npm run typecheck        # Type check
npm run clean            # Clean build artifacts
npm run install:functions # Install function dependencies
```

## Troubleshooting

### Auth Issues
```bash
aws configure
npm run configure
```

### TypeScript Errors
```bash
npm run install:functions
npm run typecheck
```

### OpenSearch Access
Check IAM permissions for `es:ESHttp*` actions.

### IoT Operations
Verify `IOT_ENDPOINT` and `iot:UpdateThingShadow` permissions.

## Security

- IAM roles with least privilege
- Encryption at rest (DynamoDB, S3, OpenSearch)
- Encryption in transit (HTTPS, TLS)
- Cognito authentication
- API authorization with groups
- Secrets via AWS Secrets Manager

## Resources

- [Amplify Gen 2 Docs](https://docs.amplify.aws/)
- [AWS SDK v3 Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)
- [TypeScript Docs](https://www.typescriptlang.org/)

## Support

- GitHub Issues
- Email: support@powersight.com

## License

UNLICENSED - Proprietary
