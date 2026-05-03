import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Exchanges the IBM Cloud API key for an IAM access token.
 * This token must be used as the Bearer token for all watsonx.ai API calls.
 * 
 * @returns Promise<string> The IAM access token
 * @throws Error if token exchange fails with descriptive message
 */
export async function getIAMToken(): Promise<string> {
  const apiKey = process.env.WATSONX_API_KEY;
  
  if (!apiKey) {
    throw new Error('WATSONX_API_KEY is not set in environment variables');
  }

  const iamUrl = 'https://iam.cloud.ibm.com/identity/token';
  const body = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`;

  try {
    const response = await fetch(iamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`IAM token exchange failed: ${response.status}`);
    }

    const data = await response.json() as { access_token?: string };
    
    if (!data.access_token) {
      throw new Error('IAM token exchange failed: No access_token in response');
    }

    return data.access_token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`IAM token exchange failed: ${error.message}`);
    }
    throw new Error('IAM token exchange failed: Unknown error');
  }
}

// Made with Bob
