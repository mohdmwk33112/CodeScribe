# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Ask Mode Specific Rules

### Project Structure Context
- **src/ Directory**: Contains VS Code extension TypeScript code, not web application source
- **webview/ Directory**: Contains HTML/CSS for the WebView panel UI (separate from extension code)
- **demo/ Directory**: Contains sample Python/JS files for testing the extension
- **.bob/skills/ Directory**: Contains reusable skill documentation for Granite API and VS Code patterns

### Environment Configuration
- **.env Location**: Must be in extension root directory (where package.json is), NOT in workspace root
- **Four Required Variables**: `WATSONX_API_KEY`, `WATSONX_URL`, `WATSONX_PROJECT_ID`, `WATSONX_MODEL_ID`
- **Loading Mechanism**: Loaded via `dotenv.config()` with explicit path in `src/extension.ts:13`

### Extension Architecture
- **Main Entry**: `src/extension.ts` - activates extension and registers commands
- **API Modules**: `src/docGenerator.ts` and `src/testGenerator.ts` - handle Granite AI calls
- **Authentication**: `src/iamToken.ts` - exchanges API key for IAM token (required before API calls)
- **UI Layer**: `src/panelView.ts` - manages WebView panel creation and communication

### Test File Conventions
- **Python Tests**: Use `test_` prefix (e.g., `test_sample.py`) - pytest framework
- **JS/TS Tests**: Use `.test.` suffix (e.g., `sample.test.js`) - Jest framework
- **Test Location**: Created in same directory as source file, not in separate test folder

### Build and Debug
- **Compilation Output**: TypeScript compiles to `out/` directory (not `dist/`)
- **Debug Launch**: Press F5 to launch Extension Development Host (requires prior `npm run compile`)
- **Excluded from Build**: `Tests/test_granite.ts` is excluded in `tsconfig.json:16`

### WebView Communication Pattern
- **Bidirectional Messages**: Extension sends data via `postMessage()`, receives via `onDidReceiveMessage()`
- **Initialization**: WebView must call `acquireVsCodeApi()` before any message handling
- **Asset Loading**: HTML and CSS files read from `webview/` directory, CSS injected at runtime