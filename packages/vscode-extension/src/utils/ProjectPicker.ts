import * as vscode from 'vscode';

export class ProjectPicker {
    static async pickProject(): Promise<vscode.Uri | undefined> {
        const folders = vscode.workspace.workspaceFolders || [];
        if (folders.length === 0) {
            vscode.window.showErrorMessage('No workspace folders open.');
            return undefined;
        }

        // Filter to folders that contain an ai/ directory
        const candidates = await Promise.all(
            folders.map(async (f) => {
                try {
                    const aiUri = vscode.Uri.joinPath(f.uri, 'ai');
                    await vscode.workspace.fs.stat(aiUri);
                    return f.uri;
                } catch {
                    return undefined;
                }
            })
        );

        const valid = candidates.filter((u): u is vscode.Uri => !!u);
        if (valid.length === 0) {
            // Fall back to first folder; user can still proceed
            return folders[0].uri;
        }
        if (valid.length === 1) {
            return valid[0];
        }

        const pick = await vscode.window.showQuickPick(
            valid.map((u) => ({ label: u.fsPath, description: 'ai/', uri: u })),
            { placeHolder: 'Select the Forge project to open in Forge Studio' }
        );
        return pick?.uri;
    }
}



