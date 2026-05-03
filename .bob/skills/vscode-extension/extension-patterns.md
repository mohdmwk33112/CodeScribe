# Common Extension Patterns

## Insert text above current line
const line = editor.selection.active.line;
const position = new vscode.Position(line, 0);
editor.edit(b => b.insert(position, docstring + '\n'));

## Create a test file alongside current file
const currentUri = editor.document.uri;
const dir = currentUri.path.substring(0, currentUri.path.lastIndexOf('/'));
const fileName = currentUri.path.split('/').pop();
const testUri = vscode.Uri.file(`${dir}/test_${fileName}`);
await vscode.workspace.fs.writeFile(testUri, Buffer.from(testContent, 'utf8'));
await vscode.window.showTextDocument(testUri);

## Detect language
const lang = editor.document.languageId; // 'python' | 'javascript' | 'typescript'

## Function boundary detection (Python)
function findPythonFunction(text: string, cursorLine: number): string {
  const lines = text.split('\n');
  let start = cursorLine;
  while (start > 0 && !lines[start].trimStart().startsWith('def ')) start--;
  let end = start + 1;
  while (end < lines.length && (lines[end].startsWith(' ') || lines[end] === '')) end++;
  return lines.slice(start, end).join('\n');
}

## Function boundary detection (JavaScript/TypeScript)
function findJSFunction(text: string, cursorLine: number): string {
  const lines = text.split('\n');
  let start = cursorLine;
  while (start > 0 && !lines[start].match(/function |const .* =>|async /)) start--;
  let end = start + 1;
  let braces = 0;
  for (let i = start; i < lines.length; i++) {
    braces += (lines[i].match(/{/g) || []).length;
    braces -= (lines[i].match(/}/g) || []).length;
    if (braces === 0 && i > start) { end = i + 1; break; }
  }
  return lines.slice(start, end).join('\n');
}