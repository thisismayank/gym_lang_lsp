#!/usr/bin/env node

const {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Diagnostic,
  DiagnosticSeverity,
  Range,
  Position,
  Hover,
  MarkupContent,
  MarkupKind,
  SymbolInformation,
  SymbolKind,
  DocumentSymbol,
  Definition,
  Location,
  WorkspaceSymbolParams,
} = require("vscode-languageserver/node");

const { TextDocument } = require("vscode-languageserver-textdocument");
const path = require("path");

// Import GymLang interpreter from parent directory
const gymlangPath = path.join(__dirname, "..", "..", "gymlang.js");
const { tokenizeLine, execLine } = require(gymlangPath);

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// GymLang commands and their documentation
const GYMLANG_COMMANDS = {
  RACK: {
    description: "Declare variable (set starting weight)",
    syntax: "RACK <name> <number>",
    example: "RACK bench 135",
    category: "Variable Declaration",
  },
  BRO: {
    description: "Declare variable with bro energy",
    syntax: "BRO <name> <number>",
    example: "BRO bench 135",
    category: "Variable Declaration",
  },
  LIFT: {
    description: "Add to variable (progressive overload)",
    syntax: "LIFT <name> <number>",
    example: "LIFT bench 10",
    category: "Arithmetic",
  },
  BULK: {
    description: "Add to variable (bulking season)",
    syntax: "BULK <name> <number>",
    example: "BULK bench 10",
    category: "Arithmetic",
  },
  DROP: {
    description: "Subtract from variable (deload)",
    syntax: "DROP <name> <number>",
    example: "DROP bench 5",
    category: "Arithmetic",
  },
  SHRED: {
    description: "Subtract from variable (shredding)",
    syntax: "SHRED <name> <number>",
    example: "SHRED bench 5",
    category: "Arithmetic",
  },
  GAINS: {
    description: "Multiply variable (muscle gains)",
    syntax: "GAINS <name> <number>",
    example: "GAINS bench 1.1",
    category: "Arithmetic",
  },
  CUT: {
    description: "Divide variable (cutting season)",
    syntax: "CUT <name> <number>",
    example: "CUT bench 2",
    category: "Arithmetic",
  },
  REPS: {
    description: "Sum args and print",
    syntax: "REPS <vals...>",
    example: "REPS 10 20 30",
    category: "Output",
  },
  SETS: {
    description: "Multiply args and print",
    syntax: "SETS <vals...>",
    example: "SETS 3 5 2",
    category: "Output",
  },
  FLEX: {
    description: "Print value (show off)",
    syntax: 'FLEX <value|name|"str">',
    example: "FLEX bench",
    category: "Output",
  },
  PUMP: {
    description: "Max of args (pump it up!)",
    syntax: "PUMP <vals...>",
    example: "PUMP bench squat",
    category: "Math",
  },
  GRIND: {
    description: "Min of args (grind mode)",
    syntax: "GRIND <vals...>",
    example: "GRIND bench squat",
    category: "Math",
  },
  YOLO: {
    description: "Random value (you only live once)",
    syntax: "YOLO <name>",
    example: "YOLO bench",
    category: "Special",
  },
  SWOLE: {
    description: "Square the value (get swole)",
    syntax: "SWOLE <name>",
    example: "SWOLE bench",
    category: "Math",
  },
  BEAST: {
    description: "Cube the value (beast mode)",
    syntax: "BEAST <name>",
    example: "BEAST bench",
    category: "Math",
  },
  SAVAGE: {
    description: "Factorial (savage mode)",
    syntax: "SAVAGE <name>",
    example: "SAVAGE bench",
    category: "Math",
  },
  LEGDAY: {
    description: "Skip leg day (set to 0)",
    syntax: "LEGDAY <name>",
    example: "LEGDAY squat",
    category: "Special",
  },
  CARDIO: {
    description: "Cardio kills gains (subtract 50%)",
    syntax: "CARDIO <name>",
    example: "CARDIO bench",
    category: "Special",
  },
  PROTEIN: {
    description: "Double the gains (protein shake)",
    syntax: "PROTEIN <name>",
    example: "PROTEIN bench",
    category: "Special",
  },
  CREATINE: {
    description: "Triple the gains (creatine loading)",
    syntax: "CREATINE <name>",
    example: "CREATINE bench",
    category: "Special",
  },
  STEROIDS: {
    description: "10x the gains (not recommended)",
    syntax: "STEROIDS <name>",
    example: "STEROIDS bench",
    category: "Special",
  },
  MOTIVATION: {
    description: "Print with extra enthusiasm",
    syntax: 'MOTIVATION <"str">',
    example: 'MOTIVATION "No pain, no gain!"',
    category: "Output",
  },
  NOEXCUSES: {
    description: "Absolute value (no excuses)",
    syntax: "NOEXCUSES <name>",
    example: "NOEXCUSES bench",
    category: "Math",
  },
  HUSTLE: {
    description: "Round up (hustle harder)",
    syntax: "HUSTLE <name>",
    example: "HUSTLE bench",
    category: "Math",
  },
  GRINDMODE: {
    description: "Round down (grind mode)",
    syntax: "GRINDMODE <name>",
    example: "GRINDMODE bench",
    category: "Math",
  },
};

