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
exports.createResultPanel = createResultPanel;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Creates and returns a WebView panel for displaying results
 */
function createResultPanel(context) {
    const panel = vscode.window.createWebviewPanel('codescribeResults', 'CodeScribe ⚡', vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    // Set the HTML content
    panel.webview.html = getWebviewContent(context, panel.webview);
    return panel;
}
/**
 * Generates the HTML content for the WebView
 */
function getWebviewContent(context, webview) {
    // Read the HTML file
    const htmlPath = path.join(context.extensionPath, 'webview', 'panel.html');
    const cssPath = path.join(context.extensionPath, 'webview', 'panel.css');
    let html = '';
    let css = '';
    try {
        html = fs.readFileSync(htmlPath, 'utf8');
        css = fs.readFileSync(cssPath, 'utf8');
    }
    catch (error) {
        // If files don't exist, use inline content
        return getInlineWebviewContent();
    }
    // Inject CSS into HTML
    html = html.replace('</head>', `<style>${css}</style></head>`);
    return html;
}
/**
 * Returns inline WebView content if external files are not available
 */
function getInlineWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeScribe Results</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      margin: 0;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: var(--vscode-foreground);
    }
    
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      background: transparent;
      border: none;
      color: var(--vscode-foreground);
      font-size: 14px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    
    .tab:hover {
      background: var(--vscode-list-hoverBackground);
    }
    
    .tab.active {
      border-bottom-color: var(--vscode-focusBorder);
      color: var(--vscode-focusBorder);
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--vscode-descriptionForeground);
    }
    
    .spinner {
      border: 3px solid var(--vscode-panel-border);
      border-top: 3px solid var(--vscode-focusBorder);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .code-block {
      background: var(--vscode-textCodeBlock-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      padding: 15px;
      margin: 15px 0;
      overflow-x: auto;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    .button {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    
    .button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    
    .button:active {
      transform: translateY(1px);
    }
    
    .markdown-content {
      line-height: 1.6;
    }
    
    .markdown-content h1,
    .markdown-content h2,
    .markdown-content h3 {
      color: var(--vscode-foreground);
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    .markdown-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }
    
    .markdown-content th,
    .markdown-content td {
      border: 1px solid var(--vscode-panel-border);
      padding: 8px 12px;
      text-align: left;
    }
    
    .markdown-content th {
      background: var(--vscode-editor-selectionBackground);
      font-weight: bold;
    }
    
    .markdown-content code {
      background: var(--vscode-textCodeBlock-background);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ CodeScribe Results</h1>
    </div>
    
    <div id="loading" class="loading">
      <div class="spinner"></div>
      <p>Generating documentation and tests...</p>
    </div>
    
    <div id="content" style="display: none;">
      <div class="tabs">
        <button class="tab active" data-tab="docstring">Docstring</button>
        <button class="tab" data-tab="readme">README</button>
        <button class="tab" data-tab="tests">Tests</button>
      </div>
      
      <div id="docstring-tab" class="tab-content active">
        <div class="code-block" id="docstring-content"></div>
        <div class="actions">
          <button class="button" id="insert-docstring">Insert Docstring</button>
        </div>
      </div>
      
      <div id="readme-tab" class="tab-content">
        <div class="markdown-content" id="readme-content"></div>
      </div>
      
      <div id="tests-tab" class="tab-content">
        <div class="code-block" id="tests-content"></div>
        <div class="actions">
          <button class="button" id="create-test-file">Create Test File</button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(targetTab + '-tab').classList.add('active');
      });
    });
    
    // Button actions
    document.getElementById('insert-docstring').addEventListener('click', () => {
      const docstring = document.getElementById('docstring-content').textContent;
      vscode.postMessage({
        command: 'insertDocstring',
        docstring: docstring
      });
    });
    
    document.getElementById('create-test-file').addEventListener('click', () => {
      const tests = document.getElementById('tests-content').textContent;
      vscode.postMessage({
        command: 'createTestFile',
        tests: tests
      });
    });
    
    // Receive data from extension
    window.addEventListener('message', event => {
      const data = event.data;
      
      // Hide loading, show content
      document.getElementById('loading').style.display = 'none';
      document.getElementById('content').style.display = 'block';
      
      // Populate content
      document.getElementById('docstring-content').textContent = data.docstring || 'No docstring generated';
      document.getElementById('readme-content').innerHTML = formatMarkdown(data.readme || 'No README generated');
      document.getElementById('tests-content').textContent = data.tests || 'No tests generated';
    });
    
    // Simple markdown formatter
    function formatMarkdown(markdown) {
      // Convert headers
      markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');
      
      // Convert bold
      markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Convert inline code
      markdown = markdown.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
      
      // Convert line breaks
      markdown = markdown.replace(/\n/g, '<br>');
      
      return markdown;
    }
  </script>
</body>
</html>`;
}
// Made with Bob
//# sourceMappingURL=panelView.js.map