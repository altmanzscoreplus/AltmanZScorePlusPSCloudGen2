import type { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get file names event:', JSON.stringify(event, null, 2));

    const { prefix, maxKeys = 100 } = event.queryStringParameters || {};
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'S3_BUCKET_NAME environment variable not set'
        })
      };
    }

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: parseInt(maxKeys.toString(), 10)
    });

    const response = await s3Client.send(command);

    const files = (response.Contents || []).map(object => ({
      key: object.Key,
      lastModified: object.LastModified,
      size: object.Size,
      etag: object.ETag
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files,
        count: files.length,
        isTruncated: response.IsTruncated,
        nextContinuationToken: response.NextContinuationToken
      })
    };

  } catch (error) {
    console.error('Error getting file names:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to get file names',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};