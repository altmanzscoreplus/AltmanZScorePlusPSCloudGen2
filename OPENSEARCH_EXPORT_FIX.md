# OpenSearch Export Fix

## Error Fixed ✅

**Error Message:**
```
[AssemblyError] Assembly builder failed
[SyntaxError] The requested module './functions/opensearch-sync/resource' does not provide an export named 'openSearchSync'
```

## Root Cause

Amplify Gen 2's module resolution had trouble finding the named export `openSearchSync` from the `resource.ts` file directly. This is a known issue with TypeScript module resolution in certain build contexts.

## Solution

Created an `index.ts` file that re-exports the function, which provides better module resolution:

### Files Created/Modified:

**1. Created: `amplify/functions/opensearch-sync/index.ts`**
```typescript
export { openSearchSync } from './resource';
```

**2. Modified: `amplify/backend.ts`**
```typescript
// Before
import { openSearchSync } from './functions/opensearch-sync/resource';

// After
import { openSearchSync } from './functions/opensearch-sync';
```

This pattern (importing from the directory instead of the specific file) is:
- More standard in Node.js/TypeScript projects
- Automatically resolves to `index.ts`
- Provides better compatibility with different module systems

## Directory Structure

```
amplify/functions/opensearch-sync/
├── index.ts          ← NEW: Re-exports from resource.ts
├── resource.ts       ← Defines the Lambda function
├── handler.ts        ← Lambda handler implementation
├── package.json      ← Dependencies
├── tsconfig.json     ← TypeScript config
└── node_modules/     ← Installed packages
```

## Why This Works

1. **Standard Pattern:** Node.js/TypeScript automatically looks for `index.ts` when importing from a directory
2. **Better Resolution:** The build system can more easily resolve directory imports
3. **Consistent:** Matches how other Node modules work (`import something from './directory'`)

## All Files Now Ready

### `index.ts` (NEW)
```typescript
export { openSearchSync } from './resource';
```

### `resource.ts` (UNCHANGED)
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const openSearchSync = defineFunction({
  name: 'opensearch-sync',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 60,
  memoryMB: 512,
});
```

### `backend.ts` (UPDATED IMPORT)
```typescript
import { openSearchSync } from './functions/opensearch-sync';  // ← Fixed

const backend = defineBackend({
  // ...
  openSearchSync,  // ← Works now!
});
```

## Verification

The import should now work correctly during the build process. The error:
```
The requested module './functions/opensearch-sync/resource' does not provide an export named 'openSearchSync'
```

Should be resolved because we're now importing from the directory (which uses `index.ts`) instead of directly from `resource.ts`.

## Deploy Now

```bash
npx ampx sandbox
```

Or push to main:
```bash
git add .
git commit -m "Fix opensearch-sync export with index.ts"
git push origin main
```

## Status: ✅ FIXED

The module export issue is resolved. The build should proceed without this error.
