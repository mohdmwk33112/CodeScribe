"use strict";
/**
 * README Generator for CodeScribe
 * Generates comprehensive README documentation for entire files
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileReadme = generateFileReadme;
exports.extractFunctionMetadata = extractFunctionMetadata;
const iamToken_1 = require("./iamToken");
/**
 * Generates a comprehensive README for a file with all its functions
 *
 * @param fileMetadata - Metadata about the file and its functions
 * @returns Promise containing the generated README content
 */
async function generateFileReadme(fileMetadata) {
    // Generate file overview using AI
    const overview = await generateFileOverview(fileMetadata);
    // Build functions reference table
    const functionsTable = buildFunctionsTable(fileMetadata.functions);
    // Build detailed documentation section
    const detailedDocs = buildDetailedDocs(fileMetadata.functions, fileMetadata.language);
    // Generate usage examples using AI
    const usageExamples = await generateUsageExamples(fileMetadata);
    // Combine all sections into full README
    const fullMarkdown = buildFullReadme(fileMetadata.fileName, overview, functionsTable, detailedDocs, usageExamples);
    return {
        overview,
        functionsTable,
        detailedDocs,
        usageExamples,
        fullMarkdown
    };
}
/**
 * Generates a high-level overview of the file using AI
 */
async function generateFileOverview(fileMetadata) {
    const watsonxUrl = process.env.WATSONX_URL;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const modelId = process.env.WATSONX_MODEL_ID;
    if (!watsonxUrl || !projectId || !modelId) {
        throw new Error('Missing Watsonx environment variables');
    }
    const iamToken = await (0, iamToken_1.getIAMToken)();
    const endpoint = `${watsonxUrl}/ml/v1/text/chat?version=2023-05-29`;
    // Build function summary for context
    const functionSummary = fileMetadata.functions
        .map(f => `- ${f.name}: ${f.docstring.split('\n')[0]}`)
        .join('\n');
    const prompt = `You are a technical writer. Write a concise overview (2-3 paragraphs) for a ${fileMetadata.language} file named "${fileMetadata.fileName}".

The file contains these functions:
${functionSummary}

Write a professional overview that:
1. Describes the file's purpose
2. Explains what problems it solves
3. Mentions key functionality

Output ONLY the overview text, no markdown headers.`;
    const requestBody = {
        model_id: modelId,
        messages: [
            {
                role: "system",
                content: "You are a technical documentation writer. Write clear, concise overviews."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        project_id: projectId,
        parameters: {
            max_tokens: 500,
            temperature: 0.3,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: []
        }
    };
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${iamToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        throw new Error(`Watsonx API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response');
    }
    return data.choices[0].message.content?.trim() || 'No overview generated';
}
/**
 * Builds a markdown table of all functions
 */
function buildFunctionsTable(functions) {
    if (functions.length === 0) {
        return 'No functions found in this file.';
    }
    let table = '| Function | Description |\n';
    table += '|----------|-------------|\n';
    for (const func of functions) {
        // Extract first line of docstring and escape special markdown characters
        let description = func.docstring.split('\n')[0].trim();
        // Remove common docstring markers if present
        description = description.replace(/^["']{3}/, '').replace(/["']{3}$/, '');
        // Escape pipe characters that would break the table
        description = description.replace(/\|/g, '\\|');
        // If description is empty or just "No documentation available", use a default
        if (!description || description === 'No documentation available') {
            description = 'No description available';
        }
        table += `| \`${func.name}\` | ${description} |\n`;
    }
    return table;
}
/**
 * Builds detailed documentation for each function
 */
function buildDetailedDocs(functions, language) {
    if (functions.length === 0) {
        return '';
    }
    let docs = '';
    for (const func of functions) {
        docs += `### \`${func.name}\`\n\n`;
        // Add signature
        docs += '**Signature:**\n```' + language + '\n';
        docs += func.signature + '\n';
        docs += '```\n\n';
        // Add documentation
        docs += '**Documentation:**\n';
        docs += func.docstring + '\n\n';
        // Add parameters if available
        if (func.parameters.length > 0) {
            docs += '**Parameters:**\n';
            for (const param of func.parameters) {
                docs += `- \`${param}\`\n`;
            }
            docs += '\n';
        }
        // Add return type if available
        if (func.returnType) {
            docs += `**Returns:** \`${func.returnType}\`\n\n`;
        }
        docs += '---\n\n';
    }
    return docs;
}
/**
 * Generates usage examples using AI
 */
async function generateUsageExamples(fileMetadata) {
    const watsonxUrl = process.env.WATSONX_URL;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const modelId = process.env.WATSONX_MODEL_ID;
    if (!watsonxUrl || !projectId || !modelId) {
        throw new Error('Missing Watsonx environment variables');
    }
    const iamToken = await (0, iamToken_1.getIAMToken)();
    const endpoint = `${watsonxUrl}/ml/v1/text/chat?version=2023-05-29`;
    // Pick top 3 functions for examples
    const topFunctions = fileMetadata.functions.slice(0, 3);
    const functionInfo = topFunctions
        .map(f => `${f.signature}\n${f.docstring.split('\n')[0]}`)
        .join('\n\n');
    const prompt = `Generate 2-3 practical usage examples for these ${fileMetadata.language} functions:

${functionInfo}

Show realistic code examples with comments. Use proper ${fileMetadata.language} syntax.
Output ONLY the code examples with brief explanations, no markdown headers.`;
    const requestBody = {
        model_id: modelId,
        messages: [
            {
                role: "system",
                content: "You are a code example generator. Write clear, practical examples."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        project_id: projectId,
        parameters: {
            max_tokens: 600,
            temperature: 0.4,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: []
        }
    };
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${iamToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        throw new Error(`Watsonx API error: ${response.status}`);
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response');
    }
    return data.choices[0].message.content?.trim() || 'No examples generated';
}
/**
 * Combines all sections into a complete README
 */
function buildFullReadme(fileName, overview, functionsTable, detailedDocs, usageExamples) {
    let readme = `# ${fileName}\n\n`;
    readme += `## Overview\n\n${overview}\n\n`;
    readme += `## Functions\n\n${functionsTable}\n\n`;
    if (detailedDocs) {
        readme += `## Detailed Documentation\n\n${detailedDocs}`;
    }
    readme += `## Usage Examples\n\n${usageExamples}\n\n`;
    readme += `---\n\n`;
    readme += `*Generated by CodeScribe - AI-Powered Documentation Generator*\n`;
    return readme;
}
/**
 * Extracts function metadata from documented code
 */
function extractFunctionMetadata(documentText, languageId) {
    const lines = documentText.split('\n');
    const functions = [];
    switch (languageId) {
        case 'python':
            return extractPythonMetadata(lines);
        case 'javascript':
        case 'typescript':
            return extractJavaScriptMetadata(lines);
        case 'java':
            return extractJavaMetadata(lines);
        case 'cpp':
        case 'c':
            return extractCppMetadata(lines);
        default:
            return [];
    }
}
/**
 * Extracts Python function metadata
 */
function extractPythonMetadata(lines) {
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();
        if (trimmed.startsWith('def ')) {
            const match = trimmed.match(/def\s+(\w+)\s*\((.*?)\)(?:\s*->\s*(.+?))?:/);
            if (match) {
                const name = match[1];
                const params = match[2].split(',').map(p => p.trim()).filter(p => p);
                const returnType = match[3]?.trim() || 'None';
                const signature = line.trim();
                // Extract docstring
                let docstring = '';
                let docLine = i + 1;
                while (docLine < lines.length && docLine < i + 20) {
                    const nextLine = lines[docLine].trim();
                    if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
                        // Found docstring start
                        const quote = nextLine.startsWith('"""') ? '"""' : "'''";
                        let docContent = nextLine.replace(quote, '').trim();
                        // Check if it's a single-line docstring
                        if (nextLine.endsWith(quote) && nextLine.length > 6) {
                            docstring = docContent.replace(quote, '').trim();
                            break;
                        }
                        docLine++;
                        let docLines = [];
                        if (docContent) {
                            docLines.push(docContent);
                        }
                        while (docLine < lines.length) {
                            const docText = lines[docLine];
                            if (docText.includes(quote)) {
                                const finalLine = docText.replace(quote, '').trim();
                                if (finalLine) {
                                    docLines.push(finalLine);
                                }
                                break;
                            }
                            const cleanedLine = docText.trim();
                            if (cleanedLine) {
                                docLines.push(cleanedLine);
                            }
                            docLine++;
                        }
                        docstring = docLines.join(' ').trim();
                        break;
                    }
                    if (nextLine && !nextLine.startsWith('#')) {
                        break;
                    }
                    docLine++;
                }
                functions.push({
                    name,
                    signature,
                    docstring: docstring || 'No documentation available',
                    parameters: params,
                    returnType,
                    lineNumber: i
                });
            }
        }
    }
    return functions;
}
/**
 * Extracts JavaScript/TypeScript function metadata
 */
function extractJavaScriptMetadata(lines) {
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        let name = null;
        let signature = '';
        let params = [];
        let returnType = 'any';
        // Match function declarations
        const funcMatch = trimmed.match(/(?:async\s+)?function\s+(\w+)\s*\((.*?)\)/);
        if (funcMatch) {
            name = funcMatch[1];
            signature = line.trim();
            params = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
        }
        // Match arrow functions
        if (!name) {
            const arrowMatch = trimmed.match(/const\s+(\w+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>/);
            if (arrowMatch) {
                name = arrowMatch[1];
                signature = line.trim();
                params = arrowMatch[2].split(',').map(p => p.trim()).filter(p => p);
            }
        }
        if (name) {
            // Extract JSDoc
            let docstring = '';
            let docLine = i - 1;
            let docLines = [];
            while (docLine >= 0 && docLine > i - 20) {
                const prevLine = lines[docLine].trim();
                if (prevLine.includes('/**')) {
                    // Found JSDoc start - collect all lines until function
                    docLine++; // Skip the /** line
                    while (docLine <= i - 1) {
                        const docText = lines[docLine].trim();
                        if (docText.startsWith('*') && !docText.startsWith('/**') && !docText.startsWith('*/')) {
                            const cleaned = docText.replace(/^\*\s*/, '').trim();
                            if (cleaned) { // Only add non-empty lines
                                docLines.push(cleaned);
                            }
                        }
                        docLine++;
                    }
                    docstring = docLines.join(' ').trim();
                    break;
                }
                if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
                    break;
                }
                docLine--;
            }
            functions.push({
                name,
                signature,
                docstring: docstring || 'No documentation available',
                parameters: params,
                returnType,
                lineNumber: i
            });
        }
    }
    return functions;
}
/**
 * Extracts Java method metadata
 */
function extractJavaMetadata(lines) {
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const methodPattern = /\b(public|private|protected)\s+(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]+>)?(?:\[\])?)\s+(\w+)\s*\((.*?)\)/;
        const match = trimmed.match(methodPattern);
        if (match) {
            const returnType = match[2];
            const name = match[3];
            const paramsStr = match[4];
            const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
            const signature = line.trim();
            // Extract JavaDoc
            let docstring = '';
            let docLine = i - 1;
            let docLines = [];
            while (docLine >= 0 && docLine > i - 20) {
                const prevLine = lines[docLine].trim();
                if (prevLine.includes('/**')) {
                    // Found JavaDoc start - collect all lines until method
                    docLine++; // Skip the /** line
                    while (docLine <= i - 1) {
                        const docText = lines[docLine].trim();
                        if (docText.startsWith('*') && !docText.startsWith('/**') && !docText.startsWith('*/')) {
                            const cleaned = docText.replace(/^\*\s*/, '').trim();
                            if (cleaned && !cleaned.startsWith('@')) { // Skip @param, @return tags for description
                                docLines.push(cleaned);
                            }
                        }
                        docLine++;
                    }
                    docstring = docLines.join(' ').trim();
                    break;
                }
                if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
                    break;
                }
                docLine--;
            }
            functions.push({
                name,
                signature,
                docstring: docstring || 'No documentation available',
                parameters: params,
                returnType,
                lineNumber: i
            });
        }
    }
    return functions;
}
/**
 * Extracts C++ function metadata
 */
