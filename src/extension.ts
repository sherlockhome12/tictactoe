import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('tictactoe.start', async () => {
    // Ask who to play against and (if needed) difficulty
    const opponent = await vscode.window.showQuickPick(['Computer', 'Human'], {
      placeHolder: 'Play against…',
      ignoreFocusOut: true,
    }) || 'Computer';

    const difficulty =
      opponent === 'Computer'
        ? (await vscode.window.showQuickPick(['Easy', 'Medium', 'Hard'], {
            placeHolder: 'AI difficulty',
            ignoreFocusOut: true,
          })) || 'Hard'
        : 'Hard';

    // Create a new webview panel
    const panel = vscode.window.createWebviewPanel(
      'tictactoe',
      'TicTacToe',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    // Load HTML
    const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'game.html'));
    panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'ready': {
            // Webview is ready → send init data
            panel.webview.postMessage({
              command: 'init',
              opponent,
              difficulty,
            });
            vscode.window.showInformationMessage(
              opponent === 'Computer'
                ? `Let's begin! Your move (X). Opponent: AI (${difficulty}).`
                : `Let's begin! Your move (X). Opponent: Human.`
            );
            break;
          }
          case 'info':
            vscode.window.showInformationMessage(message.text);
            break;

          case 'play-again': {
            const cb = (response: string | undefined) => {
              if (response === 'Yes') {
                panel.webview.postMessage({ command: 'restart' });
              } else {
                panel.dispose();
              }
            };
            vscode.window.showInformationMessage(message.text, 'Yes', 'No').then(cb);
            break;
          }

          case 'game-over':
            vscode.window.showInformationMessage(message.text);
            break;
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

