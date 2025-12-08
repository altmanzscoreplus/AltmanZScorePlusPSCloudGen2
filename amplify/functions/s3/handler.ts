import type { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('S3 function event:', JSON.stringify(event, null, 2));

    const method = event.httpMethod;
    const { key, prefix, expiration = '3600' } = event.queryStringParameters || {};
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!bucketName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'AWS_BUCKET_NAME environment variable not set'
        })
      };
    }

    switch (method) {
      case 'GET':
        if (key) {
          // Generate pre-signed URL for download
          const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
          });

          const signedUrl = await getSignedUrl(s3Client, getCommand, {
            expiresIn: parseInt(expiration, 10)
          });

          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: signedUrl,
              key,
              expiresIn: expiration
            })
          };
        } else {
          // List objects
          const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            MaxKeys: 100
          });

          const response = await s3Client.send(listCommand);

          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              objects: response.Contents || [],
              count: response.KeyCount || 0,
              isTruncated: response.IsTruncated
            })
          };
        }

      case 'POST':
        if (!key) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              error: 'key parameter is required for upload'
            })
          };
        }

        // Generate pre-signed URL for upload
        const putCommand = new PutObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        const uploadUrl = await getSignedUrl(s3Client, putCommand, {
          expiresIn: parseInt(expiration, 10)
        });

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uploadUrl,
            key,
            expiresIn: expiration
          })
        };

      case 'DELETE':
        if (!key) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              error: 'key parameter is required for deletion'
            })
          };
        }

        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key
        });

        await s3Client.send(deleteCommand);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Object ${key} deleted successfully`
          })
        };

      default:
        return {
          statusCode: 405,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: `Method ${method} not allowed`
          })
        };
    }

  } catch (error) {
    console.error('Error in S3 function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'S3 operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};