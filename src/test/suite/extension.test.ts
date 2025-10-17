import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('tictactoe.start command is registered', async () => {
    const cmds = await vscode.commands.getCommands(true);
    assert.ok(cmds.includes('tictactoe.start'), 'Command tictactoe.start not found');
  });

  test('tictactoe.start executes', async () => {
    await vscode.commands.executeCommand('tictactoe.start');
    assert.ok(true, 'Command executed without throwing');
  });
});

