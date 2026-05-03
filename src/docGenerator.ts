import * as dotenv from 'dotenv';
import { getIAMToken } from './iamToken';

// Load environment variables
dotenv.config();

/**
 * Audience type for documentation generation
 */
export type Audience = 'junior' | 'senior' | 'api-consumer';

/**
 * Result of documentation generation
 */
export interface DocGenerationResult {
  docstring: string;
  readme: string;
}

/**
 * Generates documentation (docstring and README) for the given code using IBM Llama AI.
 * 
 * @param code - The source code to document
 * @param audience - Target audience for the documentation tone
 * @returns Promise containing both docstring and README markdown
 * @throws Error if API call fails or credentials are invalid
 */
export async function generateDocs(
  code: string,
  audience: Audience
): Promise<DocGenerationResult> {
  // Validate environment variables
  const watsonxUrl = process.env.WATSONX_URL;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const modelId = process.env.WATSONX_MODEL_ID;

  if (!watsonxUrl || !projectId || !modelId) {
    throw new Error(
      'Missing required environment variables: WATSONX_URL, WATSONX_PROJECT_ID, or WATSONX_MODEL_ID'
    );
  }

  // Get IAM token for authentication
  let iamToken: string;
  try {
    iamToken = await getIAMToken();
  } catch (error) {
    throw new Error(`Failed to obtain IAM token: ${error}`);
  }

  const endpoint = `${watsonxUrl}/ml/v1/text/chat?version=2023-05-29`;

  // Build audience-specific guidance
  let audienceGuidance = '';
switch (audience) {
  case 'junior':
    audienceGuidance = 'Explain as if teaching someone new to programming: define any jargon, describe what each part does and why, and include a usage example.';
    break;
  case 'senior':
    audienceGuidance = 'Skip basics. Highlight non-obvious behavior, edge cases, complexity, and design trade-offs only.';
    break;
  case 'api-consumer':
    audienceGuidance = 'Document only the public interface: parameters (name, type, purpose), return value, and thrown errors — no implementation details.';
    break;
}

  // Build docstring prompt (example-based)
  const docstringPrompt = `You are a documentation writer.

${audienceGuidance}

Example output format:
Perform binary search on a sorted array to find target value.

Args:
    arr (list): Sorted array of integers to search.
    target (int): Value to find in the array.
    low (int): Starting index for search. Defaults to 0.
    high (int): Ending index for search. Defaults to len(arr)-1.

Returns:
    int: Index of target if found, -1 otherwise.

---END OF EXAMPLE---

Now document THIS function only. Do not copy the example above:
${code}

Docstring:`;

  // Build README prompt (completion-style)
  const readmePrompt = `You are a technical writer. Write markdown documentation for the EXACT function provided below.

Include these sections:
- ## Description
- ## Parameters (as a table)
- ## Returns
- ## Example Usage

CRITICAL RULES:
- Document the EXACT function shown in the code below
- Output ONLY markdown
- No placeholders like [description] or [blank line]
- Use proper code fences with language tags
- Write real, complete content
- Do NOT make up a different function

Function to document:
${code}

Write the markdown documentation for the above function:

## Description`;

  // Make parallel API calls
  const [rawDocstring, rawReadme] = await Promise.all([
    callAPI(endpoint, iamToken, projectId, modelId, docstringPrompt),
    callAPI(endpoint, iamToken, projectId, modelId, readmePrompt)
  ]);

  // Apply sanitization before returning
  const docstring = sanitizeDocstring(rawDocstring);
  const readme = sanitizeReadme(rawReadme);

  return { docstring, readme };
}

/**
 * Sanitizes docstring output by removing unwanted content
 */
function sanitizeDocstring(raw: string): string {
  let cleaned = raw.trim();
  
  // If input is empty or too short, return as-is
  if (cleaned.length < 10) {
    return cleaned;
  }
  
  // Remove triple quotes
  cleaned = cleaned.replace(/"""/g, '').trim();
  
  // Remove introductory phrases at the start
  const introPatterns = [
    /^Here is (a|an|the) Google-style docstring (for|of) (the|this) (function|code)[:\s]*/i,
    /^Here is (a|an|the) docstring (for|of) (the|this) (function|code)[:\s]*/i,
    /^Here's (a|an|the) Google-style docstring (for|of) (the|this) (function|code)[:\s]*/i,
    /^Here's (a|an|the) docstring (for|of) (the|this) (function|code)[:\s]*/i,
    /^(A|The) Google-style docstring (for|of) (the|this) (function|code)[:\s]*/i,
    /^Docstring[:\s]*/i
  ];
  
  for (const pattern of introPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '').trim();
      break;
    }
  }
  
  // Remove meta-commentary that the model adds
  const metaCommentaryPatterns = [
    /\n\n+The above (docstring|documentation)[\s\S]*/i,
    /\n\n+This (docstring|documentation)[\s\S]*/i,
    /\n\n+Note:?\s+The (docstring|documentation)[\s\S]*/i,
    /\n\n+\*\*Note:?\*\*[\s\S]*/i
  ];
  
  for (const pattern of metaCommentaryPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
    }
  }
  
  return cleaned.trim();
}

/**
 * Sanitizes README output by removing unwanted content
 */
function sanitizeReadme(raw: string): string {
  let cleaned = raw.trim();
  
  // Remove lines that are ONLY triple backticks
  const lines = cleaned.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed !== '```';
  });
  
  return filtered.join('\n').trim();
}

/**
 * Makes a call to the Watsonx API
 */
async function callAPI(
  endpoint: string,
  iamToken: string,
  projectId: string,
  modelId: string,
  prompt: string
): Promise<string> {
  const requestBody = {
    model_id: modelId,
    messages: [
      {
        role: "system",
        content: "You are a precise code documentation specialist. Output only exactly what is requested. Never use markdown formatting inside docstrings. Never wrap docstrings in code fences. Never add filler sentences or safety disclaimers. Output the documentation directly with no preamble."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    project_id: projectId,
    parameters: {
      max_tokens: 800,
      temperature: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: []
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${iamToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Handle specific error cases
    if (response.status === 401) {
      throw new Error('Invalid API key or IAM token — check WATSONX_API_KEY');
    }
    if (response.status === 429) {
      throw new Error('Rate limited by watsonx.ai — try again shortly');
    }
    if (response.status === 500) {
      throw new Error('Watsonx model unavailable — check WATSONX_URL and project ID');
    }
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Watsonx API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    // Extract generated text
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('API Response:', JSON.stringify(data, null, 2));
      throw new Error('Watsonx API error: Invalid response format - no choices');
    }

    const generatedText = data.choices[0].message.content;
    if (!generatedText || generatedText.trim().length === 0) {
      console.error('API Response:', JSON.stringify(data, null, 2));
      throw new Error('Watsonx API error: Empty generated text - model may need different parameters or prompt format');
    }

    return generatedText.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Watsonx API error: ${error}`);
  }
}

// Made with Bob
