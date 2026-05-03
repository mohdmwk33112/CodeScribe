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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const docGenerator_1 = require("./docGenerator");
const testGenerator_1 = require("./testGenerator");
const panelView_1 = require("./panelView");
const coverageAnalyzer_1 = require("./coverageAnalyzer");
const batchProcessor_1 = require("./batchProcessor");
const readmeGenerator_1 = require("./readmeGenerator");
// Global state for ghost text
let currentGhostDecoration = null;
let currentDocsResult = null;
let currentFunctionStartLine = -1;
let currentLanguage = '';
let currentEditor = null;
let currentFunctionCode = '';
let currentTestLanguage = 'javascript';
/**
 * CodeLens provider for inline Insert/Open Panel buttons
 */
class GhostTextCodeLensProvider {
    constructor() {
        this._onDidChangeCodeLenses = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
    }
    provideCodeLenses(document) {
        if (!currentDocsResult || !currentEditor || document !== currentEditor.document) {
            return [];
        }
        // Determine the correct line for CodeLens based on language
        let codeLensLine;
        if (currentLanguage === 'python') {
            codeLensLine = currentFunctionStartLine + 1;
        }
        else {
            codeLensLine = currentFunctionStartLine;
        }
        const range = new vscode.Range(codeLensLine, 0, codeLensLine, 0);
        return [
            new vscode.CodeLens(range, {
                title: '✓ Insert Docstring',
                command: 'codescribe.insertGhostText',
                tooltip: 'Insert the generated docstring'
            }),
            new vscode.CodeLens(range, {
                title: '📋 Open Full Panel',
                command: 'codescribe.openGhostPanel',
                tooltip: 'Open panel with tests and full documentation'
            })
        ];
    }
    refresh() {
        this._onDidChangeCodeLenses.fire();
    }
}
/**
 * Activates the CodeScribe extension
 */
