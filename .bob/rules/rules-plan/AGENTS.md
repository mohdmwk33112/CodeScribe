# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Plan Mode Specific Rules

### Authentication Architecture
- **Two-Step Auth Flow**: Cannot use API key directly with Watsonx - must exchange for IAM token first
- **Token Exchange**: `src/iamToken.ts` POSTs to `https://iam.cloud.ibm.com/identity/token` with form-urlencoded API key
- **Token Usage**: Returned `access_token` used as Bearer token in all Watsonx API calls
- **No Token Caching**: Each extension activation gets fresh token (no persistence between sessions)

### API Call Architecture
- **Parallel Pattern**: `Promise.all()` executes docs and tests generation simultaneously (see `src/extension.ts:61-64`)
- **Atomic Results**: Both API calls must succeed or both fail - no partial result handling
- **Endpoint Format**: `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29` - version parameter is mandatory
- **Error Propagation**: Any failure in token exchange or API call bubbles up to user notification

### Function Detection Strategy
- **Text-Based Parsing**: Uses indentation boundaries, not AST or language server
- **Python Algorithm**: Scan upward from cursor to find `def `, then downward until indentation decreases
- **JS/TS Algorithm**: Scan for `function `, `=>`, or `async function` keywords with brace matching
- **Limitation**: Cursor must be inside function body - detection fails if on declaration line

### Environment Configuration Architecture
- **Critical Path**: `.env` MUST be in extension root (`context.extensionPath`), NOT workspace root
- **Loading Timing**: Loaded in `activate()` function before any command registration
- **Required Variables**: All four must exist: `WATSONX_API_KEY`, `WATSONX_URL`, `WATSONX_PROJECT_ID`, `WATSONX_MODEL_ID`
- **No Fallbacks**: Missing variables cause immediate error - no default values

### WebView Communication Architecture
- **Initialization Order**: WebView must call `acquireVsCodeApi()` before any message handling
- **Message Protocol**: Extension sends results via `postMessage()`, receives actions via `onDidReceiveMessage()`
- **Asset Loading**: HTML/CSS read from `webview/` directory at runtime, CSS injected into HTML template
- **State Management**: WebView retains context when hidden (`retainContextWhenHidden: true`)

### Build and Debug Architecture
- **Output Directory**: TypeScript compiles to `out/` (not `dist/`) - hardcoded in `.vscode/launch.json:12`
- **Pre-Launch Task**: F5 debug requires `npm run compile` first (configured in `launch.json:14`)
- **Excluded Files**: `Tests/test_granite.ts` excluded from compilation in `tsconfig.json:16`
- **Extension Host**: Debug launches separate VS Code window with extension loaded