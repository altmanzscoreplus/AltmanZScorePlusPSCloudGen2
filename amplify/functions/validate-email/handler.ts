import type { APIGatewayProxyHandler } from 'aws-lambda';

interface EmailValidationDetails {
  format: boolean;
  domain: string | null;
  localPart: string | null;
  isCommonDomain?: boolean; // optional because before validation it's not set
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log('Validate email event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'email is required'
        })
      };
    }

    // Basic email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    // Build validation details object using the interface
    let validationDetails: EmailValidationDetails = {
      format: isValid,
      domain: isValid ? email.split('@')[1] : null,
      localPart: isValid ? email.split('@')[0] : null
    };

    // Basic domain validation
    if (isValid && validationDetails.domain) {
      const domain = validationDetails.domain;
      const commonDomains = [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'aol.com'
      ];

      validationDetails = {
        ...validationDetails,
        isCommonDomain: commonDomains.includes(domain.toLowerCase())
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        isValid,
        validationDetails,
        message: isValid ? 'Email format is valid' : 'Email format is invalid'
      })
    };

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