function extractCppMetadata(lines) {
    const functions = [];
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
            const name = match[2];
            const paramsStr = match[3];
            const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
            const signature = line.trim();
            if (['if', 'while', 'for', 'switch', 'catch'].includes(name)) {
                continue;
            }
            // Extract Doxygen comment
            let docstring = '';
            let docLine = i - 1;
            let docLines = [];
            while (docLine >= 0 && docLine > i - 20) {
                const prevLine = lines[docLine].trim();
                if (prevLine.includes('/**') || prevLine.startsWith('///')) {
                    // Found Doxygen comment
                    if (prevLine.includes('/**')) {
                        docLine++; // Skip the /** line
                    }
                    while (docLine <= i - 1) {
                        const docText = lines[docLine].trim();
                        if (docText.startsWith('*') || docText.startsWith('///')) {
                            const cleaned = docText.replace(/^(\*|\/\/\/)\s*/, '').trim();
                            if (cleaned && !cleaned.startsWith('@') && !cleaned.startsWith('*/')) {
                                docLines.push(cleaned);
                            }
                        }
                        docLine++;
                    }
                    docstring = docLines.join(' ').trim();
                    break;
                }
                if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
                    break;
                }
                docLine--;
            }
            functions.push({
                name,
                signature,
                docstring: docstring || 'No documentation available',
                parameters: params,
                returnType,
                lineNumber: i
            });
        }
    }
    return functions;
}
// Made with Bob
//# sourceMappingURL=readmeGenerator.js.map