import * as vscode from 'vscode';
import { PromptGenerator } from '../utils/PromptGenerator';

export class NewDecisionPanel {
    public static currentPanel: NewDecisionPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _outputChannel: vscode.OutputChannel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        outputChannel: vscode.OutputChannel
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._outputChannel = outputChannel;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case 'submit':
                        this._handleFormSubmit(message.data);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static render(extensionUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
        if (NewDecisionPanel.currentPanel) {
            NewDecisionPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'glamNewDecision',
                'Glam: New Decision',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            NewDecisionPanel.currentPanel = new NewDecisionPanel(
                panel,
                extensionUri,
                outputChannel
            );
        }
    }

    private _handleFormSubmit(data: {
        whatIsChanging: string;
        whyIsItChanging: string;
        proposedChange: string;
        optionsConsidered: string;
    }) {
        const prompt = PromptGenerator.generateNewDecisionPrompt(data);
        
        this._outputChannel.clear();
        this._outputChannel.appendLine('='.repeat(80));
        this._outputChannel.appendLine('GLAM: New Decision Prompt');
        this._outputChannel.appendLine('='.repeat(80));
        this._outputChannel.appendLine('');
        this._outputChannel.appendLine('Copy the prompt below and paste it into your Cursor Agent window:');
        this._outputChannel.appendLine('');
        this._outputChannel.appendLine('-'.repeat(80));
        this._outputChannel.appendLine(prompt);
        this._outputChannel.appendLine('-'.repeat(80));
        this._outputChannel.show(true);

        vscode.window.showInformationMessage('Decision prompt generated! Check the Glam output panel.');
        this._panel.dispose();
    }

    public dispose() {
        NewDecisionPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Decision</title>
    <style>
        body {
            padding: 20px;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        h1 {
            color: var(--vscode-foreground);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: var(--vscode-foreground);
        }
        input[type="text"],
        textarea {
            width: 100%;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            box-sizing: border-box;
            font-family: var(--vscode-font-family);
        }
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>Create a New Decision</h1>
    <p class="description">
        Fill out the form below to generate a prompt for creating a new decision document. 
        The generated prompt will be displayed in the Glam output panel for you to copy and paste into Cursor Agent.
    </p>
    
    <form id="decisionForm">
        <div class="form-group">
            <label for="whatIsChanging">What is changing?</label>
            <textarea id="whatIsChanging" name="whatIsChanging" required 
                placeholder="Describe what aspects of the system or process will be changed..."></textarea>
        </div>
        
        <div class="form-group">
            <label for="whyIsItChanging">Why is it changing?</label>
            <textarea id="whyIsItChanging" name="whyIsItChanging" required
                placeholder="Explain the motivation and drivers behind this change..."></textarea>
        </div>
        
        <div class="form-group">
            <label for="proposedChange">Summary of the proposed change?</label>
            <textarea id="proposedChange" name="proposedChange" required
                placeholder="Provide a concise summary of the proposed solution..."></textarea>
        </div>
        
        <div class="form-group">
            <label for="optionsConsidered">Options considered?</label>
            <textarea id="optionsConsidered" name="optionsConsidered" required
                placeholder="List the alternative approaches that were evaluated..."></textarea>
        </div>
        
        <button type="submit">Generate Prompt</button>
    </form>

    <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('decisionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                whatIsChanging: document.getElementById('whatIsChanging').value,
                whyIsItChanging: document.getElementById('whyIsItChanging').value,
                proposedChange: document.getElementById('proposedChange').value,
                optionsConsidered: document.getElementById('optionsConsidered').value
            };
            
            vscode.postMessage({
                command: 'submit',
                data: formData
            });
        });
    </script>
</body>
</html>`;
    }
}