// Gym bro wisdom and motivational quotes
const GYM_WISDOM = [
  "💪 Pain is temporary, gains are forever!",
  "🔥 No excuses, only results!",
  "🏋️‍♂️ Trust the process, bro!",
  "💪 Consistency is key to gains!",
  "🔥 Push your limits, break your records!",
  "💪 Every rep counts!",
  "🔥 Form over weight, always!",
  "💪 Rest days are gains days too!",
  "🔥 You're stronger than you think!",
  "💪 The only bad workout is the one that didn't happen!",
];

connection.onInitialize((params) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [" ", "\t"],
      },
      // Tell the client that this server supports hover.
      hoverProvider: true,
      // Tell the client that this server supports document symbols.
      documentSymbolProvider: true,
      // Tell the client that this server supports workspace symbols.
      workspaceSymbolProvider: true,
      // Tell the client that this server supports definition.
      definitionProvider: true,
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log("Workspace folder change event received.");
    });
  }
});

// The example settings
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = change.settings.gymlang || defaultSettings;
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource) {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "gymlang",
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument) {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);

  // The validator creates diagnostics for all uppercase words length 2 and more
  const text = textDocument.getText();
  const diagnostics = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    try {
      const tokens = tokenizeLine(line);
      if (tokens.length === 0) continue; // Empty line or comment

      // Check for unknown commands
      if (tokens[0].type === "WORD") {
        const command = tokens[0].value.toUpperCase();
        if (!GYMLANG_COMMANDS[command]) {
          const range = Range.create(
            Position.create(i, 0),
            Position.create(i, tokens[0].value.length)
          );
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: range,
            message: `Unknown command "${command}". Available commands: ${Object.keys(
              GYMLANG_COMMANDS
            ).join(", ")}`,
            source: "gymlang",
          });
        }
      }

      // Check for syntax errors
      try {
        execLine(tokens, { vars: {} });
      } catch (error) {
        const range = Range.create(
          Position.create(i, 0),
          Position.create(i, line.length)
        );
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: range,
          message: error.message,
          source: "gymlang",
        });
      }
    } catch (error) {
      const range = Range.create(
        Position.create(i, 0),
        Position.create(i, line.length)
      );
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: range,
        message: error.message,
        source: "gymlang",
      });
    }
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log("We received a file change event");
});

