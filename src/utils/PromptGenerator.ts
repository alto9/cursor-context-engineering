import * as vscode from 'vscode';
import * as path from 'path';
import { FileParser } from './FileParser';

export interface NewDecisionData {
    whatIsChanging: string;
    whyIsItChanging: string;
    proposedChange: string;
    optionsConsidered: string;
}

export class PromptGenerator {
    /**
     * Generates a prompt for creating a new decision document
     */
    static generateNewDecisionPrompt(data: NewDecisionData): string {
        const timestamp = new Date().toISOString().split('T')[0];
        const decisionId = this.generateDecisionId(data.proposedChange);

        return `Create a new decision document in the ai/decisions folder with the following details:

**Decision ID**: ${decisionId}
**Filename**: ai/decisions/${decisionId}.decision.md
**Date**: ${timestamp}

**What is changing:**
${data.whatIsChanging}

**Why is it changing:**
${data.whyIsItChanging}

**Proposed change summary:**
${data.proposedChange}

**Options considered:**
${data.optionsConsidered}

Please create this decision document using the Architecture Decision Record (ADR) format with the following structure:

---
decision_id: ${decisionId}
date: ${timestamp}
status: proposed
---

# ${this.toTitleCase(decisionId.replace(/-/g, ' '))}

## Status
Proposed

## Context
${data.whyIsItChanging}

## Decision
${data.proposedChange}

## Alternatives Considered
${data.optionsConsidered}

## Consequences
[To be filled in - what are the positive and negative consequences of this decision?]

## References
[Any relevant documentation, links, or related decisions]

Ensure the ai/decisions folder exists, and create it if it doesn't. Use proper markdown formatting and ensure the frontmatter is valid YAML.`;
    }

    /**
     * Generates a prompt for distilling a decision into features and specs
     */
    static async generateDistillDecisionPrompt(decisionUri: vscode.Uri): Promise<string> {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(decisionUri);
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const decisionContent = await FileParser.readFile(decisionUri.fsPath);
        const decisionData = FileParser.parseFrontmatter(decisionContent);
        const decisionId = decisionData.frontmatter.decision_id || path.basename(decisionUri.fsPath, '.decision.md');

        // Find related features and specs
        const featuresFolder = path.join(workspaceFolder.uri.fsPath, 'ai', 'features');
        const specsFolder = path.join(workspaceFolder.uri.fsPath, 'ai', 'specs');
        const contextsFolder = path.join(workspaceFolder.uri.fsPath, 'ai', 'contexts');

        const existingFeatures = await this.findRelatedFiles(featuresFolder, '.feature.md');
        const existingSpecs = await this.findRelatedFiles(specsFolder, '.spec.md');
        const existingContexts = await this.findRelatedFiles(contextsFolder, '.context.md');

        let prompt = `Review and distill the following decision into features and specs:

**Decision File**: ${decisionUri.fsPath}
**Decision ID**: ${decisionId}

**Decision Content**:
\`\`\`markdown
${decisionContent}
\`\`\`

`;

        if (existingContexts.length > 0) {
            prompt += `**Available Context Files**:
`;
            for (const contextFile of existingContexts) {
                const content = await FileParser.readFile(contextFile);
                const parsed = FileParser.parseFrontmatter(content);
                prompt += `- ${parsed.frontmatter.context_id || path.basename(contextFile)}\n`;
            }
            prompt += '\n';
        }

        prompt += `**Task**: Analyze this decision and ensure that:

1. **Features** in ai/features/ fully capture the user-facing functionality described in this decision
   - Each feature should be in Gherkin format with GIVEN/WHEN/THEN scenarios
   - Features should reference relevant spec_ids in their frontmatter
   - Create new feature files if needed or update existing ones

2. **Specs** in ai/specs/ provide the technical specifications for implementing these features
   - Specs should include technical details, architecture decisions, and mermaid diagrams where appropriate
   - Specs should reference relevant feature_ids in their frontmatter
   - Create new spec files if needed or update existing ones

`;

        if (existingFeatures.length > 0) {
            prompt += `**Existing Features**:
`;
            for (const featureFile of existingFeatures) {
                const content = await FileParser.readFile(featureFile);
                const parsed = FileParser.parseFrontmatter(content);
                prompt += `- ${parsed.frontmatter.feature_id || path.basename(featureFile)}\n`;
            }
            prompt += '\n';
        }

        if (existingSpecs.length > 0) {
            prompt += `**Existing Specs**:
`;
            for (const specFile of existingSpecs) {
                const content = await FileParser.readFile(specFile);
                const parsed = FileParser.parseFrontmatter(content);
                prompt += `- ${parsed.frontmatter.spec_id || path.basename(specFile)}\n`;
            }
            prompt += '\n';
        }

        prompt += `Review the decision and determine what features and specs need to be created or updated. Ensure complete coverage of the decision's requirements while maintaining proper relationships between features and specs.

For each feature, use the format:
---
feature_id: [kebab-case-id]
spec_id: [array of related spec IDs]
---

For each spec, use the format:
---
spec_id: [kebab-case-id]
feature_id: [array of related feature IDs]
---

Consider the available context files and reference them appropriately in your features and specs.`;

        return prompt;
    }

