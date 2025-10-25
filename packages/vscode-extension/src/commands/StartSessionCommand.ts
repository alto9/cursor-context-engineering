import * as vscode from 'vscode';
import { PromptGenerator } from '../utils/PromptGenerator';

export class StartSessionCommand {
    static async execute(outputChannel?: vscode.OutputChannel) {
        // Prompt user for problem statement
        const problemStatement = await vscode.window.showInputBox({
            prompt: 'What problem are you solving in this design session?',
            placeHolder: 'e.g., Add user authentication with email verification',
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Problem statement cannot be empty';
                }
                if (value.trim().length < 10) {
                    return 'Please provide a more detailed problem statement';
                }
                return undefined;
            }
        });

        if (!problemStatement) {
            return; // User cancelled
        }

        try {
            const prompt = PromptGenerator.generateStartSessionPrompt(problemStatement);

            if (outputChannel) {
                outputChannel.clear();
                outputChannel.appendLine('='.repeat(80));
                outputChannel.appendLine('GLAM: Start Design Session');
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
                'Start session prompt generated! Check the Glam output panel.'
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Error generating prompt: ${error}`);
        }
    }
}

