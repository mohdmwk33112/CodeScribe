# watsonx.ai API Reference

## Environment Variables
WATSONX_API_KEY=your_key_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your_project_id_here
WATSONX_MODEL_ID=meta-llama/llama-3-3-70b-instruct
## Endpoint
POST ${WATSONX_URL}/ml/v1/text/generation

## Headers
Authorization: Bearer ${WATSONX_API_KEY}
Content-Type: application/json

## Request body
{
  "model_id": "${WATSONX_MODEL_ID}",
  "input": "<your prompt here>",
  "project_id": "${WATSONX_PROJECT_ID}",
  "parameters": {
    "max_new_tokens": 300,
    "temperature": 0.7
  }
}

## Response shape
{
  "results": [
    { "generated_text": "..." }
  ]
}

## Error handling
- 401 = bad API key, check WATSONX_API_KEY in .env
- 429 = rate limited, add retry logic
- 500 = Llama unavailable, throw with message