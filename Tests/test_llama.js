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
// test_llama.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function testLlama() {
    const sampleFn = `
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
    return -1`;
    const response = await fetch('https://us-south.ml.cloud.ibm.com/ml/v1/text/generation', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.WATSONX_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model_id: 'meta-llama/llama-3-3-70b-instruct',
            input: `Generate a Google-style docstring for this function:\n${sampleFn}`,
            parameters: { max_new_tokens: 300 }
        })
    });
    const data = await response.json();
    console.log('Llama response:', data);
}
testLlama();
// Made with Bob
//# sourceMappingURL=test_llama.js.map