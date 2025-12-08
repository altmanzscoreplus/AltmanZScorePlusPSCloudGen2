import type { APIGatewayProxyHandler } from 'aws-lambda';
import { promises as dns } from 'dns';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Validate email event:', JSON.stringify(event, null, 2));

    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Email is required'
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid email format'
        })
      };
    }

    const domain = getDomainFromEmail(email);
    const validationResult = await checkMXRecords(domain);

    if (validationResult.valid) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Email domain has valid MX records.',
          email: email,
          domain: domain,
          valid: true
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Email domain does not have valid MX records: ${validationResult.error}`,
          email: email,
          domain: domain,
          valid: false,
          error: validationResult.error
        })
      };
    }

  } catch (error) {
    console.error('Error validating email:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to validate email',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

function getDomainFromEmail(email: string): string {
  return email.split('@')[1];
}

async function checkMXRecords(domain: string): Promise<{ valid: boolean; error?: string }> {
  console.log('Checking MX records for domain:', domain);
  
  try {
    const promise = dns.resolveMx(domain);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS query timed out')), 5000)
    );
    
    const mxRecords = await Promise.race([promise, timeout]);
    console.log('MX Records:', mxRecords);
    
    return { valid: mxRecords.length > 0 };
  } catch (error) {
    console.error('DNS error checking MX records:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'DNS error occurred' 
    };
  }
}