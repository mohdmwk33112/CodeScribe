/**
 * Batch Documentation Processor for CodeScribe
 * Generates documentation for all undocumented functions in a file
 */

import { generateDocs } from './docGenerator';

export interface BatchDocResult {
  functionName: string;
  docstring: string;
  insertLine: number;
  signature: string;
  parameters: string[];
  returnType: string;
}

/**
 * Generates documentation for all undocumented functions in a document
 * @param documentText - The full text of the document
 * @param languageId - The VS Code language identifier
 * @param onProgress - Callback for progress updates (current, total, functionName)
 * @returns Array of documentation results with insertion positions
 */
export async function batchGenerateDocs(
  documentText: string,
  languageId: string,
  onProgress: (current: number, total: number, functionName: string) => void
): Promise<BatchDocResult[]> {
  const lines = documentText.split('\n');
  const functions = parseFunctions(lines, languageId);
  const undocumentedFunctions = functions.filter(f => !f.documented);
  
  const results: BatchDocResult[] = [];
  const total = undocumentedFunctions.length;

  // Process functions sequentially to avoid rate limiting
  for (let i = 0; i < undocumentedFunctions.length; i++) {
    const func = undocumentedFunctions[i];
    
    // Report progress
    onProgress(i + 1, total, func.name);
    
    try {
      // Extract function code block
      const functionCode = lines.slice(func.startLine, func.endLine).join('\n');
      
      // Generate documentation
      const docsResult = await generateDocs(functionCode, 'senior');
      
      // Determine insertion line based on language
      let insertLine: number;
      if (languageId === 'python') {
        // Python: Insert after function definition (inside body)
        insertLine = func.startLine + 1;
      } else {
        // Java, C++, JS/TS: Insert before function definition
        insertLine = func.startLine;
      }
      
      results.push({
        functionName: func.name,
        docstring: docsResult.docstring,
        insertLine,
        signature: func.signature,
        parameters: func.parameters,
        returnType: func.returnType
      });
    } catch (error) {
      console.error(`Failed to generate docs for ${func.name}:`, error);
      // Continue with next function even if one fails
    }
  }
  
  return results;
}

/**
 * Function metadata
 */
interface FunctionInfo {
  name: string;
  startLine: number;
  endLine: number;
  documented: boolean;
  signature: string;
  parameters: string[];
  returnType: string;
}

/**
 * Parses all functions from the document
 */
function parseFunctions(lines: string[], languageId: string): FunctionInfo[] {
  switch (languageId) {
    case 'python':
      return parsePythonFunctions(lines);
    case 'javascript':
    case 'typescript':
      return parseJavaScriptFunctions(lines);
    case 'java':
      return parseJavaFunctions(lines);
    case 'cpp':
    case 'c':
      return parseCppFunctions(lines);
    default:
      return [];
  }
}

/**
 * Parses Python functions
 */
function parsePythonFunctions(lines: string[]): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Detect function definition
    if (trimmed.startsWith('def ')) {
      const fullMatch = trimmed.match(/def\s+(\w+)\s*\((.*?)\)(?:\s*->\s*(.+?))?:/);
      if (fullMatch) {
        const functionName = fullMatch[1];
        const paramsStr = fullMatch[2];
        const returnType = fullMatch[3]?.trim() || 'None';
        const signature = line.trim();
        const parameters = paramsStr.split(',').map(p => p.trim()).filter(p => p);
        const functionIndent = line.length - trimmed.length;

        // Check if documented
        let documented = false;
        let checkLine = i + 1;
        while (checkLine < lines.length && checkLine < i + 5) {
          const nextLine = lines[checkLine].trim();
          if (nextLine === '') {
            checkLine++;
            continue;
          }
          if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
            documented = true;
            break;
          }
          if (nextLine && !nextLine.startsWith('#')) {
            break;
          }
          checkLine++;
        }

        // Find end of function
        let end = i + 1;
        while (end < lines.length) {
          const endLine = lines[end];
          const endTrimmed = endLine.trimStart();
          if (endTrimmed === '' || endTrimmed.startsWith('#')) {
            end++;
            continue;
          }
          const endIndent = endLine.length - endTrimmed.length;
          if (endIndent <= functionIndent) {
            break;
          }
          end++;
        }

        functions.push({
          name: functionName,
          startLine: i,
          endLine: end,
          documented,
          signature,
          parameters,
          returnType
        });
      }
    }
  }

  return functions;
}

/**
 * Parses JavaScript/TypeScript functions
 */
