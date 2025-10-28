import * as vscode from 'vscode';
import { DistillSessionCommand } from './commands/DistillSessionCommand';
import { BuildStoryCommand } from './commands/BuildStoryCommand';
import { ForgeStudioPanel } from './panels/ForgeStudioPanel';
import { ProjectPicker } from './utils/ProjectPicker';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('Forge extension is now active');

    // Create output channel for displaying prompts
    outputChannel = vscode.window.createOutputChannel('Forge');
    context.subscriptions.push(outputChannel);

    // Register the Distill Session command
    const distillSessionCommand = vscode.commands.registerCommand(
        'forge.distillSession',
        async (uri?: vscode.Uri) => {
            await DistillSessionCommand.execute(uri, outputChannel);
        }
    );

    // Register the Build Story command
    const buildStoryCommand = vscode.commands.registerCommand(
        'forge.buildStory',
        async (uri?: vscode.Uri) => {
            await BuildStoryCommand.execute(uri, outputChannel);
        }
    );

    context.subscriptions.push(distillSessionCommand);
    context.subscriptions.push(buildStoryCommand);

    // Register Forge Studio command
    const openStudioCommand = vscode.commands.registerCommand('forge.openStudio', async () => {
        const project = await ProjectPicker.pickProject();
        if (!project) {
            return;
        }
        ForgeStudioPanel.render(context.extensionUri, project, outputChannel);
    });
    context.subscriptions.push(openStudioCommand);
}

export function deactivate() {}

export function getOutputChannel(): vscode.OutputChannel {
    return outputChannel;
}