function activate(context) {
    // Load environment variables from the extension's root directory
    const envPath = path.join(context.extensionPath, '.env');
    dotenv.config({ path: envPath });
    console.log('CodeScribe extension is now active');
    console.log('Extension path:', context.extensionPath);
    console.log('Environment variables loaded:', {
        hasApiKey: !!process.env.WATSONX_API_KEY,
        hasUrl: !!process.env.WATSONX_URL,
        hasProjectId: !!process.env.WATSONX_PROJECT_ID,
        hasModelId: !!process.env.WATSONX_MODEL_ID
    });
    // Register CodeLens provider
    const codeLensProvider = new GhostTextCodeLensProvider();
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ scheme: 'file' }, codeLensProvider));
    // Register command to insert ghost text
    context.subscriptions.push(vscode.commands.registerCommand('codescribe.insertGhostText', async () => {
        if (currentGhostDecoration && currentEditor && currentDocsResult) {
            currentGhostDecoration.dispose();
            currentGhostDecoration = null;
            // Clear global state to hide CodeLens buttons
            const editorToUse = currentEditor;
            const lineToUse = currentFunctionStartLine;
            const docstringToUse = currentDocsResult.docstring;
            const languageToUse = currentLanguage;
            currentDocsResult = null;
            currentEditor = null;
            currentFunctionStartLine = -1;
            currentLanguage = '';
            currentFunctionCode = '';
            codeLensProvider.refresh();
            await insertDocstring(editorToUse, lineToUse, docstringToUse, languageToUse);
            vscode.window.showInformationMessage('Docstring inserted successfully');
        }
    }));
    // Register command to open ghost panel
    context.subscriptions.push(vscode.commands.registerCommand('codescribe.openGhostPanel', async () => {
        if (currentGhostDecoration && currentEditor && currentDocsResult) {
            currentGhostDecoration.dispose();
            currentGhostDecoration = null;
            // Store values before clearing state
            const editorToUse = currentEditor;
            const docsResultToUse = currentDocsResult;
            const functionCodeToUse = currentFunctionCode;
            const testLanguageToUse = currentTestLanguage;
            const languageToUse = currentLanguage;
            const functionStartLineToUse = currentFunctionStartLine;
            // Clear global state to hide CodeLens buttons IMMEDIATELY
            currentDocsResult = null;
            currentEditor = null;
            currentFunctionStartLine = -1;
            currentLanguage = '';
            currentFunctionCode = '';
            // Force immediate CodeLens refresh
            codeLensProvider.refresh();
            // Small delay to ensure UI updates before opening panel
            await new Promise(resolve => setTimeout(resolve, 50));
            const panel = (0, panelView_1.createResultPanel)(context);
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'CodeScribe: Generating tests...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                panel.webview.postMessage({ type: 'progress', message: 'Generating tests...' });
                const testsResult = await (0, testGenerator_1.generateTests)(functionCodeToUse, testLanguageToUse);
                panel.webview.postMessage({ type: 'progress', message: 'Done!' });
                progress.report({ increment: 100 });
                panel.webview.postMessage({
                    docstring: docsResultToUse.docstring,
                    readme: docsResultToUse.readme,
                    tests: testsResult,
                    functionCode: functionCodeToUse,
                    language: languageToUse,
                    modelId: process.env.WATSONX_MODEL_ID
                });
                panel.webview.onDidReceiveMessage(async (message) => {
                    switch (message.command) {
                        case 'insertDocstring':
                            await insertDocstring(editorToUse, functionStartLineToUse, message.docstring, languageToUse);
                            vscode.window.showInformationMessage('Docstring inserted successfully');
                            break;
                        case 'createTestFile':
                            await createTestFile(editorToUse, message.tests, languageToUse);
                            vscode.window.showInformationMessage('Test file created successfully');
                            break;
                        case 'copy':
                            await vscode.env.clipboard.writeText(message.text);
                            vscode.window.showInformationMessage('Copied to clipboard');
                            break;
                        case 'regenerate':
                            const audience = message.audience || 'senior';
                            try {
                                panel.webview.postMessage({ type: 'progress', message: 'Connecting to Llama...' });
                                panel.webview.postMessage({ type: 'progress', message: 'Generating documentation...' });
                                const newDocsResult = await (0, docGenerator_1.generateDocs)(functionCodeToUse, audience);
                                panel.webview.postMessage({ type: 'progress', message: 'Generating tests...' });
                                const newTestsResult = await (0, testGenerator_1.generateTests)(functionCodeToUse, testLanguageToUse);
                                panel.webview.postMessage({ type: 'progress', message: 'Done!' });
                                panel.webview.postMessage({
                                    docstring: newDocsResult.docstring,
                                    readme: newDocsResult.readme,
                                    tests: newTestsResult,
                                    functionCode: functionCodeToUse,
                                    language: languageToUse,
                                    modelId: process.env.WATSONX_MODEL_ID
                                });
                            }
                            catch (error) {
                                vscode.window.showErrorMessage(`Regeneration failed: ${error}`);
                            }
                            break;
                        case 'saveReadme':
                            const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri;
                            if (!workspaceRoot) {
                                vscode.window.showErrorMessage('No workspace folder open');
                                return;
                            }
                            const readmeUri = vscode.Uri.joinPath(workspaceRoot, 'README.md');
                            await vscode.workspace.fs.writeFile(readmeUri, Buffer.from(message.content, 'utf8'));
                            vscode.window.showInformationMessage('README.md saved to workspace root');
                            break;
                    }
                }, undefined, context.subscriptions);
            });
        }
    }));
    // Register the main command
    const disposable = vscode.commands.registerCommand('CodeScribe.generate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        try {
            // Get document text and cursor position
            const document = editor.document;
            const cursorLine = editor.selection.active.line;
            const fullText = document.getText();
            const language = document.languageId;
            // Detect the function at cursor position
            const functionCode = detectFunction(fullText, cursorLine, language);
            if (!functionCode) {
                vscode.window.showErrorMessage('No function found at cursor position');
                return;
            }
            // Find the function start line
            const lines = fullText.split('\n');
            let functionStartLine = cursorLine;
            if (language === 'python') {
                while (functionStartLine > 0 && !lines[functionStartLine].trimStart().startsWith('def ')) {
                    functionStartLine--;
                }
            }
            else if (language === 'javascript' || language === 'typescript') {
                const functionPattern = /function\s+\w+|const\s+\w+\s*=.*=>|async\s+function|async\s+\w+/;
                while (functionStartLine > 0 && !lines[functionStartLine].match(functionPattern)) {
                    functionStartLine--;
                }
            }
            else if (language === 'java') {
                const methodPattern = /\b(public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:\w+(?:<[^>]+>)?(?:\[\])?\s+)+(\w+)\s*\(/;
                while (functionStartLine > 0 && !lines[functionStartLine].match(methodPattern)) {
                    functionStartLine--;
                }
            }
            else if (language === 'cpp' || language === 'c') {
                const functionPattern = /\b(?:inline\s+)?(?:static\s+)?(?:virtual\s+)?(?:\w+(?:<[^>]+>)?(?:\*|&)?\s+)+(?:\w+::)?(\w+)\s*\(/;
                while (functionStartLine > 0 && !lines[functionStartLine].match(functionPattern)) {
                    functionStartLine--;
                }
            }
            // Map language to test generator format
            const testLanguage = mapLanguageForTests(language);
            // Store state globally for CodeLens
            currentEditor = editor;
            currentFunctionCode = functionCode;
            currentFunctionStartLine = functionStartLine;
            currentLanguage = language;
            currentTestLanguage = testLanguage;
            // Generate documentation FIRST (before tests)
            const docsResult = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'CodeScribe: Generating documentation...',
                cancellable: false
            }, async () => {
                return await (0, docGenerator_1.generateDocs)(functionCode, 'senior');
            });
            // Store docs result globally
            currentDocsResult = docsResult;
            // Determine the correct line for ghost text based on language
            let ghostTextLine;
            if (language === 'python') {
                // Python: Insert AFTER function definition (inside function body)
                ghostTextLine = functionStartLine + 1;
            }
            else {
                // Java, C++, JS/TS: Insert BEFORE function definition
                ghostTextLine = functionStartLine;
            }
            // Format ghost text preview - show first line of docstring
            const firstLine = docsResult.docstring.split('\n')[0].trim();
            const previewText = firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
            // Get proper indentation
            const functionLine = lines[functionStartLine];
            const functionIndent = functionLine.substring(0, functionLine.length - functionLine.trimStart().length);
            const ghostIndent = language === 'python' ? functionIndent + '    ' : functionIndent;
            // Create ghost text decoration
            currentGhostDecoration = vscode.window.createTextEditorDecorationType({
                isWholeLine: true,
                before: {
                    contentText: ghostIndent + (language === 'python' ? '"""' : '/**') + ' ' + previewText + ' ' + (language === 'python' ? '"""' : '*/'),
                    color: new vscode.ThemeColor('editorGhostText.foreground'),
                    fontStyle: 'italic'
                }
            });
            // Apply decoration at the correct line
            editor.setDecorations(currentGhostDecoration, [
                new vscode.Range(ghostTextLine, 0, ghostTextLine, 0)
            ]);
            // Trigger CodeLens refresh to show clickable buttons
            codeLensProvider.refresh();
            // Show non-modal notification
            vscode.window.showInformationMessage('CodeScribe: Documentation ready. Click Insert or Open Panel above the function.', { modal: false });
        }
        catch (error) {
            vscode.window.showErrorMessage(`CodeScribe error: ${error}`);
            console.error('CodeScribe error:', error);
        }
    });
    context.subscriptions.push(disposable);
    // Register the coverage command
    const coverageDisposable = vscode.commands.registerCommand('codescribe.coverage', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        try {
            const document = editor.document;
            const text = document.getText();
            const languageId = document.languageId;
            // Analyze coverage
            const result = (0, coverageAnalyzer_1.analyzeCoverage)(text, languageId);
            // Create or reuse WebView panel
            const panel = (0, panelView_1.createResultPanel)(context);
            // Send coverage data to panel
            panel.webview.postMessage({
                type: 'coverage',
                data: result
            });
            // Handle messages from the WebView
            panel.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'jumpToFunction') {
                    const functionName = message.functionName;
                    const currentDoc = editor.document;
                    const text = currentDoc.getText();
                    const lines = text.split('\n');
                    // Find function line
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        // Check for Python, JavaScript, and TypeScript function patterns
                        if (line.includes(`def ${functionName}`) ||
                            line.includes(`function ${functionName}`) ||
                            line.includes(`const ${functionName}`) ||
                            line.match(new RegExp(`\\b${functionName}\\s*\\(`))) {
                            const position = new vscode.Position(i, 0);
                            editor.selection = new vscode.Selection(position, position);
                            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                            break;
                        }
                    }
                }
            }, undefined, context.subscriptions);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Coverage analysis error: ${error}`);
            console.error('Coverage analysis error:', error);
        }
    });
    context.subscriptions.push(coverageDisposable);
    // Register the unified batch documentation + README generation command
    const batchDisposable = vscode.commands.registerCommand('codescribe.batchGenerate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        try {
            const document = editor.document;
            const documentText = document.getText();
            const languageId = document.languageId;
            const fileName = document.fileName.split(/[\\/]/).pop() || 'file';
            // Ask user if they want to generate README
            const generateReadme = await vscode.window.showQuickPick([
                { label: '📚 Yes - Document functions + Generate README', value: 'yes', description: 'Full documentation with README file' },
                { label: '📝 No - Only document functions', value: 'no', description: 'Skip README generation' }
            ], {
                placeHolder: 'Generate README for this file?',
                title: 'CodeScribe: Document Entire File'
            });
            if (!generateReadme) {
                return; // User cancelled
            }
            const shouldGenerateReadme = generateReadme.value === 'yes';
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: shouldGenerateReadme ? 'CodeScribe: Documenting file + Generating README...' : 'CodeScribe: Documenting file...',
                cancellable: false
            }, async (progress) => {
                // Step 1: Document all functions
                progress.report({ message: 'Documenting functions...', increment: shouldGenerateReadme ? 10 : 20 });
                const results = await (0, batchProcessor_1.batchGenerateDocs)(documentText, languageId, (current, total, functionName) => {
                    const progressIncrement = shouldGenerateReadme ? (40 / total) : (60 / total);
                    progress.report({
                        message: `Function ${current}/${total}: ${functionName}`,
                        increment: progressIncrement
                    });
                });
                if (results.length === 0) {
                    if (shouldGenerateReadme) {
                        vscode.window.showWarningMessage('CodeScribe: No undocumented functions found. Generating README from existing documentation...');
                    }
                    else {
                        vscode.window.showInformationMessage('CodeScribe: No undocumented functions found');
                        return;
                    }
                }
                else {
                    // Insert all docstrings in reverse order (bottom to top to preserve line numbers)
                    const editSuccess = await editor.edit(editBuilder => {
                        const sortedResults = [...results].sort((a, b) => b.insertLine - a.insertLine);
                        for (const result of sortedResults) {
                            const functionDefLine = languageId === 'python' ? result.insertLine - 1 : result.insertLine;
                            const formattedDocstring = formatDocstringForLanguage(result.docstring, languageId, documentText, functionDefLine);
                            const insertPosition = new vscode.Position(result.insertLine, 0);
                            editBuilder.insert(insertPosition, formattedDocstring + '\n');
                        }
                    });
                    if (!editSuccess) {
                        vscode.window.showErrorMessage('Failed to insert documentation');
                        return;
                    }
                    await editor.document.save();
                }
                // Step 2: Generate README if requested
                if (shouldGenerateReadme) {
                    progress.report({ message: 'Extracting function metadata...', increment: 10 });
                    const updatedText = editor.document.getText();
                    const functions = (0, readmeGenerator_1.extractFunctionMetadata)(updatedText, languageId);
                    progress.report({ message: 'Generating README...', increment: 20 });
                    const fileMetadata = {
                        fileName,
                        language: languageId,
                        functions,
                        totalLines: updatedText.split('\n').length
                    };
                    const readmeContent = await (0, readmeGenerator_1.generateFileReadme)(fileMetadata);
                    progress.report({ message: 'Opening README preview...', increment: 20 });
                    // Show README in WebView panel
                    const panel = (0, panelView_1.createResultPanel)(context);
                    panel.webview.postMessage({
                        docstring: '',
                        readme: readmeContent.fullMarkdown,
                        tests: '',
                        modelId: process.env.WATSONX_MODEL_ID
                    });
                    // Handle save README message
                    panel.webview.onDidReceiveMessage(async (message) => {
                        if (message.command === 'saveReadme') {
                            const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri;
                            if (!workspaceRoot) {
                                vscode.window.showErrorMessage('No workspace folder open');
                                return;
                            }
                            // Save README next to the source file
                            const sourceFileUri = editor.document.uri;
                            const sourceDir = vscode.Uri.joinPath(sourceFileUri, '..');
                            const readmeUri = vscode.Uri.joinPath(sourceDir, `README_${fileName}.md`);
                            await vscode.workspace.fs.writeFile(readmeUri, Buffer.from(message.content, 'utf8'));
                            vscode.window.showInformationMessage(`README saved as README_${fileName}.md`);
                        }
                    }, undefined, context.subscriptions);
                    vscode.window.showInformationMessage(`CodeScribe: Documented ${results.length} functions and generated README`);
                }
                else {
                    // Show success message for documentation only
                    vscode.window.showInformationMessage(`CodeScribe: Documented ${results.length} functions successfully`);
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Documentation error: ${error}`);
            console.error('Documentation error:', error);
        }
    });
    context.subscriptions.push(batchDisposable);
}
/**
 * Detects the function at the cursor position
 */
