# 🚀 CodeScribe

**AI-Powered Documentation & Test Generation for VS Code**

[![VS Code](https://img.shields.io/badge/VS%20Code-1.80%2B-blue.svg)](https://code.visualstudio.com/)
[![IBM Watsonx](https://img.shields.io/badge/Powered%20by-IBM%20Watsonx-052FAD.svg)](https://www.ibm.com/watsonx)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Transform undocumented code into well-documented, tested projects in seconds using IBM Watsonx AI.

---

## 📖 Overview

CodeScribe is a VS Code extension that leverages **IBM Watsonx AI** (Llama 3.3 70B Instruct model) to automatically generate:

- 📝 **Professional Documentation** - Google-style docstrings with parameter descriptions, return types, and examples
- 🧪 **Comprehensive Unit Tests** - Complete test suites with edge cases and assertions
- 📊 **Coverage Analysis** - Identify undocumented functions across your codebase
- 📚 **README Generation** - AI-written project documentation with function references
- ⚡ **Batch Processing** - Document entire files at once

### Why CodeScribe?

Every developer faces the challenge of inheriting or maintaining undocumented code. CodeScribe solves this by:

- **Saving Time**: Generate documentation in seconds, not hours
- **Ensuring Quality**: AI-powered analysis produces professional-grade documentation
- **Improving Maintainability**: Well-documented code is easier to understand and modify
- **Supporting Multiple Languages**: Python, JavaScript, TypeScript, Java, and C++

---

## ✨ Features

### 🎯 Core Features

#### 1. **Single Function Documentation & Tests**
Place your cursor inside any function, right-click, and select **"⚡ CodeScribe: Generate Docs & Tests"**

- Generates comprehensive docstrings with:
  - Function description
  - Parameter documentation
  - Return type information
  - Usage examples
- Creates complete unit tests with:
  - Multiple test cases
  - Edge case handling
  - Framework-specific syntax (pytest, Jest, JUnit, etc.)

#### 2. **Coverage Analysis**
Right-click and select **"📊 CodeScribe: Show Coverage"**

- Analyzes entire file for documentation coverage
- Shows percentage of documented vs undocumented functions
- Lists all undocumented functions with clickable navigation
- Visual progress bar for quick assessment

#### 3. **Batch Processing**
Right-click and select **"📚 CodeScribe: Document Entire File"**

- Documents all functions in a file sequentially
- Optionally generates a comprehensive README with:
  - AI-written file overview
  - Function reference table
  - Detailed documentation for each function
  - Usage examples
- Perfect for open-source projects or team documentation

### 🌐 Multi-Language Support

| Language | Documentation Format | Test Framework |
|----------|---------------------|----------------|
| Python | Google-style docstrings | pytest |
| JavaScript/TypeScript | JSDoc comments | Jest |
| Java | JavaDoc comments | JUnit |
| C++ | Doxygen comments | Google Test |

---

## 🚀 Getting Started

### Prerequisites

- **VS Code**: Version 1.80 or higher
- **IBM Watsonx Account**: Required for API access
- **Node.js**: Version 20.x or higher (for development)

### Installation

#### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codescribe.git
   cd codescribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure IBM Watsonx credentials**
   
   Create a `.env` file in the extension root directory:
   ```env
   WATSONX_API_KEY=your_api_key_here
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   WATSONX_PROJECT_ID=your_project_id_here
   WATSONX_MODEL_ID=meta-llama/llama-3-3-70b-instruct
   ```

4. **Compile the extension**
   ```bash
   npm run compile
   ```

5. **Launch in VS Code**
   - Press `F5` to open a new VS Code window with the extension loaded
   - Or run: `code --extensionDevelopmentPath=/path/to/codescribe`

---

## 📚 Usage

### Quick Start Example

1. **Open a file with an undocumented function**
   ```python
   def calculate_sum(numbers):
       total = 0
       for num in numbers:
           total += num
       return total
   ```

2. **Place cursor inside the function**

3. **Right-click → "⚡ CodeScribe: Generate Docs & Tests"**

4. **Review generated content in the WebView panel**
   - **Docstring Tab**: See the generated documentation
   - **Tests Tab**: Review the unit tests
   - **README Tab**: View function documentation (batch mode only)

5. **Insert documentation**
   - Click **"Insert Docstring"** to add documentation to your code
   - Click **"Create Test File"** to generate a test file

### Result

```python
def calculate_sum(numbers):
    """
    Calculate the sum of all numbers in a list.
    
    Args:
        numbers (list): A list of numeric values to sum.
    
    Returns:
        int/float: The total sum of all numbers in the list.
    
    Example:
        >>> calculate_sum([1, 2, 3, 4, 5])
        15
        >>> calculate_sum([10.5, 20.3, 5.2])
        36.0
    """
    total = 0
    for num in numbers:
        total += num
    return total
```

And a corresponding test file `test_sample.py`:
```python
import pytest
from sample import calculate_sum

def test_calculate_sum_positive_numbers():
    assert calculate_sum([1, 2, 3, 4, 5]) == 15

def test_calculate_sum_empty_list():
    assert calculate_sum([]) == 0

def test_calculate_sum_negative_numbers():
    assert calculate_sum([-1, -2, -3]) == -6

def test_calculate_sum_mixed_numbers():
    assert calculate_sum([10, -5, 3, -2]) == 6
```

---

## 🛠️ Architecture

### Technology Stack

- **Frontend**: TypeScript, VS Code Extension API
- **AI Engine**: IBM Watsonx AI (Llama 3.3 70B Instruct)
- **Authentication**: IBM IAM Token Exchange
- **UI**: VS Code WebView API with custom HTML/CSS

### Project Structure

```
codescribe/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── docGenerator.ts       # Documentation generation logic
│   ├── testGenerator.ts      # Test generation logic
│   ├── coverageAnalyzer.ts   # Coverage analysis
│   ├── batchProcessor.ts     # Batch processing logic
│   ├── readmeGenerator.ts    # README generation
│   ├── iamToken.ts           # IBM IAM authentication
│   └── panelView.ts          # WebView panel management
├── webview/
│   ├── panel.html            # WebView UI template
│   └── panel.css             # WebView styling
├── demo/
│   ├── sample_functions.py   # Demo Python file
│   ├── coverage_test.py      # Coverage demo file
│   └── coverage_test.js      # Coverage demo file (JS)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables (not in repo)
```

### How It Works

1. **Function Detection**: Text-based scanning using indentation boundaries (not AST-based)
2. **Authentication**: Exchanges API key for IBM IAM token via `https://iam.cloud.ibm.com/identity/token`
3. **API Call**: Sends code to Watsonx endpoint with Llama 3.3 70B model
4. **Response Processing**: Parses AI-generated documentation and tests
5. **Code Insertion**: Inserts docstrings with proper indentation and formatting
6. **Test File Creation**: Generates test files with language-specific naming conventions

---

## 🔧 Configuration

### Environment Variables

All configuration is done via the `.env` file in the extension root directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `WATSONX_API_KEY` | Your IBM Watsonx API key | `abc123...` |
| `WATSONX_URL` | Watsonx API endpoint | `https://us-south.ml.cloud.ibm.com` |
| `WATSONX_PROJECT_ID` | Your Watsonx project ID | `proj-123...` |
| `WATSONX_MODEL_ID` | AI model to use | `meta-llama/llama-3-3-70b-instruct` |

### Getting IBM Watsonx Credentials

1. Sign up for [IBM Cloud](https://cloud.ibm.com/)
2. Create a Watsonx AI instance
3. Generate an API key from IAM settings
4. Create a project and note the project ID
5. Copy credentials to your `.env` file

---

## 🧪 Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch

# Run linter
npm run lint
```

### Debugging

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. Test the extension in the new window

### Testing

```bash
# Run tests
npm test

# Run specific test file
npm test -- --grep "function detection"
```

---

## 📊 Performance

- **Single Function**: ~3-5 seconds (including API call)
- **Batch Processing**: ~5-10 seconds per function
- **Coverage Analysis**: <1 second (local analysis)
- **Token Usage**: ~500-1000 tokens per function (varies by complexity)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure all tests pass before submitting PR

---

## 🐛 Known Issues

- **Large Functions**: Functions >500 lines may timeout or produce incomplete results
- **Complex Syntax**: Nested functions or unusual indentation may confuse detection algorithm
- **API Rate Limits**: IBM Watsonx has rate limits; batch processing large files may hit limits

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **IBM Watsonx AI**: For providing the powerful Llama 3.3 70B model
- **VS Code Team**: For the excellent extension API
- **Open Source Community**: For inspiration and support

---

## 📧 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/mohdmwk33112/CodeScribe/issues)
- **Email**:
mohdwaelk@gmail.com
nader.a.abdeltawab@gmail.com

---

## 🌟 Show Your Support

If you find CodeScribe helpful, please:

- ⭐ Star this repository
- 🐛 Report bugs or suggest features
- 📢 Share with your team
- 🤝 Contribute to the project

---

**Built with ❤️ using IBM Watsonx AI**
