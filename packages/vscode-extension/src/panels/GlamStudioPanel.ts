import * as vscode from 'vscode';

import { FileParser } from '../utils/FileParser';
import { GherkinParser, GherkinScenario } from '../utils/GherkinParser';
import { YamlIO, FeatureSetIndex } from '../utils/YamlIO';

export class GlamStudioPanel {
    public static currentPanel: GlamStudioPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _projectUri: vscode.Uri;
    private readonly _output: vscode.OutputChannel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, projectUri: vscode.Uri, output: vscode.OutputChannel) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._projectUri = projectUri;
        this._output = output;

        this._update();

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
                case 'listFeatureSets': {
                    const sets = await this._listFeatureSets();
                    this._panel.webview.postMessage({ type: 'featureSets', data: sets });
                    break;
                }
                case 'createFeatureSet': {
                    await this._createFeatureSet(message.data?.name, message.data?.description, message.data?.background);
                    const sets = await this._listFeatureSets();
                    this._panel.webview.postMessage({ type: 'featureSets', data: sets });
                    const counts = await this._getCounts();
                    this._panel.webview.postMessage({ type: 'counts', data: counts });
                    break;
                }
                case 'getFeatureSet': {
                    const data = await this._getFeatureSet(message.data?.id);
                    this._panel.webview.postMessage({ type: 'featureSet', data });
                    break;
                }
                case 'createFeature': {
                    await this._createFeature(message.data?.featuresetId, message.data?.name, message.data?.frontmatter, message.data?.scenarios);
                    const data = await this._getFeatureSet(message.data?.featuresetId);
                    this._panel.webview.postMessage({ type: 'featureSet', data });
                    const counts = await this._getCounts();
                    this._panel.webview.postMessage({ type: 'counts', data: counts });
                    break;
                }
                case 'getFeature': {
                    const data = await this._getFeature(message.data?.path);
                    this._panel.webview.postMessage({ type: 'feature', data });
                    break;
                }
                case 'updateFeature': {
                    await this._updateFeature(message.data?.path, message.data?.frontmatter, message.data?.scenarios);
                    const data = await this._getFeature(message.data?.path);
                    this._panel.webview.postMessage({ type: 'feature', data });
                    break;
                }
                case 'listSpecs': {
                    const data = await this._listSpecs();
                    this._panel.webview.postMessage({ type: 'specs', data });
                    break;
                }
                case 'getSpec': {
                    const data = await this._getSpec(message.data?.path);
                    this._panel.webview.postMessage({ type: 'spec', data });
                    break;
                }
                case 'updateSpec': {
                    await this._updateSpec(message.data?.path, message.data?.frontmatter, message.data?.body);
                    const data = await this._getSpec(message.data?.path);
                    this._panel.webview.postMessage({ type: 'spec', data });
                    break;
                }
                case 'switchProject': {
                    if (message.data?.projectPath) {
                        this._projectUri = vscode.Uri.file(message.data.projectPath);
                        this._panel.webview.postMessage({ type: 'initialState', data: await this._getInitialState() });
                        const counts = await this._getCounts();
                        this._panel.webview.postMessage({ type: 'counts', data: counts });
                    }
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
    html, body, #root { height: 100%; margin: 0; padding: 0; }
    body { font-family: var(--vscode-font-family); color: var(--vscode-editor-foreground); background: var(--vscode-editor-background); }
    .sidebar { width: 220px; border-right: 1px solid var(--vscode-panel-border); }
    .container { display: flex; height: 100%; }
  </style>
  </head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}">
    const acquireVsCodeApi = globalThis.acquireVsCodeApi || (() => ({ postMessage: () => {} }));
    window.__GLAM_NONCE__ = '${nonce}';
  </script>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }

    private async _getCounts(): Promise<{ decisions: number; features: number; featureSets: number; specs: number; }>
    {
        const decisions = await this._countByGlob(['ai', 'decisions'], (name) => name.endsWith('.decision.md'));
        const specs = await this._countRecursive(['ai', 'specs'], (name) => name.endsWith('.spec.md'));
        const features = await this._countRecursive(['ai', 'features'], (name) => name.endsWith('.feature.md'));
        const featureSets = await this._countFeatureSets();
        return { decisions, features, featureSets, specs };
    }

    private async _countByGlob(pathSegs: string[], predicate: (name: string) => boolean): Promise<number> {
        try {
            const dir = vscode.Uri.joinPath(this._projectUri, ...pathSegs);
            const entries = await vscode.workspace.fs.readDirectory(dir);
            return entries.filter(([name, type]) => type === vscode.FileType.File && predicate(name)).length;
        } catch {
            return 0;
        }
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

    private async _countFeatureSets(): Promise<number> {
        try {
            const featuresRoot = vscode.Uri.joinPath(this._projectUri, 'ai', 'features');
            const entries = await vscode.workspace.fs.readDirectory(featuresRoot);
            let count = 0;
            for (const [name, type] of entries) {
                if (type === vscode.FileType.Directory) {
                    // check index.yaml exists
                    try {
                        await vscode.workspace.fs.stat(vscode.Uri.joinPath(featuresRoot, name, 'index.yaml'));
                        count += 1;
                    } catch {
                        // no index.yaml
                    }
                }
            }
            return count;
        } catch {
            return 0;
        }
    }

    private async _listFeatureSets(): Promise<Array<{ id: string; path: string }>> {
        const result: Array<{ id: string; path: string }> = [];
        try {
            const featuresRoot = vscode.Uri.joinPath(this._projectUri, 'ai', 'features');
            const entries = await vscode.workspace.fs.readDirectory(featuresRoot);
            for (const [name, type] of entries) {
                if (type === vscode.FileType.Directory) {
                    try {
                        await vscode.workspace.fs.stat(vscode.Uri.joinPath(featuresRoot, name, 'index.yaml'));
                        result.push({ id: name, path: vscode.Uri.joinPath(featuresRoot, name).fsPath });
                    } catch {
                        // skip
                    }
                }
            }
        } catch {
            // ignore
        }
        return result;
    }

    private async _createFeatureSet(name: string, description?: string, background?: string): Promise<void> {
        const id = kebabCase(name || 'feature-set');
        const folder = vscode.Uri.joinPath(this._projectUri, 'ai', 'features', id);
        const indexUri = vscode.Uri.joinPath(folder, 'index.yaml');
        try { await vscode.workspace.fs.createDirectory(folder); } catch {}
        const index: FeatureSetIndex = { name, description, background };
        await YamlIO.writeYaml(indexUri, index);
    }

    private async _getFeatureSet(id: string): Promise<{ id: string; index: FeatureSetIndex | null; features: Array<{ id: string; path: string }> }> {
        const folder = vscode.Uri.joinPath(this._projectUri, 'ai', 'features', id);
        let index: FeatureSetIndex | null = null;
        try {
            index = await YamlIO.readYaml<FeatureSetIndex>(vscode.Uri.joinPath(folder, 'index.yaml'));
        } catch {}
        const features: Array<{ id: string; path: string }> = [];
        try {
            const entries = await vscode.workspace.fs.readDirectory(folder);
            for (const [name, type] of entries) {
                if (type === vscode.FileType.File && name.endsWith('.feature.md')) {
                    features.push({ id: name.replace(/\.feature\.md$/, ''), path: vscode.Uri.joinPath(folder, name).fsPath });
                }
            }
        } catch {}
        return { id, index, features };
    }

    private async _createFeature(featuresetId: string, name: string, frontmatter: any, scenarios?: GherkinScenario[]): Promise<void> {
        const id = kebabCase(name || 'feature');
        const folder = vscode.Uri.joinPath(this._projectUri, 'ai', 'features', featuresetId);
        const file = vscode.Uri.joinPath(folder, `${id}.feature.md`);
        const fm = {
            feature_id: id,
            spec_id: [],
            background: frontmatter?.background || ''
        };
        const content = scenarios && scenarios.length > 0 ? GherkinParser.serialize(scenarios) : '';
        const text = FileParser.stringifyFrontmatter(fm, content);
        const enc = new TextEncoder();
        await vscode.workspace.fs.writeFile(file, enc.encode(text));
    }

    private async _getFeature(path: string): Promise<{ path: string; frontmatter: any; scenarios: GherkinScenario[] }> {
        const uri = vscode.Uri.file(path);
        const bytes = await vscode.workspace.fs.readFile(uri);
        const text = Buffer.from(bytes).toString('utf-8');
        const parsed = FileParser.parseFrontmatter(text);
        const scenarios = GherkinParser.parse(parsed.content || '');
        return { path, frontmatter: parsed.frontmatter, scenarios };
    }

    private async _updateFeature(path: string, frontmatter: any, scenarios: GherkinScenario[]): Promise<void> {
        const uri = vscode.Uri.file(path);
        const content = GherkinParser.serialize(scenarios || []);
        const text = FileParser.stringifyFrontmatter(frontmatter || {}, content);
        const enc = new TextEncoder();
        await vscode.workspace.fs.writeFile(uri, enc.encode(text));
    }

    private async _listSpecs(): Promise<Array<{ path: string; id: string }>> {
        const root = vscode.Uri.joinPath(this._projectUri, 'ai', 'specs');
        const out: Array<{ path: string; id: string }> = [];
        await this._walkSpecs(root, out);
        return out;
    }

    private async _walkSpecs(uri: vscode.Uri, out: Array<{ path: string; id: string }>) {
        try {
            const entries = await vscode.workspace.fs.readDirectory(uri);
            for (const [name, type] of entries) {
                const child = vscode.Uri.joinPath(uri, name);
                if (type === vscode.FileType.File && name.endsWith('.spec.md')) {
                    out.push({ path: child.fsPath, id: name.replace(/\.spec\.md$/, '') });
                } else if (type === vscode.FileType.Directory) {
                    await this._walkSpecs(child, out);
                }
            }
        } catch {}
    }

    private async _getSpec(path: string): Promise<{ path: string; frontmatter: any; body: string }> {
        const uri = vscode.Uri.file(path);
        const bytes = await vscode.workspace.fs.readFile(uri);
        const text = Buffer.from(bytes).toString('utf-8');
        const parsed = FileParser.parseFrontmatter(text);
        return { path, frontmatter: parsed.frontmatter, body: parsed.content };
    }

    private async _updateSpec(path: string, frontmatter: any, body: string): Promise<void> {
        const uri = vscode.Uri.file(path);
        const text = FileParser.stringifyFrontmatter(frontmatter || {}, body || '');
        const enc = new TextEncoder();
        await vscode.workspace.fs.writeFile(uri, enc.encode(text));
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

function kebabCase(input: string): string {
    return (input || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}