function detectFunction(text, cursorLine, language) {
    const lines = text.split('\n');
    if (language === 'python') {
        return findPythonFunction(lines, cursorLine);
    }
    else if (language === 'javascript' || language === 'typescript') {
        return findJSFunction(lines, cursorLine);
    }
    else if (language === 'java') {
        return findJavaFunction(lines, cursorLine);
    }
    else if (language === 'cpp' || language === 'c') {
        return findCppFunction(lines, cursorLine);
    }
    return null;
}
/**
 * Finds a Python function at the cursor position
 */
function findPythonFunction(lines, cursorLine) {
    let start = cursorLine;
    // Scan upward to find 'def ' keyword
    while (start > 0 && !lines[start].trimStart().startsWith('def ')) {
        start--;
    }
    // If we didn't find a def, return null
    if (!lines[start].trimStart().startsWith('def ')) {
        return null;
    }
    // Scan downward to find the end of the function (next line with same or less indentation)
    const functionIndent = lines[start].length - lines[start].trimStart().length;
    let end = start + 1;
    while (end < lines.length) {
        const line = lines[end];
        const trimmed = line.trimStart();
        // Skip empty lines and comments
        if (trimmed === '' || trimmed.startsWith('#')) {
            end++;
            continue;
        }
        // Check indentation
        const currentIndent = line.length - trimmed.length;
        if (currentIndent <= functionIndent) {
            break;
        }
        end++;
    }
    return lines.slice(start, end).join('\n');
}
/**
 * Finds a JavaScript/TypeScript function at the cursor position
 */
