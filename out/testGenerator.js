"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTests = generateTests;
const dotenv = __importStar(require("dotenv"));
const iamToken_1 = require("./iamToken");
// Load environment variables
dotenv.config();
/**
 * Generates unit tests for the given code using IBM Llama AI.
 *
 * @param code - The source code to generate tests for
 * @param language - The programming language (python or javascript)
 * @returns Promise containing the raw test code
 * @throws Error if API call fails or credentials are invalid
 */
async function generateTests(code, language) {
    // Validate environment variables
    const watsonxUrl = process.env.WATSONX_URL;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const modelId = process.env.WATSONX_MODEL_ID;
    if (!watsonxUrl || !projectId || !modelId) {
        throw new Error('Missing required environment variables: WATSONX_URL, WATSONX_PROJECT_ID, or WATSONX_MODEL_ID');
    }
    // Get IAM token for authentication
    let iamToken;
    try {
        iamToken = await (0, iamToken_1.getIAMToken)();
    }
    catch (error) {
        throw new Error(`Failed to obtain IAM token: ${error}`);
    }
    const endpoint = `${watsonxUrl}/ml/v1/text/generation?version=2023-05-29`;
    // Build language-specific prompt
    let testFramework;
    let testStarter;
    switch (language) {
        case 'python':
            testFramework = 'pytest';
            testStarter = 'def test_normal_case():';
            break;
        case 'java':
            testFramework = 'JUnit 5';
            testStarter = '@Test\n    public void testNormalCase() {';
            break;
        case 'cpp':
            testFramework = 'Google Test';
            testStarter = 'TEST(FunctionTest, NormalCase) {';
            break;
        default: // javascript
            testFramework = 'Jest';
            testStarter = "test('normal case',";
    }
    const prompt = `You are a test writer. Write exactly 3 unit tests for the EXACT function provided below using ${testFramework}:
1. Normal case - expected happy path
2. Edge case - boundary or empty input
3. Error case - invalid input or exception

CRITICAL RULES:
- Test the EXACT function shown in the code below
- Output ONLY test code
- No explanations
- No prose before or after
- Do NOT make up a different function

Function to test:
${code}

Write the tests for the above function:

${testStarter}`;
    return await callWatsonxAPI(prompt, endpoint, iamToken, projectId, modelId);
}
/**
 * Makes a call to the Watsonx API with proper error handling
 */
async function callWatsonxAPI(prompt, endpoint, iamToken, projectId, modelId) {
    const requestBody = {
        model_id: modelId,
        input: prompt,
        project_id: projectId,
        parameters: {
            max_new_tokens: 2000,
            temperature: 0.3,
            min_new_tokens: 50,
            stop_sequences: [],
        },
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
        const data = await response.json();
        // Extract generated text
        if (!data.results || !data.results[0] || !data.results[0].generated_text) {
            throw new Error('Watsonx API error: Invalid response format');
        }
        return data.results[0].generated_text.trim();
    }
    catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Watsonx API error: ${error}`);
    }
}
// Made with Bob
//# sourceMappingURL=testGenerator.js.map