import * as vscode from 'vscode';
import * as path from 'path';
import { PromptGenerator } from '../utils/PromptGenerator';

export class DistillDecisionCommand {
    static async execute(uri?: vscode.Uri, outputChannel?: vscode.OutputChannel) {
        let decisionUri = uri;

        // If not called from context menu, show quick pick
        if (!decisionUri) {
            decisionUri = await this.selectDecisionFile();
            if (!decisionUri) {
                return; // User cancelled
            }
        }

        // Validate it's a decision file
        if (!decisionUri.fsPath.endsWith('.decision.md')) {
            vscode.window.showErrorMessage('Please select a valid decision file (.decision.md)');
            return;
        }

        try {
            const prompt = await PromptGenerator.generateDistillDecisionPrompt(decisionUri);

            if (outputChannel) {
                outputChannel.clear();
                outputChannel.appendLine('='.repeat(80));
                outputChannel.appendLine('GLAM: Distill Decision into Features and Specs');
                outputChannel.appendLine('='.repeat(80));
                outputChannel.appendLine('');
                outputChannel.appendLine('Copy the prompt below and paste it into your Cursor Agent window:');
                outputChannel.appendLine('');
                outputChannel.appendLine('-'.repeat(80));
                outputChannel.appendLine(prompt);
                outputChannel.appendLine('-'.repeat(80));
                outputChannel.show(true);
            }

            vscode.window.showInformationMessage(
                'Distill decision prompt generated! Check the Glam output panel.'
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating prompt: ${error}`);
        }
    }

    private static async selectDecisionFile(): Promise<vscode.Uri | undefined> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return undefined;
        }

        const decisionsFolder = path.join(workspaceFolders[0].uri.fsPath, 'ai', 'decisions');
        
        try {
            const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(decisionsFolder));
            const decisionFiles = files
                .filter(([name, type]) => type === vscode.FileType.File && name.endsWith('.decision.md'))
                .map(([name]) => name);

            if (decisionFiles.length === 0) {
                vscode.window.showWarningMessage('No decision files found in ai/decisions/');
                return undefined;
            }

            const selected = await vscode.window.showQuickPick(decisionFiles, {
                placeHolder: 'Select a decision file to distill'
            });

            if (selected) {
                return vscode.Uri.file(path.join(decisionsFolder, selected));
            }
        } catch (error) {
            vscode.window.showErrorMessage('Could not find ai/decisions folder');
        }

        return undefined;
    }
}