function findJSFunction(lines, cursorLine) {
    let start = cursorLine;
    // Scan upward to find function keyword, arrow function, or async
    const functionPattern = /function\s+\w+|const\s+\w+\s*=.*=>|async\s+function|async\s+\w+/;
    while (start > 0 && !lines[start].match(functionPattern)) {
        start--;
    }
    // If we didn't find a function, return null
    if (!lines[start].match(functionPattern)) {
        return null;
    }
    // Scan downward counting braces to find the end
    let end = start + 1;
    let braces = 0;
    for (let i = start; i < lines.length; i++) {
        const line = lines[i];
        braces += (line.match(/{/g) || []).length;
        braces -= (line.match(/}/g) || []).length;
        if (braces === 0 && i > start) {
            end = i + 1;
            break;
        }
    }
    return lines.slice(start, end).join('\n');
}
/**
 * Finds a Java method at the cursor position
 */
function findJavaFunction(lines, cursorLine) {
    let start = cursorLine;
    // Scan upward to find method declaration
    const methodPattern = /\b(public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:\w+(?:<[^>]+>)?(?:\[\])?\s+)+(\w+)\s*\(/;
    while (start > 0 && !lines[start].match(methodPattern)) {
        start--;
    }
    if (!lines[start].match(methodPattern)) {
        return null;
    }
    // Scan downward to find closing brace
    let end = start + 1;
    let braceCount = 0;
    let foundOpenBrace = false;
    for (let i = start; i < lines.length; i++) {
        const line = lines[i];
        for (const char of line) {
            if (char === '{') {
                braceCount++;
                foundOpenBrace = true;
            }
            else if (char === '}') {
                braceCount--;
            }
        }
        if (foundOpenBrace && braceCount === 0) {
            end = i + 1;
            break;
        }
    }
    return lines.slice(start, end).join('\n');
}
/**
 * Finds a C++ function at the cursor position
 */
function findCppFunction(lines, cursorLine) {
    let start = cursorLine;
    // Scan upward to find function declaration
    const functionPattern = /\b(?:inline\s+)?(?:static\s+)?(?:virtual\s+)?(?:\w+(?:<[^>]+>)?(?:\*|&)?\s+)+(?:\w+::)?(\w+)\s*\(/;
    while (start > 0 && !lines[start].match(functionPattern)) {
        start--;
    }
    if (!lines[start].match(functionPattern)) {
        return null;
    }
    // Skip destructors and operators
    if (lines[start].includes('~') || lines[start].includes('operator')) {
        return null;
    }
    // Scan downward to find closing brace
    let end = start + 1;
    let braceCount = 0;
    let foundOpenBrace = false;
    for (let i = start; i < lines.length; i++) {
        const line = lines[i];
        for (const char of line) {
            if (char === '{') {
                braceCount++;
                foundOpenBrace = true;
            }
            else if (char === '}') {
                braceCount--;
            }
        }
        if (foundOpenBrace && braceCount === 0) {
            end = i + 1;
            break;
        }
    }
    return lines.slice(start, end).join('\n');
}
/**
 * Maps VSCode language ID to test generator format
 */
function mapLanguageForTests(language) {
    if (language === 'python') {
        return 'python';
    }
    else if (language === 'java') {
        return 'java';
    }
    else if (language === 'cpp' || language === 'c') {
        return 'cpp';
    }
    return 'javascript'; // Default to javascript for JS/TS
}
/**
 * Inserts docstring on the first line after the function definition
 */
async function insertDocstring(editor, functionStartLine, docstring, language) {
    const lines = editor.document.getText().split('\n');
    let functionDefLine = functionStartLine;
    // Find the function declaration line based on language
    if (language === 'python') {
        while (functionDefLine > 0 && !lines[functionDefLine].trimStart().startsWith('def ')) {
            functionDefLine--;
        }
    }
    else if (language === 'javascript' || language === 'typescript') {
        const functionPattern = /function\s+\w+|const\s+\w+\s*=.*=>|async\s+function|async\s+\w+/;
        while (functionDefLine > 0 && !lines[functionDefLine].match(functionPattern)) {
            functionDefLine--;
        }
    }
    else if (language === 'java') {
        const methodPattern = /\b(public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:\w+(?:<[^>]+>)?(?:\[\])?\s+)+(\w+)\s*\(/;
        while (functionDefLine > 0 && !lines[functionDefLine].match(methodPattern)) {
            functionDefLine--;
        }
    }
    else if (language === 'cpp' || language === 'c') {
        const functionPattern = /\b(?:inline\s+)?(?:static\s+)?(?:virtual\s+)?(?:\w+(?:<[^>]+>)?(?:\*|&)?\s+)+(?:\w+::)?(\w+)\s*\(/;
        while (functionDefLine > 0 && !lines[functionDefLine].match(functionPattern)) {
            functionDefLine--;
        }
    }
    // Get the indentation of the function body (one level deeper than function def)
    const functionLine = lines[functionDefLine];
    const functionIndent = functionLine.substring(0, functionLine.length - functionLine.trimStart().length);
    const bodyIndent = functionIndent + '    '; // Add 4 spaces for body indentation
    let formattedDocstring;
    if (language === 'python') {
        // For Python, wrap in triple quotes and indent properly
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            bodyIndent + '"""' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? bodyIndent + line : ''),
            bodyIndent + '"""'
        ];
        formattedDocstring = wrappedLines.join('\n');
    }
    else if (language === 'java') {
        // For Java, use JavaDoc format (/** ... */)
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            functionIndent + '/**',
            functionIndent + ' * ' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? functionIndent + ' * ' + line : functionIndent + ' *'),
            functionIndent + ' */'
        ];
        formattedDocstring = wrappedLines.join('\n');
    }
    else if (language === 'cpp' || language === 'c') {
        // For C++, use Doxygen format (/** ... */)
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            functionIndent + '/**',
            functionIndent + ' * @brief ' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? functionIndent + ' * ' + line : functionIndent + ' *'),
            functionIndent + ' */'
        ];
        formattedDocstring = wrappedLines.join('\n');
    }
    else {
        // For JS/TS, use JSDoc format (/** ... */)
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            functionIndent + '/**',
            functionIndent + ' * ' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? functionIndent + ' * ' + line : functionIndent + ' *'),
            functionIndent + ' */'
        ];
        formattedDocstring = wrappedLines.join('\n');
    }
    // Determine insertion position based on language
    let insertPosition;
    if (language === 'python') {
        // Python: Insert AFTER function definition (inside function body)
        insertPosition = new vscode.Position(functionDefLine + 1, 0);
    }
    else {
        // Java, C++, JS/TS: Insert BEFORE function definition
        insertPosition = new vscode.Position(functionDefLine, 0);
    }
    await editor.edit(editBuilder => {
        editBuilder.insert(insertPosition, formattedDocstring + '\n');
    });
}
/**
 * Creates a test file alongside the current file
 */
