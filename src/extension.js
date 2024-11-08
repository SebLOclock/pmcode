const vscode = require('vscode');
const { openKanban } = require('./controllers/kanbanController');

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openKanban', async () => {
        const panel = vscode.window.createWebviewPanel(
            'taskKanban',
            'Tableau Kanban des Tâches',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        await openKanban(panel);
    }));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
