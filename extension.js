const path = require("path");
const {
  workspace,
  ExtensionContext,
  commands,
  window,
  Uri,
} = require("vscode");
const { exec } = require("child_process");

const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

function activate(context) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join("lsp", "server.js"));

  // The debug options for the server
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Options to control the language client
  const clientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "gymlang" }],
    synchronize: {
      // Notify the server about file changes to .gym files in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/*.gym"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "gymlang",
    "GymLang Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // Register the run command
  let runCommand = commands.registerCommand("gymlang.runFile", () => {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage("No active editor found");
      return;
    }

    const document = editor.document;
    if (document.languageId !== "gymlang") {
      window.showErrorMessage("Current file is not a GymLang file");
      return;
    }

    const filePath = document.fileName;

    // Create output channel for GymLang output
    const outputChannel = window.createOutputChannel("GymLang");
    outputChannel.show();
    outputChannel.appendLine(`💪 Running GymLang file: ${filePath}`);
    outputChannel.appendLine("");

    // Run the GymLang file using the interpreter from parent directory
    const gymlangInterpreter = path.join(__dirname, "..", "gymlang.js");
    exec(
      `node "${gymlangInterpreter}" "${filePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          outputChannel.appendLine(`❌ Error: ${error.message}`);
          return;
        }

        if (stderr) {
          outputChannel.appendLine(`⚠️  Warnings: ${stderr}`);
        }

        if (stdout) {
          outputChannel.appendLine(`💪 Output:`);
          outputChannel.appendLine(stdout);
        }

        outputChannel.appendLine("✅ Execution completed!");
      }
    );
  });

  context.subscriptions.push(runCommand);
}

function deactivate() {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

module.exports = {
  activate,
  deactivate,
};
