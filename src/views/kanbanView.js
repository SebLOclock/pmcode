const vscode = require('vscode');
function getWebviewContent(tasks) {

    const projectNmae = vscode.workspace.name || 'Project';

    function createTaskElement(task) {

        return `<div id="${task.id}" class="task" data-status="${task.status}" data-file="${task.filePath}" data-line="${task.line}" draggable="true" ondragstart="onDragStart(event)">
                    <div class='filename' onclick="openFile('${task.filePath}', ${task.line})">
                        ${task.filePath}
                    </div>
                    ${task.description}
                </div>`;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Kanban</title>
        <style>
            .container {
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
            }
            .column-title {
                font-weight: bold;
                margin-bottom: 10px;
            }
        
            .filename {
                margin-bottom: 10px;
                text-align: right;
                font-size: 0.8em;
                color: var(--vscode-editor-selectionBackground);
            }
            
            .filename:hover {
                color: var(--vscode-editor-selectionForeground);
                text-decoration: underline;
                cursor: pointer;
            }

            .header {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                border-bottom: 1px solid var(--vscode-editor-foreground);
                color: var(--vscode-editor-selectionForeground);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${projectNmae} - Kanban</h1>
        </div>
        
        <div class="container">
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

module.exports = {
    getWebviewContent
};
