import * as vscode from 'vscode';
import { NewDecisionPanel } from './panels/NewDecisionPanel';
import { DistillDecisionCommand } from './commands/DistillDecisionCommand';
import { ConvertToTasksCommand } from './commands/ConvertToTasksCommand';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('Glam extension is now active');

    // Create output channel for displaying prompts
    outputChannel = vscode.window.createOutputChannel('Glam');
    context.subscriptions.push(outputChannel);

    // Register the New Decision command
    const newDecisionCommand = vscode.commands.registerCommand('glam.newDecision', () => {
        NewDecisionPanel.render(context.extensionUri, outputChannel);
    });

    // Register the Distill Decision command
    const distillDecisionCommand = vscode.commands.registerCommand(
        'glam.distillDecision',
        async (uri?: vscode.Uri) => {
            await DistillDecisionCommand.execute(uri, outputChannel);
        }
    );

    // Register the Convert to Tasks command
    const convertToTasksCommand = vscode.commands.registerCommand(
        'glam.convertToTasks',
        async (uri?: vscode.Uri) => {
            await ConvertToTasksCommand.execute(uri, outputChannel);
        }
    );

    context.subscriptions.push(newDecisionCommand);
    context.subscriptions.push(distillDecisionCommand);
    context.subscriptions.push(convertToTasksCommand);
}

export function deactivate() {}

export function getOutputChannel(): vscode.OutputChannel {
    return outputChannel;
}