// This handler provides the initial list of completion items.
connection.onCompletion((_textDocumentPosition) => {
  const items = [];

  // Add all GymLang commands
  Object.entries(GYMLANG_COMMANDS).forEach(([command, info]) => {
    const item = CompletionItem.create(command);
    item.kind = CompletionItemKind.Function;
    item.detail = info.syntax;
    item.documentation = {
      kind: MarkupKind.Markdown,
      value: `**${info.description}**\n\n**Syntax:** \`${info.syntax}\`\n\n**Example:** \`${info.example}\`\n\n**Category:** ${info.category}`,
    };
    items.push(item);
  });

  // Add some common variable names
  const commonVars = [
    "bench",
    "squat",
    "deadlift",
    "weight",
    "reps",
    "sets",
    "gains",
    "strength",
  ];
  commonVars.forEach((varName) => {
    const item = CompletionItem.create(varName);
    item.kind = CompletionItemKind.Variable;
    item.detail = "Variable name";
    item.documentation = {
      kind: MarkupKind.Markdown,
      value: `Common variable name for ${varName}`,
    };
    items.push(item);
  });

  // Add motivational quotes
  GYM_WISDOM.forEach((wisdom, index) => {
    const item = CompletionItem.create(`wisdom_${index + 1}`);
    item.kind = CompletionItemKind.Text;
    item.detail = "Gym wisdom";
    item.documentation = {
      kind: MarkupKind.Markdown,
      value: wisdom,
    };
    items.push(item);
  });

  return items;
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item) => {
  if (item.kind === CompletionItemKind.Function) {
    const command = item.label;
    const info = GYMLANG_COMMANDS[command];
    if (info) {
      item.documentation = {
        kind: MarkupKind.Markdown,
        value: `**${info.description}**\n\n**Syntax:** \`${info.syntax}\`\n\n**Example:** \`${info.example}\`\n\n**Category:** ${info.category}`,
      };
    }
  }
  return item;
});

// This handler provides hover information.
connection.onHover((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const position = params.position;
  const text = document.getText();
  const lines = text.split(/\r?\n/);
  const line = lines[position.line];

  if (!line) return null;

  // Find the word at the cursor position
  const wordRange = getWordRangeAtPosition(line, position.character);
  if (!wordRange) return null;

  const word = line.substring(wordRange.start, wordRange.end);
  const upperWord = word.toUpperCase();

  // Check if it's a command
  if (GYMLANG_COMMANDS[upperWord]) {
    const info = GYMLANG_COMMANDS[upperWord];
    const range = Range.create(
      Position.create(position.line, wordRange.start),
      Position.create(position.line, wordRange.end)
    );

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**${upperWord}** - ${info.description}\n\n**Syntax:** \`${info.syntax}\`\n\n**Example:** \`${info.example}\`\n\n**Category:** ${info.category}`,
      },
      range: range,
    };
  }

  // Check if it's a number
  if (/^\d+(\.\d+)?$/.test(word)) {
    const range = Range.create(
      Position.create(position.line, wordRange.start),
      Position.create(position.line, wordRange.end)
    );

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**Number:** ${word}\n\nUse this value in your gym calculations! 💪`,
      },
      range: range,
    };
  }

  // Check if it's a string
  if (word.startsWith('"') && word.endsWith('"')) {
    const range = Range.create(
      Position.create(position.line, wordRange.start),
      Position.create(position.line, wordRange.end)
    );

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `**String:** ${word}\n\nPerfect for motivational messages! 🔥`,
      },
      range: range,
    };
  }

  // Assume it's a variable
  const range = Range.create(
    Position.create(position.line, wordRange.start),
    Position.create(position.line, wordRange.end)
  );

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**Variable:** ${word}\n\nStore your gains in this variable! 💪`,
    },
    range: range,
  };
});

