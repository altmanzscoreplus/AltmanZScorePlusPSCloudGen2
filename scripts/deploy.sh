#!/bin/bash

# PowerSight Amplify Gen 2 Deployment Script

set -e

echo "🚀 Starting PowerSight Amplify Gen 2 deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
if [[ $(echo $NODE_VERSION | cut -d'.' -f1) -lt 18 ]]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run typecheck

# Check if Amplify CLI is configured
echo "🔧 Checking Amplify configuration..."
if ! npx ampx configure --help &> /dev/null; then
    echo "❌ Amplify CLI not configured. Please run 'npx ampx configure' first."
    exit 1
fi

# Determine deployment type
DEPLOYMENT_TYPE=${1:-sandbox}

if [[ $DEPLOYMENT_TYPE == "sandbox" ]]; then
    echo "🧪 Deploying to sandbox environment..."
    npx ampx sandbox
elif [[ $DEPLOYMENT_TYPE == "production" ]]; then
    echo "🏭 Deploying to production..."
    BRANCH=${2:-main}
    echo "📋 Deploying branch: $BRANCH"
    npx ampx pipeline-deploy --branch $BRANCH
else
    echo "❌ Invalid deployment type. Use 'sandbox' or 'production'"
    exit 1
fi

echo "✅ Deployment completed successfully!"

# Generate client configuration
echo "📝 Generating client configuration..."
npx ampx generate client-config

echo "🎉 All done! Your PowerSight Gen 2 application is ready."
echo ""
echo "Next steps:"
echo "1. Update your frontend to use the new amplify_outputs.json"
echo "2. Test authentication, data operations, and file uploads"
echo "3. Migrate any remaining Lambda functions"
echo "4. Set up monitoring and logging"
echo ""
echo "For help, see README-Gen2-Migration.md"