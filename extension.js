const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.openKanban', async () => {
        const panel = vscode.window.createWebviewPanel(
            'taskKanban',
            'Tableau Kanban des Tâches',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        await updateKanbanView(panel);

        panel.webview.onDidReceiveMessage(
            async message => {
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
                                vscode.window.showInformationMessage(`Tâche déplacée vers ${message.newStatus}`);

                                // Recharger le tableau Kanban après mise à jour
                                await updateKanbanView(panel);
                            } else {
                                vscode.window.showErrorMessage('Ligne non valide trouvée.');
                            }
                        } else {
                            vscode.window.showErrorMessage('Index de ligne en dehors des limites du document ou non valide.');
                        }
                    } catch (err) {
                        vscode.window.showErrorMessage('Erreur lors de la mise à jour de la tâche : ' + err.message);
                    }
                } else if (message.command === 'openFile') {
                    try {
                        const document = await vscode.workspace.openTextDocument(message.filePath);
                        await vscode.window.showTextDocument(document, {
                            selection: new vscode.Range(message.line, 0, message.line, 0)
                        });
                    } catch (err) {
                        vscode.window.showErrorMessage("Erreur lors de l'ouverture du fichier : "+ err.message);
                    }
                }
            },
            undefined,
            context.subscriptions
        );
    }));
}

async function updateKanbanView(panel) {
    const tasks = await analyzeProjectForTasks();
    panel.webview.html = getWebviewContent(tasks);
}

async function analyzeProjectForTasks() {
    const tasks = [];
    const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx}'); // Adaptez l'extension des fichiers selon les besoins

    for (const file of files) {
        const document = await vscode.workspace.openTextDocument(file);
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const match = line.text.match(/pmcode\.(todo|wip|blocked|done)\s*:\s*(.+)/);
            if (match) {
                tasks.push({
                    id: `task-${file.fsPath}-${i}`,
                    status: match[1],
                    description: match[2].trim(),
                    filePath: file.fsPath,
                    line: i
                });
            }
        }
    }
    return tasks;
}

function getWebviewContent(tasks) {
    function createTaskElement(task) {
        return `<div id="${task.id}" class="task" data-status="${task.status}" data-file="${task.filePath}" data-line="${task.line}" draggable="true" ondragstart="onDragStart(event)">
                    ${task.description}
                    <hr>
                    <div>
                        <button onclick="openFile('${task.filePath}', ${task.line})">Go to task</button>
                    </div>
                </div>`;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Kanban</title>
        <style>
            body {
                display: flex;
                gap: 20px;
                font-family: sans-serif;
            }
            .column {
                flex: 1;
                border-radius: 5px;
                padding: 10px;
                min-height: 300px;
                margin-top: 20px;
                background-color: var(--vscode-editor-selectionBackground);
            }
            .task {
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                margin-bottom: 10px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                cursor: pointer;
            }
            .column-title {
                font-weight: bold;
                margin-bottom: 10px;
            }
            button {
                margin: 2px;
                border: none;
                border-radius: 5px;
                background-color: var(--vscode-editor-selectionBackground);
                color: var(--vscode-editor-selectionForeground);
                padding: 5px;
                font-size: 0.8em;
            }
        </style>
    </head>
    <body>
        <div class="column" id="todo" ondragover="onDragOver(event)" ondrop="onDrop(event, 'todo')">
            <div class="column-title">TODO</div>
            ${tasks.filter(task => task.status === 'todo').map(createTaskElement).join('')}
        </div>
        <div class="column" id="wip" ondragover="onDragOver(event)" ondrop="onDrop(event, 'wip')">
            <div class="column-title">WIP</div>
            ${tasks.filter(task => task.status === 'wip').map(createTaskElement).join('')}
        </div>
        <div class="column" id="blocked" ondragover="onDragOver(event)" ondrop="onDrop(event, 'blocked')">
            <div class="column-title">Blocked</div>
            ${tasks.filter(task => task.status === 'blocked').map(createTaskElement).join('')}
        </div>
        <div class="column" id="done" ondragover="onDragOver(event)" ondrop="onDrop(event, 'done')">
            <div class="column-title">Done</div>
            ${tasks.filter(task => task.status === 'done').map(createTaskElement).join('')}
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function onDragStart(event) {
                event.dataTransfer.setData('text/plain', JSON.stringify({
                    id: event.target.id,
                    filePath: event.target.getAttribute('data-file'),
                    line: event.target.getAttribute('data-line'),
                }));
            }

            function onDragOver(event) {
                event.preventDefault();
            }

            function onDrop(event, newStatus) {
                event.preventDefault();
                const taskData = JSON.parse(event.dataTransfer.getData('text/plain'));

                vscode.postMessage({
                    command: 'moveTask',
                    filePath: taskData.filePath,
                    line: taskData.line,
                    newStatus: newStatus
                });
            }

            function openFile(filePath, line) {
                vscode.postMessage({
                    command: 'openFile',
                    filePath: filePath,
                    line: line
                });
            }
        </script>
    </body>
    </html>`;
}


function deactivate() { }

module.exports = {
    activate,
    deactivate
};
