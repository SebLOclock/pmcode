const vscode = require('vscode');
const { analyzeProjectForTasks } = require('../models/taskModel');
const { getWebviewContent } = require('../views/kanbanView');

async function openKanban(panel) {
    const tasks = await analyzeProjectForTasks();
    panel.webview.html = getWebviewContent(tasks);

    panel.webview.onDidReceiveMessage(
        async message => {

            const allowedCommands = ['moveTask', 'openFile'];
            if (!allowedCommands.includes(message.command)) {
                vscode.window.showErrorMessage('Invalid command received.');
                return;
            }
            
            if (message.command === 'moveTask') {
                try {
                    const document = await vscode.workspace.openTextDocument(message.filePath);
                    const intLine = Number.parseInt(message.line);
                    if (Number.isInteger(intLine) && intLine >= 0 && intLine < document.lineCount) {
                        const edit = new vscode.WorkspaceEdit();
                        const line = document.lineAt(intLine);

                        if (line) {
                            const updatedLine = line.text.replace(/pmcode\.(todo|wip|blocked|done)/, `pmcode.${message.newStatus}`);
                            edit.replace(document.uri, line.range, updatedLine);

                            await vscode.workspace.applyEdit(edit);
                            await document.save();
                            vscode.window.showInformationMessage(`Task moved to ${message.newStatus}`);

                            // Refresh the Kanban board after the update
                            await openKanban(panel);
                        } else {
                            vscode.window.showErrorMessage('Invalid line found.');
                        }
                    } else {
                        vscode.window.showErrorMessage('Line index out of range or invalid.');
                    }
                } catch (err) {
                    vscode.window.showErrorMessage('Error updating the task: ' + err.message);
                }
            } else if (message.command === 'openFile') {
                try {
                    const document = await vscode.workspace.openTextDocument(message.filePath);
                    await vscode.window.showTextDocument(document, {
                        selection: new vscode.Range(message.line, 0, message.line, 0)
                    });
                } catch (err) {
                    vscode.window.showErrorMessage('Error opening the file: ' + err.message);
                }
            }
        }
    );
}

module.exports = {
    openKanban
};
