---
name: vscode-extension
description: Wire VS Code extension commands, context menus, WebviewPanels, and editor interactions using the vscode API
---

When building VS Code extension functionality:

<Steps>
<Step>
Register commands using vscode.commands.registerCommand inside the activate() function.
Push every disposable to context.subscriptions.
</Step>
<Step>
For context menu entries, add to BOTH:
- contributes.commands in package.json
- contributes.menus > editor/context in package.json
with when clause: editorTextFocus
</Step>
<Step>
Get editor content using:
- vscode.window.activeTextEditor
- editor.document.getText()
- editor.document.languageId for language detection
</Step>
<Step>
For function detection, scan from cursor position outward.
Look for 'def ' (Python) or 'function '/ '=>' (JS/TS).
See patterns in `extension-patterns.md`.
</Step>
<Step>
Open WebviewPanel with:
vscode.window.createWebviewPanel(
  viewType,
  title,
  vscode.ViewColumn.Beside,
  { enableScripts: true }
)
</Step>
<Step>
Send data to panel:
  panel.webview.postMessage({ docstring, readme, tests })
Receive from panel:
  panel.webview.onDidReceiveMessage(msg => { ... })
</Step>
<Step>
To insert text into the editor:
  editor.edit(editBuilder => editBuilder.insert(position, text))
</Step>
<Step>
To create a new file:
  vscode.workspace.fs.writeFile(uri, Buffer.from(content))
  then vscode.window.showTextDocument(uri)
</Step>
</Steps>