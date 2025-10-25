import * as vscode from 'vscode';
import * as path from 'path';
import { FileParser } from '../utils/FileParser';
import { PromptGenerator } from '../utils/PromptGenerator';
import { GitUtils } from '../utils/GitUtils';

interface ActiveSession {
    sessionId: string;
    problemStatement: string;
    startTime: string;
    changedFiles: string[];
}

export class GlamStudioPanel {
    public static currentPanel: GlamStudioPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _projectUri: vscode.Uri;
    private readonly _output: vscode.OutputChannel;
    private _disposables: vscode.Disposable[] = [];
    private _activeSession: ActiveSession | null = null;
    private _fileWatcher: vscode.FileSystemWatcher | undefined;
    private _structureWatcher: vscode.FileSystemWatcher | undefined;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, projectUri: vscode.Uri, output: vscode.OutputChannel) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._projectUri = projectUri;
        this._output = output;

        this._update();
        
        // Load active session from disk (filesystem is source of truth)
        this._loadActiveSessionFromDisk().catch(err => {
            console.error('Failed to load active session from disk:', err);
        });
        
        // Start persistent structure watcher
        this._startStructureWatcher();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'getInitialState': {
                    this._panel.webview.postMessage({ type: 'initialState', data: await this._getInitialState() });
                    break;
                }
                case 'getCounts': {
                    const counts = await this._getCounts();
                    this._panel.webview.postMessage({ type: 'counts', data: counts });
                    break;
                }
                case 'getActiveSession': {
                    // Always reload from disk to ensure filesystem is source of truth
                    await this._loadActiveSessionFromDisk();
                    this._panel.webview.postMessage({ type: 'activeSession', data: this._activeSession });
                    break;
                }
                case 'listSessions': {
                    const sessions = await this._listSessions();
                    this._panel.webview.postMessage({ type: 'sessions', data: sessions });
                    break;
                }
                case 'createSession': {
                    await this._createSession(message.problemStatement);
                    break;
                }
                case 'stopSession': {
                    await this._stopSession();
                    break;
                }
                case 'distillSession': {
                    await this._distillSession(message.sessionId);
                    break;
                }
                case 'switchProject': {
                    if (message.data?.projectPath) {
                        this._projectUri = vscode.Uri.file(message.data.projectPath);
                        // Load active session for the new project
                        await this._loadActiveSessionFromDisk();
                        // Restart the structure watcher for the new project
                        this._startStructureWatcher();
                        this._panel.webview.postMessage({ type: 'initialState', data: await this._getInitialState() });
                        const counts = await this._getCounts();
                        this._panel.webview.postMessage({ type: 'counts', data: counts });
                        this._panel.webview.postMessage({ type: 'activeSession', data: this._activeSession });
                    }
                    break;
                }
                case 'getFolderTree': {
                    const tree = await this._getFolderTree(message.category);
                    this._panel.webview.postMessage({ type: 'folderTree', data: tree, category: message.category });
                    break;
                }
                case 'getFolderContents': {
                    const contents = await this._getFolderContents(message.folderPath, message.category);
                    this._panel.webview.postMessage({ type: 'folderContents', data: contents });
                    break;
                }
                case 'getFileContent': {
                    const content = await this._getFileContent(message.filePath);
                    this._panel.webview.postMessage({ type: 'fileContent', data: content });
                    break;
                }
                case 'saveFileContent': {
                    await this._saveFileContent(message.filePath, message.frontmatter, message.content);
                    break;
                }
                case 'createFolder': {
                    await this._createFolder(message.folderPath);
                    break;
                }
                case 'createFile': {
                    await this._createFile(message.folderPath, message.category, message.title);
                    break;
                }
                case 'promptCreateFolder': {
                    await this._promptCreateFolder(message.folderPath, message.category);
                    break;
                }
                case 'promptCreateFile': {
                    await this._promptCreateFile(message.folderPath, message.category);
                    break;
                }
                default:
                    break;
            }
        }, null, this._disposables);
    }

    public static render(extensionUri: vscode.Uri, projectUri: vscode.Uri, output: vscode.OutputChannel) {
        if (GlamStudioPanel.currentPanel) {
            GlamStudioPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'glamStudio',
            'Glam Studio',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                ],
            }
        );

        GlamStudioPanel.currentPanel = new GlamStudioPanel(panel, extensionUri, projectUri, output);
    }

    public dispose() {
        GlamStudioPanel.currentPanel = undefined;
        this._panel.dispose();
        if (this._fileWatcher) {
            this._fileWatcher.dispose();
        }
        if (this._structureWatcher) {
            this._structureWatcher.dispose();
        }
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
        }
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _getInitialState(): Promise<{ projectPath: string }> {
        return { projectPath: this._projectUri.fsPath };
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'studio', 'main.js'));
        const nonce = getNonce();
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} blob: data:; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${webview.cspSource}; font-src ${webview.cspSource};" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Glam Studio</title>
  <style>
    /* Base styles */
    html, body, #root { height: 100%; margin: 0; padding: 0; }
    body { 
      font-family: var(--vscode-font-family); 
      color: var(--vscode-editor-foreground); 
      background: var(--vscode-editor-background);
      font-size: 13px;
      line-height: 1.5;
    }
    
    /* Layout */
    .container { display: flex; height: 100%; }
    .sidebar { 
      width: 220px; 
      border-right: 1px solid var(--vscode-panel-border);
      background: var(--vscode-sideBar-background);
    }
    .main-content { flex: 1; overflow: auto; }
    
    /* Tree view styles */
    .tree-view { padding: 8px 0; }
    .tree-folder { 
      display: flex; 
      align-items: center; 
      padding: 4px 8px; 
      cursor: pointer;
      user-select: none;
    }
    .tree-folder:hover { background: var(--vscode-list-hoverBackground); }
    .tree-folder.selected { background: var(--vscode-list-activeSelectionBackground); }
    .tree-chevron {
      display: inline-block;
      width: 16px;
      text-align: center;
      font-size: 10px;
      transition: transform 0.1s;
    }
    .tree-chevron.expanded { transform: rotate(90deg); }
    .tree-label { margin-left: 4px; }
    .tree-children { padding-left: 16px; }
    
    /* Content sections */
    .content-section {
      padding: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .content-section:last-child { border-bottom: none; }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    
    /* File list */
    .file-list-item {
      padding: 12px;
      margin-bottom: 8px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.1s;
    }
    .file-list-item:hover {
      background: var(--vscode-list-hoverBackground);
      border-color: var(--vscode-focusBorder);
    }
    .file-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .file-meta {
      font-size: 11px;
      opacity: 0.7;
    }
    
    /* Form styles */
    .form-group {
      margin-bottom: 16px;
    }
    .form-label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .form-input,
    .form-textarea {
      width: 100%;
      padding: 6px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      font-family: var(--vscode-font-family);
      font-size: 13px;
      box-sizing: border-box;
    }
    .form-input:focus,
    .form-textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }
    .form-input:read-only,
    .form-textarea:read-only {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .form-textarea {
      resize: vertical;
      min-height: 200px;
      font-family: var(--vscode-editor-font-family);
    }
    
    /* Button styles */
    .btn {
      padding: 6px 14px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 13px;
      font-family: var(--vscode-font-family);
      transition: opacity 0.1s;
    }
    .btn:hover { opacity: 0.9; }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .btn-group {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    /* Card styles */
    .card {
      padding: 16px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin-bottom: 16px;
    }
    
    /* Split view */
    .split-view {
      display: flex;
      height: 100%;
    }
    .split-sidebar {
      width: 220px;
      border-right: 1px solid var(--vscode-panel-border);
      overflow: auto;
    }
    .split-content {
      flex: 1;
      overflow: auto;
    }
    
    /* Toolbar */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
      background: var(--vscode-editor-background);
    }
    
    /* Empty state */
    .empty-state {
      padding: 48px 24px;
      text-align: center;
      opacity: 0.7;
    }
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    /* Alert styles */
    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .alert-info {
      background: var(--vscode-inputValidation-infoBackground);
      border: 1px solid var(--vscode-inputValidation-infoBorder);
    }
    .alert-warning {
      background: var(--vscode-inputValidation-warningBackground);
      border: 1px solid var(--vscode-inputValidation-warningBorder);
    }
    
    /* Utility classes */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-8 { gap: 8px; }
    .gap-16 { gap: 16px; }
    .mb-8 { margin-bottom: 8px; }
    .mb-16 { margin-bottom: 16px; }
    .mt-16 { margin-top: 16px; }
    .p-16 { padding: 16px; }
    .text-sm { font-size: 12px; }
    .text-xs { font-size: 11px; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .opacity-70 { opacity: 0.7; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private async _getCounts(): Promise<{ sessions: number; features: number; specs: number; models: number; actors: number; contexts: number; stories: number; tasks: number; }>
    {
        const sessions = await this._countRecursive(['ai', 'sessions'], (name) => name.endsWith('.session.md'));
        const features = await this._countRecursive(['ai', 'features'], (name) => name.endsWith('.feature.md'));
        const specs = await this._countRecursive(['ai', 'specs'], (name) => name.endsWith('.spec.md'));
        const models = await this._countRecursive(['ai', 'models'], (name) => name.endsWith('.model.md'));
        const actors = await this._countRecursive(['ai', 'actors'], (name) => name.endsWith('.actor.md'));
        const contexts = await this._countRecursive(['ai', 'contexts'], (name) => name.endsWith('.context.md'));
        const stories = await this._countRecursive(['ai', 'tickets'], (name) => name.endsWith('.story.md'));
        const tasks = await this._countRecursive(['ai', 'tickets'], (name) => name.endsWith('.task.md'));
        return { sessions, features, specs, models, actors, contexts, stories, tasks };
    }

    private async _countRecursive(pathSegs: string[], predicate: (name: string) => boolean): Promise<number> {
        const root = vscode.Uri.joinPath(this._projectUri, ...pathSegs);
        return this._walkCount(root, predicate);
    }

    private async _walkCount(uri: vscode.Uri, predicate: (name: string) => boolean): Promise<number> {
        try {
            const entries = await vscode.workspace.fs.readDirectory(uri);
            let count = 0;
            for (const [name, type] of entries) {
                const child = vscode.Uri.joinPath(uri, name);
                if (type === vscode.FileType.File) {
                    if (predicate(name)) count += 1;
                } else if (type === vscode.FileType.Directory) {
                    count += await this._walkCount(child, predicate);
                }
            }
            return count;
        } catch {
            return 0;
        }
    }

    private async _listSessions(): Promise<any[]> {
        const sessionsDir = vscode.Uri.joinPath(this._projectUri, 'ai', 'sessions');
        const sessions: any[] = [];

        try {
            const files = await this._listFilesRecursive(sessionsDir, '.session.md');
            
            for (const file of files) {
                const content = await FileParser.readFile(file.fsPath);
                const parsed = FileParser.parseFrontmatter(content);
                const sessionId = parsed.frontmatter.session_id || path.basename(file.fsPath, '.session.md');
                
                sessions.push({
                    sessionId,
                    filePath: file.fsPath,
                    frontmatter: parsed.frontmatter
                });
            }
        } catch (error) {
            // Sessions directory doesn't exist yet
        }

        // Sort by start_time descending
        sessions.sort((a, b) => {
            const timeA = a.frontmatter?.start_time || '';
            const timeB = b.frontmatter?.start_time || '';
            return timeB.localeCompare(timeA);
        });

        return sessions;
    }

    /**
     * Load active session from disk by scanning for session files with status: "active"
     * This makes the filesystem the source of truth for session state
     */
    private async _loadActiveSessionFromDisk(): Promise<void> {
        const sessionsDir = vscode.Uri.joinPath(this._projectUri, 'ai', 'sessions');
        
        try {
            const files = await this._listFilesRecursive(sessionsDir, '.session.md');
            
            for (const file of files) {
                const content = await FileParser.readFile(file.fsPath);
                const parsed = FileParser.parseFrontmatter(content);
                
                // Check if this session is active
                if (parsed.frontmatter.status === 'active') {
                    const sessionId = parsed.frontmatter.session_id || path.basename(file.fsPath, '.session.md');
                    
                    // Load this as the active session
                    this._activeSession = {
                        sessionId,
                        problemStatement: parsed.frontmatter.problem_statement || '',
                        startTime: parsed.frontmatter.start_time || new Date().toISOString(),
                        changedFiles: Array.isArray(parsed.frontmatter.changed_files) ? parsed.frontmatter.changed_files : []
                    };
                    
                    // Start file watcher for this session
                    this._startFileWatcher();
                    
                    // Only take the first active session found
                    // If multiple exist, we take the first one (could log a warning)
                    return;
                }
            }
            
            // No active session found - clear any in-memory state
            this._activeSession = null;
            if (this._fileWatcher) {
                this._fileWatcher.dispose();
                this._fileWatcher = undefined;
            }
        } catch (error) {
            // Sessions directory doesn't exist yet or other error
            this._activeSession = null;
        }
    }

    private async _listFilesRecursive(dir: vscode.Uri, extension: string): Promise<vscode.Uri[]> {
        const files: vscode.Uri[] = [];
        
        try {
            const entries = await vscode.workspace.fs.readDirectory(dir);
            
            for (const [name, type] of entries) {
                const fullPath = vscode.Uri.joinPath(dir, name);
                if (type === vscode.FileType.File && name.endsWith(extension)) {
                    files.push(fullPath);
                } else if (type === vscode.FileType.Directory) {
                    files.push(...await this._listFilesRecursive(fullPath, extension));
                }
            }
        } catch {
            // Directory doesn't exist
        }
        
        return files;
    }

    private async _createSession(problemStatement: string) {
        const sessionId = this._generateId(problemStatement);
        const startTime = new Date().toISOString();
        
        // Ensure sessions directory exists
        const sessionsDir = vscode.Uri.joinPath(this._projectUri, 'ai', 'sessions');
        try {
            await vscode.workspace.fs.createDirectory(sessionsDir);
        } catch {
            // Directory already exists
        }

        // Try to get current git commit for precise diff tracking
        let startCommit: string | null = null;
        const isGitRepo = await GitUtils.isGitRepository(this._projectUri.fsPath);
        if (isGitRepo) {
            startCommit = await GitUtils.getCurrentCommit(this._projectUri.fsPath);
        }

        // Create session file
        const sessionFile = vscode.Uri.joinPath(sessionsDir, `${sessionId}.session.md`);
        const frontmatter: any = {
            session_id: sessionId,
            start_time: startTime,
            end_time: null,
            status: 'active',
            problem_statement: problemStatement,
            changed_files: []
        };

        // Add start_commit if git is available
        if (startCommit) {
            frontmatter.start_commit = startCommit;
        }

        const content = `## Problem Statement

${problemStatement}

## Goals

(To be filled during the session)

## Approach

(To be filled during the session)

## Key Decisions

(Track important decisions made during the session)

## Notes

(Additional context, concerns, or considerations)
`;

        const text = FileParser.stringifyFrontmatter(frontmatter, content);
        await vscode.workspace.fs.writeFile(sessionFile, Buffer.from(text, 'utf-8'));

        // Set as active session
        this._activeSession = {
            sessionId,
            problemStatement,
            startTime,
            changedFiles: []
        };

        // Start file watcher for ai directory
        this._startFileWatcher();

        // Notify webview
        this._panel.webview.postMessage({ type: 'sessionCreated', data: this._activeSession });

        vscode.window.showInformationMessage(`Design session "${sessionId}" started!`);
    }

    private _startFileWatcher() {
        if (this._fileWatcher) {
            this._fileWatcher.dispose();
        }

        const pattern = new vscode.RelativePattern(
            path.join(this._projectUri.fsPath, 'ai'),
            '**/*.{feature.md,spec.md,model.md,context.md}'
        );

        this._fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        this._fileWatcher.onDidChange(uri => this._onFileChanged(uri));
        this._fileWatcher.onDidCreate(uri => this._onFileChanged(uri));

        this._disposables.push(this._fileWatcher);
    }

    private _startStructureWatcher() {
        if (this._structureWatcher) {
            this._structureWatcher.dispose();
            // Remove from disposables if it was there
            const index = this._disposables.indexOf(this._structureWatcher);
            if (index > -1) {
                this._disposables.splice(index, 1);
            }
        }

        // Watch the entire ai directory for any file or directory changes
        const aiPath = vscode.Uri.joinPath(this._projectUri, 'ai');
        const pattern = new vscode.RelativePattern(aiPath, '**/*');

        console.log(`[Glam] Setting up structure watcher for: ${aiPath.fsPath}`);
        
        this._structureWatcher = vscode.workspace.createFileSystemWatcher(pattern);

        // Handle file/directory creation
        this._structureWatcher.onDidCreate(uri => {
            console.log(`[Glam] File/folder created: ${uri.fsPath}`);
            this._onStructureChanged();
        });

        // Handle file/directory deletion
        this._structureWatcher.onDidDelete(uri => {
            console.log(`[Glam] File/folder deleted: ${uri.fsPath}`);
            this._onStructureChanged();
        });

        // Handle file changes (for counts)
        this._structureWatcher.onDidChange(uri => {
            // Only refresh if it's a Glam file
            if (this._isGlamFile(uri.fsPath)) {
                console.log(`[Glam] Glam file changed: ${uri.fsPath}`);
                this._onStructureChanged();
            }
        });

        this._disposables.push(this._structureWatcher);
    }

    private _isGlamFile(filePath: string): boolean {
        return filePath.endsWith('.session.md') ||
               filePath.endsWith('.feature.md') ||
               filePath.endsWith('.spec.md') ||
               filePath.endsWith('.model.md') ||
               filePath.endsWith('.context.md') ||
               filePath.endsWith('.story.md') ||
               filePath.endsWith('.task.md');
    }

    private async _onStructureChanged() {
        // Debounce rapid changes
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
        }

        this._refreshTimeout = setTimeout(async () => {
            console.log('[Glam] Structure changed - refreshing UI');
            // Refresh counts
            const counts = await this._getCounts();
            this._panel.webview.postMessage({ type: 'counts', data: counts });

            // Notify webview that structure changed so it can refresh trees
            this._panel.webview.postMessage({ type: 'structureChanged' });
        }, 300);
    }

    private _refreshTimeout: NodeJS.Timeout | undefined;

    private _onFileChanged(uri: vscode.Uri) {
        if (!this._activeSession) {
            return;
        }

        const relativePath = path.relative(this._projectUri.fsPath, uri.fsPath);
        
        if (!this._activeSession.changedFiles.includes(relativePath)) {
            this._activeSession.changedFiles.push(relativePath);
            
            // Update the session file
            this._updateSessionFile().catch(err => {
                console.error('Failed to update session file:', err);
            });

            // Notify webview
            this._panel.webview.postMessage({ type: 'activeSession', data: this._activeSession });
        }
    }

    private async _updateSessionFile() {
        if (!this._activeSession) {
            return;
        }

        const sessionFile = vscode.Uri.joinPath(
            this._projectUri, 
            'ai', 
            'sessions', 
            `${this._activeSession.sessionId}.session.md`
        );

        try {
            const content = await FileParser.readFile(sessionFile.fsPath);
            const parsed = FileParser.parseFrontmatter(content);
            
            parsed.frontmatter.changed_files = this._activeSession.changedFiles;
            
            const text = FileParser.stringifyFrontmatter(parsed.frontmatter, parsed.content);
            await vscode.workspace.fs.writeFile(sessionFile, Buffer.from(text, 'utf-8'));
        } catch (error) {
            console.error('Failed to update session file:', error);
        }
    }

    private async _stopSession() {
        if (!this._activeSession) {
            return;
        }

        const sessionId = this._activeSession.sessionId;
        const endTime = new Date().toISOString();

        // Update session file
        const sessionFile = vscode.Uri.joinPath(
            this._projectUri, 
            'ai', 
            'sessions', 
            `${sessionId}.session.md`
        );

        try {
            const content = await FileParser.readFile(sessionFile.fsPath);
            const parsed = FileParser.parseFrontmatter(content);
            
            parsed.frontmatter.end_time = endTime;
            parsed.frontmatter.status = 'completed';
            parsed.frontmatter.changed_files = this._activeSession.changedFiles;
            
            const text = FileParser.stringifyFrontmatter(parsed.frontmatter, parsed.content);
            await vscode.workspace.fs.writeFile(sessionFile, Buffer.from(text, 'utf-8'));

            // Stop file watcher
            if (this._fileWatcher) {
                this._fileWatcher.dispose();
                this._fileWatcher = undefined;
            }

            // Clear active session
            this._activeSession = null;

            // Notify webview
            this._panel.webview.postMessage({ type: 'sessionStopped' });

            vscode.window.showInformationMessage(`Design session "${sessionId}" completed!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop session: ${error}`);
        }
    }

    private async _distillSession(sessionId: string) {
        const sessionFile = vscode.Uri.joinPath(
            this._projectUri,
            'ai',
            'sessions',
            `${sessionId}.session.md`
        );

        try {
            const prompt = await PromptGenerator.generateDistillSessionPrompt(sessionFile);

            this._output.clear();
            this._output.appendLine('='.repeat(80));
            this._output.appendLine('GLAM: Distill Session into Stories and Tasks');
            this._output.appendLine('='.repeat(80));
            this._output.appendLine('');
            this._output.appendLine('Copy the prompt below and paste it into your Cursor Agent window:');
            this._output.appendLine('');
            this._output.appendLine('-'.repeat(80));
            this._output.appendLine(prompt);
            this._output.appendLine('-'.repeat(80));
            this._output.show(true);

            vscode.window.showInformationMessage(
                'Distill session prompt generated! Check the Glam output panel.'
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate distill prompt: ${error}`);
        }
    }

    private _generateId(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    private async _getFolderTree(category: string): Promise<any> {
        const basePath = this._getCategoryPath(category);
        const fileExtension = this._getCategoryExtension(category);
        return await this._buildFolderTree(basePath, fileExtension);
    }

    private async _buildFolderTree(dirUri: vscode.Uri, fileExtension: string): Promise<any> {
        try {
            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            const folders: any[] = [];

            for (const [name, type] of entries) {
                if (type === vscode.FileType.Directory && name !== 'node_modules' && !name.startsWith('.')) {
                    const childUri = vscode.Uri.joinPath(dirUri, name);
                    const children = await this._buildFolderTree(childUri, fileExtension);
                    folders.push({
                        name,
                        path: childUri.fsPath,
                        children
                    });
                }
            }

            return folders;
        } catch {
            return [];
        }
    }

    private async _getFolderContents(folderPath: string, category: string): Promise<any[]> {
        const fileExtension = this._getCategoryExtension(category);
        const folderUri = vscode.Uri.file(folderPath);
        
        try {
            const entries = await vscode.workspace.fs.readDirectory(folderUri);
            const items: any[] = [];

            for (const [name, type] of entries) {
                if (type === vscode.FileType.Directory && !name.startsWith('.') && name !== 'node_modules') {
                    // Add subfolder
                    const subfolderUri = vscode.Uri.joinPath(folderUri, name);
                    const stats = await vscode.workspace.fs.stat(subfolderUri);
                    
                    items.push({
                        name,
                        path: subfolderUri.fsPath,
                        type: 'folder',
                        modified: new Date(stats.mtime).toISOString()
                    });
                } else if (type === vscode.FileType.File && name.endsWith(fileExtension) && name !== 'index.md') {
                    // Add file
                    const fileUri = vscode.Uri.joinPath(folderUri, name);
                    const stats = await vscode.workspace.fs.stat(fileUri);
                    
                    // Try to read frontmatter for metadata
                    let frontmatter: any = {};
                    try {
                        const content = await FileParser.readFile(fileUri.fsPath);
                        const parsed = FileParser.parseFrontmatter(content);
                        frontmatter = parsed.frontmatter;
                    } catch {
                        // Ignore parse errors
                    }

                    items.push({
                        name,
                        path: fileUri.fsPath,
                        type: 'file',
                        modified: new Date(stats.mtime).toISOString(),
                        frontmatter
                    });
                }
            }

            // Sort folders first, then files, both alphabetically
            items.sort((a, b) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === 'folder' ? -1 : 1;
            });
            
            return items;
        } catch {
            return [];
        }
    }

    private async _getFileContent(filePath: string): Promise<any> {
        try {
            const content = await FileParser.readFile(filePath);
            const parsed = FileParser.parseFrontmatter(content);
            return {
                path: filePath,
                frontmatter: parsed.frontmatter,
                content: parsed.content
            };
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read file: ${error}`);
            return null;
        }
    }

    private async _saveFileContent(filePath: string, frontmatter: any, content: string): Promise<void> {
        // Check if session is active
        if (!this._activeSession) {
            vscode.window.showErrorMessage('Cannot save file: No active design session. Start a session first.');
            return;
        }

        try {
            const text = FileParser.stringifyFrontmatter(frontmatter, content);
            const fileUri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(text, 'utf-8'));
            
            this._panel.webview.postMessage({ 
                type: 'fileSaved', 
                data: { path: filePath, success: true } 
            });
            
            vscode.window.showInformationMessage('File saved successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save file: ${error}`);
            this._panel.webview.postMessage({ 
                type: 'fileSaved', 
                data: { path: filePath, success: false, error: String(error) } 
            });
        }
    }

    private async _promptCreateFolder(folderPath: string, category: string): Promise<void> {
        // Check if session is active
        if (!this._activeSession) {
            vscode.window.showErrorMessage('Cannot create folder: No active design session. Start a session first.');
            return;
        }

        // If folderPath is empty, use the base category path
        const basePath = folderPath || this._getCategoryPath(category).fsPath;

        const folderName = await vscode.window.showInputBox({
            prompt: 'Enter subfolder name',
            placeHolder: 'my-subfolder',
            validateInput: (value) => {
                if (!value || !value.trim()) {
                    return 'Folder name cannot be empty';
                }
                return null;
            }
        });

        if (folderName) {
            const kebabName = this._toKebabCase(folderName);
            const newFolderPath = path.join(basePath, kebabName);
            await this._createFolder(newFolderPath);
        }
    }

    private async _promptCreateFile(folderPath: string, category: string): Promise<void> {
        // Check if session is active
        if (!this._activeSession) {
            vscode.window.showErrorMessage('Cannot create file: No active design session. Start a session first.');
            return;
        }

        // If folderPath is empty, use the base category path
        const basePath = folderPath || this._getCategoryPath(category).fsPath;

        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(0, -1);
        const title = await vscode.window.showInputBox({
            prompt: `Enter ${categoryLabel} title`,
            placeHolder: 'My New Item',
            validateInput: (value) => {
                if (!value || !value.trim()) {
                    return 'Title cannot be empty';
                }
                return null;
            }
        });

        if (title && title.trim()) {
            await this._createFile(basePath, category, title.trim());
        }
    }

    private async _createFolder(folderPath: string): Promise<void> {
        // Check if session is active
        if (!this._activeSession) {
            vscode.window.showErrorMessage('Cannot create folder: No active design session. Start a session first.');
            return;
        }

        try {
            const folderUri = vscode.Uri.file(folderPath);
            await vscode.workspace.fs.createDirectory(folderUri);
            
            this._panel.webview.postMessage({ 
                type: 'folderCreated', 
                data: { path: folderPath, success: true } 
            });
            
            vscode.window.showInformationMessage('Folder created successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create folder: ${error}`);
            this._panel.webview.postMessage({ 
                type: 'folderCreated', 
                data: { path: folderPath, success: false, error: String(error) } 
            });
        }
    }

    private async _createFile(folderPath: string, category: string, title: string): Promise<void> {
        // Check if session is active
        if (!this._activeSession) {
            vscode.window.showErrorMessage('Cannot create file: No active design session. Start a session first.');
            return;
        }

        try {
            // Generate kebab-case filename
            const filename = this._toKebabCase(title);
            const fileExtension = this._getCategoryExtension(category);
            const filePath = path.join(folderPath, `${filename}${fileExtension}`);
            const fileUri = vscode.Uri.file(filePath);

            // Check if file already exists
            try {
                await vscode.workspace.fs.stat(fileUri);
                vscode.window.showErrorMessage(`File already exists: ${filename}${fileExtension}`);
                this._panel.webview.postMessage({ 
                    type: 'fileCreated', 
                    data: { path: filePath, success: false, error: 'File already exists' } 
                });
                return;
            } catch {
                // File doesn't exist, continue
            }

            // Generate frontmatter template
            const frontmatter = this._getFrontmatterTemplate(category, filename);
            
            // Generate minimal content template
            const content = this._getContentTemplate(category, title);

            // Create file
            const text = FileParser.stringifyFrontmatter(frontmatter, content);
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(text, 'utf-8'));
            
            this._panel.webview.postMessage({ 
                type: 'fileCreated', 
                data: { path: filePath, success: true } 
            });
            
            vscode.window.showInformationMessage(`File created: ${filename}${fileExtension}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create file: ${error}`);
            this._panel.webview.postMessage({ 
                type: 'fileCreated', 
                data: { path: folderPath, success: false, error: String(error) } 
            });
        }
    }

    private _toKebabCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    private _getFrontmatterTemplate(category: string, id: string): any {
        switch (category) {
            case 'features':
                return {
                    feature_id: id,
                    spec_id: [],
                    model_id: []
                };
            case 'specs':
                return {
                    spec_id: id,
                    feature_id: [],
                    model_id: [],
                    context_id: []
                };
            case 'models':
                return {
                    model_id: id,
                    type: '',
                    related_models: []
                };
            case 'contexts':
                return {
                    context_id: id,
                    category: ''
                };
            case 'actors':
                return {
                    actor_id: id,
                    type: 'user'
                };
            default:
                return {};
        }
    }

    private _getContentTemplate(category: string, title: string): string {
        switch (category) {
            case 'features':
                return `## Overview

(Describe what this feature does)

## Behavior

\`\`\`gherkin
Feature: ${title}

Scenario: (Describe a scenario)
  Given (initial context)
  When (action taken)
  Then (expected outcome)
\`\`\`

## Notes

(Additional context or considerations)
`;
            case 'specs':
                return `## Overview

(Describe the technical implementation)

## Architecture

\`\`\`mermaid
graph TD
  A[Component A] --> B[Component B]
\`\`\`

## Implementation Details

(Detailed technical specifications)

## Notes

(Additional context or considerations)
`;
            case 'models':
                return `## Overview

(Describe what this model represents)

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | string | Yes | Unique identifier |

## Relationships

(Describe relationships with other models)

## Validation Rules

(Describe validation requirements)

## Notes

(Additional context or considerations)
`;
            case 'contexts':
                return `## Overview

(Describe when to use this context)

## Usage

\`\`\`gherkin
Scenario: When to use this context
  Given (specific situation)
  When (working on something)
  Then (use this guidance)
\`\`\`

## Guidance

(Provide specific technical guidance)

## Notes

(Additional context or considerations)
`;
            case 'actors':
                return `## Overview

(Describe this actor and their role)

## Responsibilities

- (List key responsibilities)

## Interactions

(Describe how this actor interacts with the system)

## Notes

(Additional context or considerations)
`;
            default:
                return '(Add your content here)\n';
        }
    }

    private _getCategoryPath(category: string): vscode.Uri {
        return vscode.Uri.joinPath(this._projectUri, 'ai', category);
    }

    private _getCategoryExtension(category: string): string {
        const extensions: { [key: string]: string } = {
            'features': '.feature.md',
            'specs': '.spec.md',
            'models': '.model.md',
            'contexts': '.context.md'
        };
        return extensions[category] || '.md';
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
