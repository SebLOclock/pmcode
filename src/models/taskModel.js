const vscode = require('vscode');

async function analyzeProjectForTasks() {
    const tasks = [];

    const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,html,css,scss,less,json,md,markdown,yaml,yml,xml,php,py,java,c,cpp,h,hpp,cs,vb,fs,fsx,fsi,sql,sh,bat,cmd,ps1,psm1,psd1,pl,.pm,t,r,rb,rake,gemspec,lua,go,dart,swift,m,mm,groovy,kt,kts,clj,cljs,cljc,edn,scala,sc,sbt,gradle,rs,toml}');

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