async function createTestFile(editor, testContent, language) {
    const currentUri = editor.document.uri;
    const currentPath = currentUri.fsPath;
    // Get directory and filename
    const lastSlash = Math.max(currentPath.lastIndexOf('/'), currentPath.lastIndexOf('\\'));
    const dir = currentPath.substring(0, lastSlash);
    const fileName = currentPath.substring(lastSlash + 1);
    // Determine test file name based on language conventions
    let testFileName;
    const dotIndex = fileName.lastIndexOf('.');
    const name = fileName.substring(0, dotIndex);
    const ext = fileName.substring(dotIndex);
    if (language === 'python') {
        // Python: test_filename.py
        testFileName = `test_${fileName}`;
    }
    else if (language === 'java') {
        // Java: MyClassTest.java
        testFileName = `${name}Test${ext}`;
    }
    else if (language === 'cpp' || language === 'c') {
        // C++: filename_test.cpp
        testFileName = `${name}_test${ext}`;
    }
    else {
        // JS/TS: filename.test.js
        testFileName = `${name}.test${ext}`;
    }
    const testPath = `${dir}${currentPath.includes('\\') ? '\\' : '/'}${testFileName}`;
    const testUri = vscode.Uri.file(testPath);
    // Write the test file
    await vscode.workspace.fs.writeFile(testUri, Buffer.from(testContent, 'utf8'));
    // Open the test file in a new editor
    const document = await vscode.workspace.openTextDocument(testUri);
    await vscode.window.showTextDocument(document);
}
/**
 * Formats a docstring for the given language with proper indentation
 */
