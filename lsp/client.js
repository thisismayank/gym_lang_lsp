const path = require("path");
const { workspace, ExtensionContext } = require("vscode");

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