// This handler provides document symbols.
connection.onDocumentSymbol((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  const symbols = [];
  const text = document.getText();
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    try {
      const tokens = tokenizeLine(line);
      if (tokens.length === 0) continue;

      if (tokens[0].type === "WORD") {
        const command = tokens[0].value.toUpperCase();
        const info = GYMLANG_COMMANDS[command];

        if (info) {
          const range = Range.create(
            Position.create(i, 0),
            Position.create(i, line.length)
          );

          const symbol = DocumentSymbol.create(
            command,
            info.description,
            getSymbolKind(command),
            range,
            range
          );

          symbols.push(symbol);
        }
      }
    } catch (error) {
      // Skip lines with errors
    }
  }

  return symbols;
});

// This handler provides workspace symbols.
connection.onWorkspaceSymbol((params) => {
  const symbols = [];

  documents.all().forEach((document) => {
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      try {
        const tokens = tokenizeLine(line);
        if (tokens.length === 0) continue;

        if (tokens[0].type === "WORD") {
          const command = tokens[0].value.toUpperCase();
          const info = GYMLANG_COMMANDS[command];

          if (
            info &&
            command.toLowerCase().includes(params.query.toLowerCase())
          ) {
            const range = Range.create(
              Position.create(i, 0),
              Position.create(i, line.length)
            );

            const symbol = SymbolInformation.create(
              command,
              getSymbolKind(command),
              range,
              document.uri
            );

            symbols.push(symbol);
          }
        }
      } catch (error) {
        // Skip lines with errors
      }
    }
  });

  return symbols;
});

// This handler provides definition.
connection.onDefinition((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const position = params.position;
  const text = document.getText();
  const lines = text.split(/\r?\n/);
  const line = lines[position.line];

  if (!line) return null;

  const wordRange = getWordRangeAtPosition(line, position.character);
  if (!wordRange) return null;

  const word = line.substring(wordRange.start, wordRange.end);
  const upperWord = word.toUpperCase();

  // For commands, find their first occurrence
  if (GYMLANG_COMMANDS[upperWord]) {
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      try {
        const tokens = tokenizeLine(currentLine);
        if (
          tokens.length > 0 &&
          tokens[0].type === "WORD" &&
          tokens[0].value.toUpperCase() === upperWord
        ) {
          const range = Range.create(
            Position.create(i, 0),
            Position.create(i, currentLine.length)
          );
          return Location.create(document.uri, range);
        }
      } catch (error) {
        // Skip lines with errors
      }
    }
  }

  return null;
});

// Helper function to get word range at position
function getWordRangeAtPosition(line, character) {
  const wordRegex = /[A-Za-z0-9_]+/g;
  let match;

  while ((match = wordRegex.exec(line)) !== null) {
    if (
      character >= match.index &&
      character <= match.index + match[0].length
    ) {
      return {
        start: match.index,
        end: match.index + match[0].length,
      };
    }
  }

  return null;
}

// Helper function to get symbol kind
function getSymbolKind(command) {
  const arithmeticCommands = [
    "LIFT",
    "BULK",
    "DROP",
    "SHRED",
    "GAINS",
    "CUT",
    "REPS",
    "SETS",
  ];
  const mathCommands = [
    "PUMP",
    "GRIND",
    "SWOLE",
    "BEAST",
    "SAVAGE",
    "NOEXCUSES",
    "HUSTLE",
    "GRINDMODE",
  ];
  const specialCommands = [
    "YOLO",
    "LEGDAY",
    "CARDIO",
    "PROTEIN",
    "CREATINE",
    "STEROIDS",
  ];
  const outputCommands = ["FLEX", "MOTIVATION"];
  const declarationCommands = ["RACK", "BRO"];

  if (arithmeticCommands.includes(command)) return SymbolKind.Operator;
  if (mathCommands.includes(command)) return SymbolKind.Function;
  if (specialCommands.includes(command)) return SymbolKind.Event;
  if (outputCommands.includes(command)) return SymbolKind.Method;
  if (declarationCommands.includes(command)) return SymbolKind.Variable;

  return SymbolKind.Function;
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
