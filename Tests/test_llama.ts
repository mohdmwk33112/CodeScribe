// test_llama.ts
import * as dotenv from 'dotenv';
dotenv.config();

async function testLlama() {
    const sampleFn = `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
    return -1`;

    const response = await fetch('https://us-south.ml.cloud.ibm.com/ml/v1/text/generation', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.WATSONX_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model_id: 'meta-llama/llama-3-3-70b-instruct',
            input: `Generate a Google-style docstring for this function:\n${sampleFn}`,
            parameters: { max_new_tokens: 300 }
        })
    });

    const data = await response.json();
    console.log('Llama response:', data);
}

testLlama();

// Made with Bob
