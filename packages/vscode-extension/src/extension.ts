import * as vscode from 'vscode';
import { StartSessionCommand } from './commands/StartSessionCommand';
import { DistillSessionCommand } from './commands/DistillSessionCommand';
import { BuildStoryCommand } from './commands/BuildStoryCommand';
import { GlamStudioPanel } from './panels/GlamStudioPanel';
import { ProjectPicker } from './utils/ProjectPicker';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('Glam extension is now active');

    // Create output channel for displaying prompts
    outputChannel = vscode.window.createOutputChannel('Glam');
    context.subscriptions.push(outputChannel);

    // Register the Start Session command
    const startSessionCommand = vscode.commands.registerCommand('glam.startSession', async () => {
        await StartSessionCommand.execute(outputChannel);
    });

    // Register the Distill Session command
    const distillSessionCommand = vscode.commands.registerCommand(
        'glam.distillSession',
        async (uri?: vscode.Uri) => {
            await DistillSessionCommand.execute(uri, outputChannel);
        }
    );

    // Register the Build Story command
    const buildStoryCommand = vscode.commands.registerCommand(
        'glam.buildStory',
        async (uri?: vscode.Uri) => {
            await BuildStoryCommand.execute(uri, outputChannel);
        }
    );

    context.subscriptions.push(startSessionCommand);
    context.subscriptions.push(distillSessionCommand);
    context.subscriptions.push(buildStoryCommand);

    // Register Glam Studio command
    const openStudioCommand = vscode.commands.registerCommand('glam.openStudio', async () => {
        const project = await ProjectPicker.pickProject();
        if (!project) {
            return;
        }
        GlamStudioPanel.render(context.extensionUri, project, outputChannel);
    });
    context.subscriptions.push(openStudioCommand);
}

export function deactivate() {}

export function getOutputChannel(): vscode.OutputChannel {
    return outputChannel;
}

