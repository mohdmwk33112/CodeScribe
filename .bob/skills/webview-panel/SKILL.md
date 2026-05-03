---
name: webview-panel
description: Build VS Code webview panel HTML/CSS/JS that feels native using VS Code CSS variables and the postMessage API
---

When building a VS Code webview panel:

<Steps>
<Step>
Never hardcode colors. Use only VS Code CSS variables.
See full variable list in `vscode-css-variables.md`.
</Step>
<Step>
Acquire the VS Code API once at the top of the script:
  const vscode = acquireVsCodeApi();
Use vscode.postMessage({ command: '...' }) to send messages back to the extension.
</Step>
<Step>
Receive data from the extension:
  window.addEventListener('message', event => {
    const { docstring, readme, tests } = event.data;
    // populate the UI
  });
</Step>
<Step>
Show a loading spinner on load.
Hide it once the message arrives with content.
</Step>
<Step>
Tab switching: use data attributes and classList toggling.
No frameworks — vanilla JS only.
</Step>
<Step>
All code blocks must use:
  font-family: var(--vscode-editor-font-family)
</Step>
<Step>
Buttons must use VS Code button variables:
  background: var(--vscode-button-background)
  color: var(--vscode-button-foreground)
And on hover:
  background: var(--vscode-button-hoverBackground)
</Step>
</Steps>