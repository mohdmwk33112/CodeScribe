# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Code Mode Specific Rules

### IBM Watsonx API Integration
- **IAM Token Required**: Always call `getIAMToken()` from `src/iamToken.ts` before making Watsonx API calls
- **Token Exchange Pattern**: POST to `https://iam.cloud.ibm.com/identity/token` with form-urlencoded body containing API key
- **Endpoint Structure**: `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29` - version parameter is mandatory

### Environment Configuration
- **Critical Location**: `.env` MUST be in extension root (`context.extensionPath`), NOT workspace root
- **Loading Pattern**: Use `path.join(context.extensionPath, '.env')` in `src/extension.ts:13`
- **All Four Required**: `WATSONX_API_KEY`, `WATSONX_URL`, `WATSONX_PROJECT_ID`, `WATSONX_MODEL_ID`

### Function Detection Implementation
- **Text-Based Scanning**: Uses indentation boundaries, not AST parsing
- **Python Algorithm**: Scan upward for `def `, then downward until indentation decreases (see `src/extension.ts:127-150`)
- **JS/TS Patterns**: Detect `function `, `=>`, or `async function` keywords
- **Cursor Requirement**: Must be inside function body, not on declaration line

### Test File Generation
- **Python Naming**: `test_` prefix (e.g., `test_sample.py`)
- **JS/TS Naming**: `.test.` suffix (e.g., `sample.test.js`)
- **File Location**: Always create in same directory as source file
- **Framework Detection**: Python uses pytest, JS/TS uses Jest

### API Call Pattern
- **Parallel Execution**: Use `Promise.all([generateDocs(), generateTests()])` pattern from `src/extension.ts:61-64`
- **All-or-Nothing**: Both calls must succeed or both fail - no partial results handling

### TypeScript Build Configuration
- **Output Directory**: Compile to `out/` (not `dist/`) - required for F5 debugging to work
- **Excluded Files**: `Tests/test_granite.ts` is excluded in `tsconfig.json:16`
- **Pre-Debug**: Must run `npm run compile` before F5 launch (see `.vscode/launch.json:14`)

### WebView Communication
- **Initialization Order**: WebView must call `acquireVsCodeApi()` before sending any messages
- **Message Flow**: Extension uses `panel.webview.postMessage()`, receives via `panel.webview.onDidReceiveMessage()`
- **Asset Loading**: HTML/CSS read from `webview/` directory, CSS injected at runtime (see `src/panelView.ts:28-47`)