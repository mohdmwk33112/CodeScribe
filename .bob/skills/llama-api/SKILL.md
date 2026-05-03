---
name: llama-api
description: Call IBM watsonx.ai llama models via REST API using fetch in TypeScript with proper auth and error handling
---

When implementing llama API calls:

<Steps>
<Step>
Load all four credentials from process.env via dotenv:
- WATSONX_API_KEY
- WATSONX_URL
- WATSONX_PROJECT_ID
- WATSONX_MODEL_ID
Never hardcode any of these values.
</Step>
<Step>
Build the fetch call to the watsonx.ai endpoint.
Endpoint: ${process.env.WATSONX_URL}/ml/v1/text/generation

Headers:
  Authorization: Bearer ${process.env.WATSONX_API_KEY}
  Content-Type: application/json

Body:
{
  "model_id": process.env.WATSONX_MODEL_ID,
  "input": "<your prompt>",
  "project_id": process.env.WATSONX_PROJECT_ID,
  "parameters": {
    "max_new_tokens": 300,
    "temperature": 0.7
  }
}
</Step>
<Step>
Always wrap the fetch in try/catch.
Throw descriptive errors that include the HTTP status and response body.
Handle these specific cases:
- 401 = log "Invalid API key" and throw
- 429 = log "Rate limited" and throw
- 500 = log "llama unavailable" and throw
</Step>
<Step>
Extract the generated text from the response:
data.results[0].generated_text
</Step>
</Steps>