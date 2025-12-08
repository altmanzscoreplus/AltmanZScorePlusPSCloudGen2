# PowerSight Amplify Gen 2 Migration

This project has been migrated from AWS Amplify Gen 1 to Gen 2. This README covers the migration process and new structure.

## Migration Overview

### What Was Migrated

1. **Authentication**: Cognito user pools and identity pools with the same user groups
2. **Data Layer**: GraphQL schema converted to Gen 2 format with all models and relationships
3. **Storage**: S3 bucket configuration for file storage
4. **Functions**: Key Lambda functions migrated to Gen 2 format
5. **APIs**: REST APIs that will need manual reconfiguration

### Key Changes

#### Backend Structure
- **Old**: `amplify/backend/` with category-based folders
- **New**: `amplify/` with TypeScript-based resource definitions

#### Configuration
- **Old**: `src/aws-exports.js`
- **New**: `src/amplify_outputs.json` (auto-generated)

#### Client Usage
- **Old**: Individual Amplify category imports
- **New**: Unified `generateClient` API

## Project Structure

```
amplify/
├── backend.ts                 # Main backend definition
├── auth/
│   └── resource.ts           # Authentication configuration
├── data/
│   └── resource.ts           # GraphQL schema and data models
├── storage/
│   └── resource.ts           # S3 storage configuration
└── functions/
    ├── send-email/           # Email sending function
    ├── send-alarm/           # Alarm processing function
    └── batch-delete-analyzer/ # Batch operations
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Amplify CLI
```bash
npm install -g @aws-amplify/cli@latest
```

### 3. Initialize Amplify (for new deployments)
```bash
npx ampx configure
```

### 4. Deploy to Sandbox (Development)
```bash
npx ampx sandbox
```

### 5. Deploy to Production
```bash
npx ampx pipeline-deploy --branch main
```

## Updated API Usage

### Authentication
```typescript
import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth';

// Sign in
const { isSignedIn } = await signIn({
  username: email,
  password: password
});
```

### Data Operations
```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// Create a customer
const { data: customer } = await client.models.Customer.create({
  name: "Customer Name",
  company: "Company Name",
  user_name: "username"
});

// List customers
const { data: customers } = await client.models.Customer.list();

// Subscribe to real-time updates
const subscription = client.models.Customer.onCreate().subscribe({
  next: (data) => console.log('New customer:', data)
});
```

### Storage
```typescript
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

// Upload file
const result = await uploadData({
  key: 'photos/photo.jpg',
  data: file
}).result;

// Get file URL
const { url } = await getUrl({ key: 'photos/photo.jpg' });
```

## Migration Notes

### User Groups
All user groups have been preserved:
- Admin
- Client
- Customer
- AdminMaster
- ClientMaster
- CustomerMaster

### Data Models
All data models have been migrated with their relationships:
- Customer, Client, Contact
- Gateway, Analyzer
- Reading, PSFile, Domain
- All alarm and rental models

### Functions
Sample functions have been created in Gen 2 format:
- `send-email`: Email sending functionality
- `send-alarm`: Alarm processing
- `batch-delete-analyzer`: Batch operations

**Note**: Additional functions from Gen 1 will need to be migrated individually.

### REST APIs
The following REST APIs from Gen 1 need manual setup:
- powersightrestapi
- AdminQueries
- validateEMail

## Environment Variables

Functions may require environment variables to be set:
- `SENDER_EMAIL`: For email functions
- Add others as needed for your specific functions

## Testing

After deployment, test the following:
1. Authentication flows
2. CRUD operations on main models
3. File upload/download
4. Real-time subscriptions
5. Lambda function execution

## Rollback Plan

If issues arise, you can:
1. Keep Gen 1 infrastructure running
2. Update DNS/routing to point back to Gen 1
3. The original `amplify/` folder with Gen 1 config has been preserved

## Next Steps

1. Deploy to sandbox and test thoroughly
2. Migrate remaining Lambda functions
3. Set up CI/CD pipeline
4. Update any client applications using the APIs
5. Train team on Gen 2 patterns and tools

## Support

For issues with the migration:
1. Check AWS Amplify Gen 2 documentation
2. Review the migration logs
3. Test individual components in isolation

## Resources

- [Amplify Gen 2 Documentation](https://docs.amplify.aws/gen2/)
- [Migration Guide](https://docs.amplify.aws/gen2/deploy-and-host/upgrade-from-gen1/)
- [TypeScript Support](https://docs.amplify.aws/gen2/build-a-backend/auth/set-up-auth/)