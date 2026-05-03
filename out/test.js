"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iamToken_1 = require("./iamToken");
const docGenerator_1 = require("./docGenerator");
const testGenerator_1 = require("./testGenerator");
// Sample Python function for testing
const samplePythonCode = `
def calculate_discount(price: float, discount_percent: float) -> float:
    """Calculate discounted price."""
    if discount_percent < 0 or discount_percent > 100:
        raise ValueError("Discount must be between 0 and 100")
    return price * (1 - discount_percent / 100)
`;
// Sample JavaScript function for testing
const sampleJavaScriptCode = `
function calculateDiscount(price, discountPercent) {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error("Discount must be between 0 and 100");
    }
    return price * (1 - discountPercent / 100);
}
`;
async function testIAMToken() {
    console.log('\n=== Testing IAM Token Exchange ===');
    try {
        const token = await (0, iamToken_1.getIAMToken)();
        console.log('✓ IAM token obtained successfully');
        console.log(`Token preview: ${token.substring(0, 20)}...`);
        return true;
    }
    catch (error) {
        console.error('✗ IAM token exchange failed:', error);
        return false;
    }
}
async function testDocGeneration() {
    console.log('\n=== Testing Documentation Generation ===');
    const audiences = ['junior', 'senior', 'api-consumer'];
    for (const audience of audiences) {
        console.log(`\nTesting audience: ${audience}`);
        try {
            const result = await (0, docGenerator_1.generateDocs)(samplePythonCode, audience);
            console.log(`✓ Docstring generated (${result.docstring.length} chars)`);
            console.log(`✓ README generated (${result.readme.length} chars)`);
            console.log('\nDocstring preview:');
            console.log(result.docstring.substring(0, 200) + '...');
        }
        catch (error) {
            console.error(`✗ Failed for ${audience}:`, error);
            return false;
        }
    }
    return true;
}
async function testTestGeneration() {
    console.log('\n=== Testing Unit Test Generation ===');
    // Test Python
    console.log('\nTesting Python test generation...');
    try {
        const pythonTests = await (0, testGenerator_1.generateTests)(samplePythonCode, 'python');
        console.log(`✓ Python tests generated (${pythonTests.length} chars)`);
        console.log('\nPython tests preview:');
        console.log(pythonTests.substring(0, 300) + '...');
    }
    catch (error) {
        console.error('✗ Python test generation failed:', error);
        return false;
    }
    // Test JavaScript
    console.log('\nTesting JavaScript test generation...');
    try {
        const jsTests = await (0, testGenerator_1.generateTests)(sampleJavaScriptCode, 'javascript');
        console.log(`✓ JavaScript tests generated (${jsTests.length} chars)`);
        console.log('\nJavaScript tests preview:');
        console.log(jsTests.substring(0, 300) + '...');
    }
    catch (error) {
        console.error('✗ JavaScript test generation failed:', error);
        return false;
    }
    return true;
}
async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  CodeScribe Granite API Integration Test Suite         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    const results = {
        iamToken: false,
        docGeneration: false,
        testGeneration: false,
    };
    // Test IAM token first
    results.iamToken = await testIAMToken();
    if (!results.iamToken) {
        console.log('\n❌ IAM token test failed. Cannot proceed with other tests.');
        process.exit(1);
    }
    // Test documentation generation
    results.docGeneration = await testDocGeneration();
    // Test unit test generation
    results.testGeneration = await testTestGeneration();
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Test Summary                                          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`IAM Token Exchange:       ${results.iamToken ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Documentation Generation: ${results.docGeneration ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Test Generation:          ${results.testGeneration ? '✓ PASS' : '✗ FAIL'}`);
    const allPassed = results.iamToken && results.docGeneration && results.testGeneration;
    console.log(`\nOverall: ${allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
    process.exit(allPassed ? 0 : 1);
}
// Run tests
runAllTests().catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
});
// Made with Bob
//# sourceMappingURL=test.js.map