function parseJavaScriptFunctions(lines: string[]): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    let functionName: string | null = null;
    let signature = line.trim();
    let parameters: string[] = [];
    let returnType = 'any';

    // Detect async functions first (more specific pattern)
    const asyncFunctionMatch = trimmed.match(/async\s+function\s+(\w+)\s*\((.*?)\)/);
    if (asyncFunctionMatch) {
      functionName = asyncFunctionMatch[1];
      parameters = asyncFunctionMatch[2].split(',').map(p => p.trim()).filter(p => p);
    }
    // Detect regular function declarations
    else {
      const namedFunctionMatch = trimmed.match(/function\s+(\w+)\s*\((.*?)\)/);
      if (namedFunctionMatch) {
        functionName = namedFunctionMatch[1];
        parameters = namedFunctionMatch[2].split(',').map(p => p.trim()).filter(p => p);
      }
    }

    // Detect arrow functions (including async arrow functions)
    if (!functionName) {
      const arrowFunctionMatch = trimmed.match(/const\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/);
      if (arrowFunctionMatch) {
        functionName = arrowFunctionMatch[1];
        parameters = arrowFunctionMatch[2].split(',').map(p => p.trim()).filter(p => p);
      }
    }

    // Detect method definitions in classes
    if (!functionName) {
      const methodMatch = trimmed.match(/(\w+)\s*\(([^)]*)\)\s*{/);
      if (methodMatch && !trimmed.startsWith('function') && !trimmed.startsWith('if') && !trimmed.startsWith('while') && !trimmed.startsWith('async')) {
        const potentialMethod = methodMatch[1];
        if (potentialMethod !== 'if' && potentialMethod !== 'while' && potentialMethod !== 'for' && potentialMethod !== 'switch') {
          functionName = potentialMethod;
          parameters = methodMatch[2].split(',').map(p => p.trim()).filter(p => p);
        }
      }
    }

    if (functionName) {
      // Check if documented
      let documented = false;
      let checkLine = i - 1;
      while (checkLine >= 0 && checkLine > i - 20) {
        const prevLine = lines[checkLine].trim();
        if (prevLine === '') {
          checkLine--;
          continue;
        }
        if (prevLine.startsWith('/**') || prevLine.includes('/**')) {
          documented = true;
          break;
        }
        if (prevLine && !prevLine.startsWith('//') && !prevLine.startsWith('*') && !prevLine.endsWith('*/')) {
          break;
        }
        checkLine--;
      }

      // Find end of function (count braces)
      let end = i + 1;
      let braces = 0;
      for (let j = i; j < lines.length; j++) {
        const scanLine = lines[j];
        braces += (scanLine.match(/{/g) || []).length;
        braces -= (scanLine.match(/}/g) || []).length;
        if (braces === 0 && j > i) {
          end = j + 1;
          break;
        }
      }

      functions.push({
        name: functionName,
        startLine: i,
        endLine: end,
        documented,
        signature,
        parameters,
        returnType
      });
    }
  }

  return functions;
}

/**
 * Parses Java methods
 */
function parseJavaFunctions(lines: string[]): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const methodPattern = /\b(public|private|protected)\s+(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]+>)?(?:\[\])?)\s+(\w+)\s*\((.*?)\)/;
    const match = trimmed.match(methodPattern);

    if (match) {
      const returnType = match[2];
      const methodName = match[3];
      const paramsStr = match[4];
      const parameters = paramsStr.split(',').map(p => p.trim()).filter(p => p);
      const signature = line.trim();

      // Check if documented
      let documented = false;
      let checkLine = i - 1;
      while (checkLine >= 0 && checkLine > i - 15) {
        const prevLine = lines[checkLine].trim();
        if (prevLine === '') {
          checkLine--;
          continue;
        }
        if (prevLine.includes('/**')) {
          documented = true;
          break;
        }
        if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
          break;
        }
        checkLine--;
      }

      // Find end of method (count braces)
      let end = i + 1;
      let braceCount = 0;
      let foundOpenBrace = false;
      for (let j = i; j < lines.length; j++) {
        const scanLine = lines[j];
        for (const char of scanLine) {
          if (char === '{') {
            braceCount++;
            foundOpenBrace = true;
          } else if (char === '}') {
            braceCount--;
          }
        }
        if (foundOpenBrace && braceCount === 0) {
          end = j + 1;
          break;
        }
      }

      functions.push({
        name: methodName,
        startLine: i,
        endLine: end,
        documented,
        signature,
        parameters,
        returnType
      });
    }
  }

  return functions;
}

/**
 * Parses C++ functions
 */
function parseCppFunctions(lines: string[]): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.includes('~') || trimmed.includes('operator')) {
      continue;
    }

    const functionPattern = /\b(?:inline\s+)?(?:static\s+)?(?:virtual\s+)?(\w+(?:<[^>]+>)?(?:\*|&)?)\s+(?:\w+::)?(\w+)\s*\((.*?)\)/;
    const match = trimmed.match(functionPattern);

    if (match) {
      const returnType = match[1];
      const functionName = match[2];
      const paramsStr = match[3];
      const parameters = paramsStr.split(',').map(p => p.trim()).filter(p => p);
      const signature = line.trim();

      if (['if', 'while', 'for', 'switch', 'catch'].includes(functionName)) {
        continue;
      }

      // Check if documented
      let documented = false;
      let checkLine = i - 1;
      while (checkLine >= 0 && checkLine > i - 15) {
        const prevLine = lines[checkLine].trim();
        if (prevLine === '') {
          checkLine--;
          continue;
        }
        if (prevLine.includes('/**') || prevLine.startsWith('///')) {
          documented = true;
          break;
        }
        if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
          break;
        }
        checkLine--;
      }

      // Find end of function (count braces)
      let end = i + 1;
      let braceCount = 0;
      let foundOpenBrace = false;
      for (let j = i; j < lines.length; j++) {
        const scanLine = lines[j];
        for (const char of scanLine) {
          if (char === '{') {
            braceCount++;
            foundOpenBrace = true;
          } else if (char === '}') {
            braceCount--;
          }
        }
        if (foundOpenBrace && braceCount === 0) {
          end = j + 1;
          break;
        }
      }

      functions.push({
        name: functionName,
        startLine: i,
        endLine: end,
        documented,
        signature,
        parameters,
        returnType
      });
    }
  }

  return functions;
}

// Made with Bob