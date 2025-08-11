# GymLang LSP Setup Guide 💪

## Quick Start

### Option 1: Use as VS Code Extension (Recommended)

1. **Install the extension**:

   - Download the `.vsix` file from releases
   - In VS Code: Extensions → "..." → "Install from VSIX..."
   - Or install from VS Code Marketplace (when published)

2. **Create a `.gym` file** and start coding!

### Option 2: Development Setup

1. **Clone both repositories**:

```bash
git clone https://github.com/thisismayank/gym_lang.git
cd gym_lang
git clone https://github.com/thisismayank/gymlang-lsp.git
```

2. **Install dependencies**:

```bash
cd gymlang-lsp
npm install
```

3. **Test the extension**:
   - Open the `gym_lang` folder in VS Code
   - Press F5 to start debugging
   - Open `gymlang-lsp/demo.gym` to test features

## Project Structure

```
gym_lang/                    # Main GymLang repository
├── gymlang.js              # GymLang interpreter
├── README.md               # GymLang documentation
└── gymlang-lsp/            # LSP extension
    ├── lsp/
    │   └── server.js       # LSP server
    ├── syntaxes/
    │   └── gymlang.tmLanguage.json
    ├── extension.js        # VS Code extension
    ├── package.json        # Extension manifest
    └── README.md           # This documentation
```

## Features Available

- ✅ Syntax highlighting for all GymLang commands
- ✅ Auto-completion with documentation
- ✅ Error diagnostics and validation
- ✅ Hover information for commands
- ✅ Document outline and symbols
- ✅ Run GymLang files from VS Code
- ✅ Gym-themed error messages and wisdom

## Testing

1. Open `gymlang-lsp/demo.gym` in VS Code
2. Try these features:
   - Type `B` and see auto-completion
   - Hover over any command
   - Use Ctrl+Shift+P → "Run GymLang File"
   - Check the Problems panel for diagnostics

## Troubleshooting

- **No syntax highlighting**: Make sure `.gym` files are recognized
- **LSP not working**: Check Node.js version (>=14.0.0)
- **Run command fails**: Ensure `gymlang.js` is in the parent directory

---

💪 **Ready to get swole with code!** 🔥
