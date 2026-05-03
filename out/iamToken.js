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
exports.getIAMToken = getIAMToken;
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
/**
 * Exchanges the IBM Cloud API key for an IAM access token.
 * This token must be used as the Bearer token for all watsonx.ai API calls.
 *
 * @returns Promise<string> The IAM access token
 * @throws Error if token exchange fails with descriptive message
 */
async function getIAMToken() {
    const apiKey = process.env.WATSONX_API_KEY;
    if (!apiKey) {
        throw new Error('WATSONX_API_KEY is not set in environment variables');
    }
    const iamUrl = 'https://iam.cloud.ibm.com/identity/token';
    const body = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`;
    try {
        const response = await fetch(iamUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });
        if (!response.ok) {
            throw new Error(`IAM token exchange failed: ${response.status}`);
        }
        const data = await response.json();
        if (!data.access_token) {
            throw new Error('IAM token exchange failed: No access_token in response');
        }
        return data.access_token;
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`IAM token exchange failed: ${error.message}`);
        }
        throw new Error('IAM token exchange failed: Unknown error');
    }
}
// Made with Bob
//# sourceMappingURL=iamToken.js.map