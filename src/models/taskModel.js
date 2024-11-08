const vscode = require('vscode');

async function analyzeProjectForTasks() {
    const tasks = [];
    const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx}');

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

module.exports = {
    analyzeProjectForTasks
};
