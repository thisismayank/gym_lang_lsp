# GymLang Language Server Protocol (LSP) 💪

A VS Code extension providing Language Server Protocol support for [GymLang](https://github.com/thisismayank/gym_lang) - the programming language for gym bros!

## Features

### 🎯 Core LSP Features

- **Syntax Highlighting**: Commands, variables, numbers, strings, and comments
- **IntelliSense**: Auto-completion for all GymLang commands
- **Error Diagnostics**: Real-time error checking and validation
- **Hover Information**: Detailed documentation on hover
- **Go to Definition**: Navigate to command definitions
- **Document Symbols**: Outline view of your GymLang program
- **Workspace Symbols**: Search across all GymLang files

### 🏋️‍♂️ GymLang-Specific Features

- **Command Documentation**: Detailed descriptions, syntax, and examples
- **Gym Wisdom**: Motivational quotes and gym bro wisdom
- **Variable Suggestions**: Common variable names like `bench`, `squat`, `deadlift`
- **Error Messages**: Gym-themed error messages and suggestions
- **Run Command**: Execute GymLang files directly from VS Code

## Prerequisites

This extension requires the [GymLang interpreter](https://github.com/thisismayank/gym_lang) to be installed. The extension will automatically look for the GymLang interpreter in the parent directory.

## Installation

### From VSIX (Recommended)

1. Download the latest `.vsix` file from releases
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Select the downloaded file

### From Source

1. Clone this repository:

```bash
git clone https://github.com/thisismayank/gymlang-lsp.git
cd gymlang-lsp
```

2. Install dependencies:

```bash
npm install
```

3. Package the extension:

```bash
npm run compile
vsce package
```

4. Install the generated `.vsix` file in VS Code

## Usage

### In VS Code

1. Open a `.gym` file
2. The LSP will automatically activate
3. Enjoy features like:
   - Syntax highlighting
   - Auto-completion (Ctrl+Space)
   - Hover documentation
   - Error diagnostics
   - Command palette: "Run GymLang File"

### LSP Features in Action

#### Auto-completion

Type `B` and see suggestions for `BRO`, `BULK`, `BEAST`, etc.

#### Hover Documentation

Hover over any command to see:

- Description
- Syntax
- Example usage
- Category

#### Error Diagnostics

Invalid commands will show errors with suggestions for valid alternatives.

#### Document Outline

View all commands in your file in the outline panel.

#### Run GymLang Files

Use the command palette (Ctrl+Shift+P) and type "Run GymLang File" to execute your `.gym` files directly in VS Code.

## Architecture

### File Structure

```
gymlang-lsp/
├── lsp/
│   └── server.js          # Main LSP server implementation
├── syntaxes/
│   └── gymlang.tmLanguage.json  # TextMate grammar for syntax highlighting
├── language-configuration.json  # Language configuration
├── extension.js                 # VS Code extension entry point
├── package.json                 # Extension manifest
└── README.md                   # This file
```

### LSP Server Features

#### Commands Supported

All 25 GymLang commands with full documentation:

- **Variable Declaration**: `RACK`, `BRO`
- **Arithmetic**: `LIFT`, `BULK`, `DROP`, `SHRED`, `GAINS`, `CUT`
- **Output**: `REPS`, `SETS`, `FLEX`, `MOTIVATION`
- **Math**: `PUMP`, `GRIND`, `SWOLE`, `BEAST`, `SAVAGE`
- **Special**: `YOLO`, `LEGDAY`, `CARDIO`, `PROTEIN`, `CREATINE`, `STEROIDS`
- **Utilities**: `NOEXCUSES`, `HUSTLE`, `GRINDMODE`

#### Diagnostic Features

- Unknown command detection
- Syntax error validation
- Real-time error reporting
- Gym-themed error messages

#### Completion Features

- Command auto-completion
- Variable name suggestions
- Gym wisdom quotes
- Context-aware suggestions

## Development

### Setup Development Environment

1. Clone both repositories:

```bash
git clone https://github.com/thisismayank/gym_lang.git
git clone https://github.com/thisismayank/gymlang-lsp.git
```

2. Place the LSP repository inside the GymLang repository:

```
gym_lang/
├── gymlang.js
├── README.md
└── gymlang-lsp/
    ├── lsp/
    ├── syntaxes/
    └── ...
```

3. Install dependencies:

```bash
cd gymlang-lsp
npm install
```

### Testing

1. Open the GymLang repository in VS Code
2. Press F5 to start debugging the extension
3. Open a `.gym` file to test features
4. Use the demo file: `gymlang-lsp/demo.gym`

### Adding New Commands

1. Add the command to `GYMLANG_COMMANDS` in `lsp/server.js`:

```javascript
NEW_COMMAND: {
  description: "Description of what it does",
  syntax: "NEW_COMMAND <args>",
  example: "NEW_COMMAND example",
  category: "Category"
}
```

2. Update the grammar in `syntaxes/gymlang.tmLanguage.json`

3. Test with the demo file

## Configuration

### VS Code Settings

```json
{
  "gymlang.maxNumberOfProblems": 1000
}
```

### Language Configuration

The `language-configuration.json` file defines:

- Comment syntax (`#`)
- String delimiters (`"`)
- Word patterns
- Folding regions

## Troubleshooting

### Common Issues

1. **LSP not starting**: Check Node.js version (>=14.0.0)
2. **No syntax highlighting**: Ensure `.gym` files are recognized
3. **No auto-completion**: Check if LSP server is running
4. **Run command fails**: Ensure GymLang interpreter is in the parent directory

### Debug Mode

Enable debug mode to see LSP communication:

1. Set `"gymlang.trace.server": "verbose"` in VS Code settings
2. Check the Output panel for LSP logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Update documentation
5. Submit a pull request

## Related Projects

- [GymLang Interpreter](https://github.com/thisismayank/gym_lang) - The main GymLang programming language implementation

## License

MIT License - see LICENSE file for details.

---

💪 **Remember**: Every line of code is a gain! Keep pushing your limits! 🔥