function formatDocstringForLanguage(docstring, languageId, documentText, insertLine) {
    const lines = documentText.split('\n');
    const functionLine = lines[insertLine];
    // Get the indentation of the function
    const functionIndent = functionLine.substring(0, functionLine.length - functionLine.trimStart().length);
    const bodyIndent = functionIndent + '    '; // Add 4 spaces for body indentation
    if (languageId === 'python') {
        // For Python, wrap in triple quotes and indent properly
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            bodyIndent + '"""' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? bodyIndent + line : ''),
            bodyIndent + '"""'
        ];
        return wrappedLines.join('\n');
    }
    else if (languageId === 'java') {
        // For Java, use JavaDoc format (/** ... */)
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            functionIndent + '/**',
            functionIndent + ' * ' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? functionIndent + ' * ' + line : functionIndent + ' *'),
            functionIndent + ' */'
        ];
        return wrappedLines.join('\n');
    }
    else if (languageId === 'cpp' || languageId === 'c') {
        // For C++, use Doxygen format (/** ... */)
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            functionIndent + '/**',
            functionIndent + ' * @brief ' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? functionIndent + ' * ' + line : functionIndent + ' *'),
            functionIndent + ' */'
        ];
        return wrappedLines.join('\n');
    }
    else {
        // For JS/TS, use JSDoc format (/** ... */)
        const docLines = docstring.trim().split('\n');
        const wrappedLines = [
            functionIndent + '/**',
            functionIndent + ' * ' + docLines[0],
            ...docLines.slice(1).map(line => line.trim() ? functionIndent + ' * ' + line : functionIndent + ' *'),
            functionIndent + ' */'
        ];
        return wrappedLines.join('\n');
    }
}
/**
 * Deactivates the extension
 */
function deactivate() {
    console.log('CodeScribe extension is now deactivated');
}
// Made with Bob
//# sourceMappingURL=extension.js.map