    /**
     * Generates a prompt for converting a decision to tasks
     */
    static async generateConvertToTasksPrompt(decisionUri: vscode.Uri): Promise<string> {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(decisionUri);
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const decisionContent = await FileParser.readFile(decisionUri.fsPath);
        const decisionData = FileParser.parseFrontmatter(decisionContent);
        const decisionId = decisionData.frontmatter.decision_id || path.basename(decisionUri.fsPath, '.decision.md');

        const featuresFolder = path.join(workspaceFolder.uri.fsPath, 'ai', 'features');
        const specsFolder = path.join(workspaceFolder.uri.fsPath, 'ai', 'specs');
        const contextsFolder = path.join(workspaceFolder.uri.fsPath, 'ai', 'contexts');

        const relatedFeatures = await this.findRelatedFiles(featuresFolder, '.feature.md');
        const relatedSpecs = await this.findRelatedFiles(specsFolder, '.spec.md');
        const relatedContexts = await this.findRelatedFiles(contextsFolder, '.context.md');

        let prompt = `Convert the following decision into specific implementation tasks:

**Decision File**: ${decisionUri.fsPath}
**Decision ID**: ${decisionId}

**Decision Content**:
\`\`\`markdown
${decisionContent}
\`\`\`

`;

        // Include related features
        if (relatedFeatures.length > 0) {
            prompt += `\n**Related Features**:\n`;
            for (const featureFile of relatedFeatures) {
                const content = await FileParser.readFile(featureFile);
                const parsed = FileParser.parseFrontmatter(content);
                const featureId = parsed.frontmatter.feature_id || path.basename(featureFile);
                prompt += `\n### Feature: ${featureId}\n\`\`\`markdown\n${content}\n\`\`\`\n`;
            }
        }

        // Include related specs
        if (relatedSpecs.length > 0) {
            prompt += `\n**Related Specs**:\n`;
            for (const specFile of relatedSpecs) {
                const content = await FileParser.readFile(specFile);
                const parsed = FileParser.parseFrontmatter(content);
                const specId = parsed.frontmatter.spec_id || path.basename(specFile);
                prompt += `\n### Spec: ${specId}\n\`\`\`markdown\n${content}\n\`\`\`\n`;
            }
        }

        // Include related contexts
        if (relatedContexts.length > 0) {
            prompt += `\n**Related Contexts**:\n`;
            for (const contextFile of relatedContexts) {
                const content = await FileParser.readFile(contextFile);
                const parsed = FileParser.parseFrontmatter(content);
                const contextId = parsed.frontmatter.context_id || path.basename(contextFile);
                prompt += `\n### Context: ${contextId}\n\`\`\`markdown\n${content}\n\`\`\`\n`;
            }
        }

        prompt += `\n\n**Task**: Create specific, actionable tasks in the ai/tasks/ folder that will implement this decision.

Requirements:
1. Each task should be a separate markdown file with a .task.md extension
2. Tasks should be specific and implementable
3. Include all necessary context references from features, specs, and contexts
4. Tasks should be ordered logically with clear dependencies
5. Each task should have clear acceptance criteria

Task File Format:
---
task_id: [kebab-case-id]
decision_id: ${decisionId}
feature_id: [array of related feature IDs]
spec_id: [array of related spec IDs]
context_id: [array of related context IDs]
status: pending
priority: [high|medium|low]
dependencies: [array of task IDs that must be completed first]
---

# [Task Title]

## Description
[Clear description of what needs to be done]

## Context
[Relevant context from the decision, features, specs, and context files]

## Implementation Steps
1. [Specific step]
2. [Specific step]
...

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
...

## Related Documentation
- Feature: [feature_id]
- Spec: [spec_id]
- Context: [context_id]

Analyze all the provided information and create a complete set of tasks that will implement this decision. Be thorough but specific - tasks should be actionable and contain all the information needed for implementation.`;

        return prompt;
    }

    /**
     * Helper method to generate a kebab-case ID from a title
     */
    private static generateDecisionId(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
    }

    /**
     * Helper method to convert kebab-case to Title Case
     */
    private static toTitleCase(str: string): string {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Helper method to find related files in a folder
     */
    private static async findRelatedFiles(folderPath: string, extension: string): Promise<string[]> {
        try {
            const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath));
            return files
                .filter(([name, type]) => type === vscode.FileType.File && name.endsWith(extension))
                .map(([name]) => path.join(folderPath, name));
        } catch (error) {
            // Folder doesn't exist or can't be read
            return [];
        }
    }
}

