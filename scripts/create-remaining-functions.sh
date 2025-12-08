#!/bin/bash

# Script to create remaining Lambda functions for Amplify Gen 2 migration

set -e

echo "🔧 Creating remaining Lambda functions..."

# Array of remaining functions with their types
declare -A functions=(
    ["send-disconnect-alarm"]="alarm"
    ["send-alert"]="alarm" 
    ["validate-email"]="utility"
    ["get-active-device-rental"]="data"
    ["get-analyzers-for-a-gateway"]="data"
    ["add-password-protection"]="auth"
    ["admin-queries"]="admin"
    ["update-device-status"]="iot"
    ["update-device-communication-status-in-analyzer"]="iot"
    ["update-device-communication-status-in-gateway"]="iot"
    ["update-iot-data-from-dynamodb-to-analyzer"]="iot"
    ["update-iot-data-from-dynamodb-to-gateway"]="iot"
)

# Create function directories and basic files
for func_name in "${!functions[@]}"; do
    func_type=${functions[$func_name]}
    echo "Creating function: $func_name (type: $func_type)"
    
    # Create directory
    mkdir -p "amplify/functions/$func_name"
    
    # Create resource.ts
    cat > "amplify/functions/$func_name/resource.ts" << EOF
import { defineFunction } from '@aws-amplify/backend';

export const ${func_name//-/} = defineFunction({
  name: '$func_name',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 60,
});
EOF

    # Create package.json
    cat > "amplify/functions/$func_name/package.json" << EOF
{
  "name": "$func_name-function",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.645.0",
    "@aws-sdk/lib-dynamodb": "^3.645.0",
    "@aws-sdk/client-ses": "^3.645.0",
    "@aws-sdk/client-pinpoint": "^3.645.0",
    "@aws-sdk/client-iot-data-plane": "^3.645.0"
  },
  "devDependencies": {
    "@types/aws-lambda": "^8.10.145"
  }
}
EOF

    # Create basic handler.ts based on function type
    case $func_type in
        "alarm")
            cat > "amplify/functions/$func_name/handler.ts" << 'EOF'
import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  try {
    console.log(`${process.env.AWS_LAMBDA_FUNCTION_NAME} event:`, JSON.stringify(event, null, 2));
    
    // TODO: Implement alarm processing logic
    // This would typically involve:
    // 1. Processing alarm data
    // 2. Determining recipients
    // 3. Sending notifications via SES/Pinpoint
    // 4. Logging alarm status
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Alarm processed successfully'
      })
    };
  } catch (error) {
    console.error('Error processing alarm:', error);
    throw error;
  }
};
EOF
            ;;
        "iot")
            cat > "amplify/functions/$func_name/handler.ts" << 'EOF'
import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  try {
    console.log(`${process.env.AWS_LAMBDA_FUNCTION_NAME} event:`, JSON.stringify(event, null, 2));
    
    // TODO: Implement IoT device update logic
    // This would typically involve:
    // 1. Processing device data
    // 2. Updating DynamoDB records
    // 3. Updating IoT device shadows
    // 4. Publishing status updates
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'IoT operation completed successfully'
      })
    };
  } catch (error) {
    console.error('Error in IoT operation:', error);
    throw error;
  }
};
EOF
            ;;
        "data")
            cat > "amplify/functions/$func_name/handler.ts" << 'EOF'
import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log(`${process.env.AWS_LAMBDA_FUNCTION_NAME} event:`, JSON.stringify(event, null, 2));
    
    // TODO: Implement data processing logic
    // This would typically involve:
    // 1. Parsing request parameters
    // 2. Querying DynamoDB
    // 3. Processing and filtering data
    // 4. Returning formatted response
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Data operation completed successfully'
      })
    };
  } catch (error) {
    console.error('Error in data operation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
EOF
            ;;
        *)
            cat > "amplify/functions/$func_name/handler.ts" << 'EOF'
import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log(`${process.env.AWS_LAMBDA_FUNCTION_NAME} event:`, JSON.stringify(event, null, 2));
    
    // TODO: Implement function logic
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Operation completed successfully'
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
EOF
            ;;
    esac
done

echo "✅ All remaining functions created successfully!"
echo ""
echo "Next steps:"
echo "1. Review and customize each function's implementation"
echo "2. Add environment variables and permissions as needed"  
echo "3. Update backend.ts to include all functions"
echo "4. Test each function individually"