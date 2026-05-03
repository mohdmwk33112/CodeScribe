# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

### IBM Watsonx Authentication
- **IAM Token Exchange Required**: Cannot use API key directly. Must call `getIAMToken()` from `src/iamToken.ts` first, then use returned token as Bearer token
- **Token Endpoint**: `https://iam.cloud.ibm.com/identity/token` with form-urlencoded body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`
- **Watsonx Endpoint Format**: `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29` (version param required)

### Environment Variables
- **Location**: `.env` file MUST be in extension root directory (not workspace root)
- **Loading**: Loaded via `path.join(context.extensionPath, '.env')` in `src/extension.ts:13`
- **Required Variables**: `WATSONX_API_KEY`, `WATSONX_URL`, `WATSONX_PROJECT_ID`, `WATSONX_MODEL_ID`

### Function Detection Algorithm
- **Not AST-based**: Uses text scanning with indentation boundaries
- **Python**: Scans upward for `def `, then downward until indentation decreases (see `src/extension.ts:127-150`)
- **JS/TS**: Scans for `function `, `=>`, or `async function` patterns
- **Cursor Position**: Must be inside function body, not on declaration line

### Test File Naming
- **Python**: `test_` prefix (e.g., `test_sample.py`)
- **JavaScript/TypeScript**: `.test.` suffix (e.g., `sample.test.js`)
- **Location**: Created in same directory as source file

### Parallel API Calls
- **Pattern**: Uses `Promise.all([generateDocs(), generateTests()])` in `src/extension.ts:61-64`
- **Failure Mode**: Both calls must succeed or both fail (no partial results)

### TypeScript Compilation
- **Output Directory**: `out/` (not `dist/`) - required for F5 debugging
- **Excluded Files**: `Tests/test_llama.ts` excluded in `tsconfig.json:16`
- **Debug Launch**: Requires `npm run compile` before F5 (configured in `.vscode/launch.json:14`)

### WebView Communication
- **Initialization**: Panel must call `acquireVsCodeApi()` before sending messages
- **Bidirectional**: Extension sends via `panel.webview.postMessage()`, receives via `panel.webview.onDidReceiveMessage()`
- **HTML/CSS Loading**: Reads from `webview/panel.html` and `webview/panel.css`, injects CSS into HTML at runtime (see `src/panelView.ts:28-47`)