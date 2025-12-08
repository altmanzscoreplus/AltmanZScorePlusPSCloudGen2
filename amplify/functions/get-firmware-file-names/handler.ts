import type { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Get firmware file names event:', JSON.stringify(event, null, 2));

    const { prefix = 'firmware/', deviceType, maxKeys = 100 } = event.queryStringParameters || {};
    const bucketName = process.env.FIRMWARE_S3_BUCKET;

    if (!bucketName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'FIRMWARE_S3_BUCKET environment variable not set'
        })
      };
    }

    const finalPrefix = deviceType ? `${prefix}${deviceType}/` : prefix;

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: finalPrefix,
      MaxKeys: parseInt(maxKeys.toString(), 10)
    });

    const response = await s3Client.send(command);

    const firmwareFiles = (response.Contents || [])
      .filter(object => {
        const key = object.Key || '';
        return key.endsWith('.bin') || key.endsWith('.hex') || key.endsWith('.fw') || key.endsWith('.img');
      })
      .map(object => ({
        key: object.Key,
        fileName: object.Key?.split('/').pop() || '',
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
        firmwareFiles,
        count: firmwareFiles.length,
        prefix: finalPrefix,
        isTruncated: response.IsTruncated,
        nextContinuationToken: response.NextContinuationToken
      })
    };

  } catch (error) {
    console.error('Error getting firmware file names:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to get firmware file names',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};