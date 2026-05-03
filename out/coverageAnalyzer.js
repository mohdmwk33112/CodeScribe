"use strict";
/**
 * Coverage Analyzer for CodeScribe
 * Analyzes documentation coverage across multiple programming languages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCoverage = analyzeCoverage;
/**
 * Analyzes documentation coverage for a given document
 * @param documentText - The full text of the document
 * @param languageId - The VS Code language identifier
 * @returns Coverage analysis result
 */
function analyzeCoverage(documentText, languageId) {
    switch (languageId) {
        case 'python':
            return analyzePython(documentText);
        case 'javascript':
        case 'typescript':
            return analyzeJavaScript(documentText);
        case 'java':
            return analyzeJava(documentText);
        case 'cpp':
        case 'c':
            return analyzeCpp(documentText);
        default:
            // Unsupported language - return empty result
            return {
                total: 0,
                documented: 0,
                undocumented: [],
                percentage: 100
            };
    }
}
/**
 * Analyzes Python documentation coverage
 */
function analyzePython(text) {
    const lines = text.split('\n');
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trimStart();
        // Detect function definition
        if (trimmed.startsWith('def ')) {
            // Extract function name
            const match = trimmed.match(/def\s+(\w+)\s*\(/);
            if (match) {
                const functionName = match[1];
                // Check if previous non-empty line has docstring
                let documented = false;
                let checkLine = i + 1;
                // Look at the next few lines for docstring (inside function body)
                while (checkLine < lines.length && checkLine < i + 5) {
                    const nextLine = lines[checkLine].trim();
                    if (nextLine === '') {
                        checkLine++;
                        continue;
                    }
                    // Check for docstring opener
                    if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
                        documented = true;
                        break;
                    }
                    // If we hit actual code, stop looking
                    if (nextLine && !nextLine.startsWith('#')) {
                        break;
                    }
                    checkLine++;
                }
                functions.push({
                    name: functionName,
                    line: i,
                    documented
                });
            }
        }
    }
    return calculateCoverage(functions);
}
/**
 * Analyzes JavaScript/TypeScript documentation coverage
 */
function analyzeJavaScript(text) {
    const lines = text.split('\n');
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        let functionName = null;
        // Detect async functions first (more specific pattern)
        const asyncFunctionMatch = trimmed.match(/async\s+function\s+(\w+)\s*\(/);
        if (asyncFunctionMatch) {
            functionName = asyncFunctionMatch[1];
        }
        // Detect regular function declarations
        else {
            const namedFunctionMatch = trimmed.match(/function\s+(\w+)\s*\(/);
            if (namedFunctionMatch) {
                functionName = namedFunctionMatch[1];
            }
        }
        // Detect arrow functions (including async arrow functions)
        if (!functionName) {
            const arrowFunctionMatch = trimmed.match(/const\s+(\w+)\s*=.*=>/);
            if (arrowFunctionMatch) {
                functionName = arrowFunctionMatch[1];
            }
        }
        // Detect method definitions in classes
        if (!functionName) {
            const methodMatch = trimmed.match(/(\w+)\s*\([^)]*\)\s*{/);
            if (methodMatch && !trimmed.startsWith('function') && !trimmed.startsWith('if') && !trimmed.startsWith('while') && !trimmed.startsWith('async')) {
                // This might be a method, but we need to be careful not to match control structures
                const potentialMethod = methodMatch[1];
                if (potentialMethod !== 'if' && potentialMethod !== 'while' && potentialMethod !== 'for' && potentialMethod !== 'switch') {
                    functionName = potentialMethod;
                }
            }
        }
        if (functionName) {
            // Check if previous non-empty line has JSDoc comment
            let documented = false;
            let checkLine = i - 1;
            // Look backwards for JSDoc comment
            while (checkLine >= 0 && checkLine > i - 20) {
                const prevLine = lines[checkLine].trim();
                if (prevLine === '') {
                    checkLine--;
                    continue;
                }
                // Check for JSDoc opener (/** or /**)
                if (prevLine.startsWith('/**') || prevLine.includes('/**')) {
                    documented = true;
                    break;
                }
                // If we hit actual code, stop looking
                if (prevLine && !prevLine.startsWith('//') && !prevLine.startsWith('*') && !prevLine.endsWith('*/')) {
                    break;
                }
                checkLine--;
            }
            functions.push({
                name: functionName,
                line: i,
                documented
            });
        }
    }
    return calculateCoverage(functions);
}
/**
 * Calculates coverage statistics from function list
 */
function calculateCoverage(functions) {
    const total = functions.length;
    const documented = functions.filter(f => f.documented).length;
    const undocumented = functions
        .filter(f => !f.documented)
        .map(f => f.name);
    const percentage = total === 0 ? 100 : (documented / total) * 100;
    return {
        total,
        documented,
        undocumented,
        percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
    };
}
// Made with Bob
/**
 * Analyzes Java documentation coverage
 */
function analyzeJava(text) {
    const lines = text.split('\n');
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        // Detect method declarations (public, private, protected)
        const methodPattern = /\b(public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:\w+(?:<[^>]+>)?(?:\[\])?\s+)+(\w+)\s*\(/;
        const match = trimmed.match(methodPattern);
        if (match) {
            const methodName = match[2];
            // Skip constructors (method name matches class name pattern)
            // We'll allow it for now as we don't have class context
            // Check if previous non-empty lines have JavaDoc
            let documented = false;
            let checkLine = i - 1;
            // Look backwards for JavaDoc comment
            while (checkLine >= 0 && checkLine > i - 15) {
                const prevLine = lines[checkLine].trim();
                if (prevLine === '') {
                    checkLine--;
                    continue;
                }
                // Check for JavaDoc opener
                if (prevLine.includes('/**')) {
                    documented = true;
                    break;
                }
                // If we hit actual code or single-line comment, stop looking
                if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
                    break;
                }
                checkLine--;
            }
            functions.push({
                name: methodName,
                line: i,
                documented
            });
        }
    }
    return calculateCoverage(functions);
}
/**
 * Analyzes C++ documentation coverage
 */
function analyzeCpp(text) {
    const lines = text.split('\n');
    const functions = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        // Skip destructors and operators
        if (trimmed.includes('~') || trimmed.includes('operator')) {
            continue;
        }
        // Detect function declarations
        // Pattern: ReturnType functionName( or ReturnType Class::functionName(
        const functionPattern = /\b(?:inline\s+)?(?:static\s+)?(?:virtual\s+)?(?:\w+(?:<[^>]+>)?(?:\*|&)?\s+)+(?:\w+::)?(\w+)\s*\(/;
        const match = trimmed.match(functionPattern);
        if (match) {
            const functionName = match[1];
            // Skip common control structures
            if (['if', 'while', 'for', 'switch', 'catch'].includes(functionName)) {
                continue;
            }
            // Check if previous non-empty lines have Doxygen comment
            let documented = false;
            let checkLine = i - 1;
            // Look backwards for Doxygen comment
            while (checkLine >= 0 && checkLine > i - 15) {
                const prevLine = lines[checkLine].trim();
                if (prevLine === '') {
                    checkLine--;
                    continue;
                }
                // Check for Doxygen comment openers (/** or ///)
                if (prevLine.includes('/**') || prevLine.startsWith('///')) {
                    documented = true;
                    break;
                }
                // If we hit actual code, stop looking
                if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
                    break;
                }
                checkLine--;
            }
            functions.push({
                name: functionName,
                line: i,
                documented
            });
        }
    }
    return calculateCoverage(functions);
}
//# sourceMappingURL=coverageAnalyzer.js.map