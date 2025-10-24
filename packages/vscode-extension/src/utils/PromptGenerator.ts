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

        return `STEP 1: First, call the get_glam_schema tool with schema_type "decision" to retrieve the proper decision file format.

STEP 2: Once you have the schema, create a new decision document in the ai/decisions folder with the following details:

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

STEP 3: Create the decision document adhering to the schema you retrieved. The document should follow the Architecture Decision Record (ADR) format with these key elements:

- Proper frontmatter with decision_id: ${decisionId}
- Status section (set to "proposed")
- Context section explaining why this change is needed
- Decision section describing the proposed change
- Alternatives Considered section
- Consequences section (analyze positive and negative impacts)
- References section for any relevant links or documentation

Ensure the ai/decisions folder exists (create it if needed), use proper markdown formatting, and ensure the frontmatter is valid YAML as specified in the schema.`;
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

        let prompt = `STEP 1: Retrieve the required schemas by calling:
- get_glam_schema with schema_type "feature"
- get_glam_schema with schema_type "spec"

STEP 2: Review and distill the following decision into features and specs:

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

        prompt += `STEP 3: Analyze this decision and ensure that:

1. **Features** in ai/features/ fully capture the user-facing functionality described in this decision
   - Each feature MUST follow the feature schema you retrieved (Gherkin format with GIVEN/WHEN/THEN scenarios)
   - Features should reference relevant spec_ids in their frontmatter
   - Create new feature files if needed or update existing ones to reflect the new desired state

2. **Specs** in ai/specs/ provide the technical specifications for implementing these features
   - Specs MUST follow the spec schema you retrieved
   - Include technical details, architecture decisions, and Mermaid diagrams where appropriate
   - Specs should reference relevant feature_ids in their frontmatter
   - Create new spec files if needed or update existing ones to reflect the new desired state

STEP 4: Review the decision and determine what features and specs need to be created or updated. Ensure:
- Complete coverage of the decision's requirements
- Proper relationships between features and specs (bidirectional references)
- All files adhere to the schemas retrieved in Step 1
- Consider available context files and reference them appropriately using context_id fields

The goal is to update the features and specs to represent the NEW DESIRED STATE after this decision is implemented, not just the changes.`;

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

        let prompt = `STEP 1: Get the task schema by calling get_glam_schema with schema_type "task"

STEP 2: Review the decision, features, and specs to understand what needs to be implemented:

**Decision File**: ${decisionUri.fsPath}
**Decision ID**: ${decisionId}

`;

        // Collect all context_ids and technical objects
        const contextIds = new Set<string>();
        const technicalObjects = new Set<string>();

        // Include related features
        if (relatedFeatures.length > 0) {
            prompt += `\n**Related Features**:\n`;
            for (const featureFile of relatedFeatures) {
                const content = await FileParser.readFile(featureFile);
                const parsed = FileParser.parseFrontmatter(content);
                const featureId = parsed.frontmatter.feature_id || path.basename(featureFile);
                
                // Collect context_ids from features
                if (parsed.frontmatter.context_id) {
                    const contexts = Array.isArray(parsed.frontmatter.context_id) 
                        ? parsed.frontmatter.context_id 
                        : [parsed.frontmatter.context_id];
                    contexts.forEach((ctx: string) => contextIds.add(ctx));
                }
                
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
                
                // Collect context_ids from specs
                if (parsed.frontmatter.context_id) {
                    const contexts = Array.isArray(parsed.frontmatter.context_id) 
                        ? parsed.frontmatter.context_id 
                        : [parsed.frontmatter.context_id];
                    contexts.forEach((ctx: string) => contextIds.add(ctx));
                }
                
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

        prompt += `\n\nSTEP 3: Follow context file instructions`;
        
        if (contextIds.size > 0) {
            prompt += `

The features and specs reference the following context files:
${Array.from(contextIds).map(id => `- ${id}`).join('\n')}

Read and follow the GIVEN/WHEN/THEN rules in each context file above. These rules tell you:
- What documentation to read
- What tools to use
- What research to perform

Execute all applicable context rules before proceeding to the next step.`;
        } else {
            prompt += `

No specific context files are referenced by the features and specs. Proceed to identify technical objects that need research.`;
        }

        prompt += `

STEP 4: Identify and research technical objects

Based on the decision, features, and specs above, identify all technical objects, frameworks, or systems that will be:
- Created
- Modified
- Integrated with
- Configured

For EACH technical object you identify, call get_glam_context with the spec_object parameter to generate a research prompt. Then execute that research prompt to gather the information needed to create accurate, detailed task instructions.

Examples of technical objects might include:
- AWS services (e.g., "AWS Lambda function", "DynamoDB table")
- Framework components (e.g., "React component", "Express middleware")
- Infrastructure elements (e.g., "Docker container", "Kubernetes deployment")
- Database objects (e.g., "PostgreSQL schema", "Redis cache configuration")
- API integrations (e.g., "Stripe payment integration", "Auth0 authentication")

STEP 5: Identify or create a folder for this decisions tasks in the ai/tasks/ folder
- The folder name should be the decision_id
- The folder should be created in the ai/tasks/ folder

STEP 6: Create implementation tasks

Using:
- The task schema from Step 1
- The decision, features, and specs from Step 2
- The context guidance from Step 3
- The research findings from Step 4

Create specific, actionable tasks in the ai/tasks/${decisionId} folder that will implement this decision.

Each task MUST:
1. Follow the task schema exactly (from Step 1)
2. Be specific and implementable with clear technical details
3. Include the decision_id: ${decisionId}
4. Reference all related feature_ids and spec_ids
5. Reference all applicable context_ids
6. Have status: pending and an appropriate order number
7. Include COMPLETE context - assume the implementer knows the general technology but needs specific implementation details
8. Provide step-by-step implementation instructions
9. List files that will be affected (created, modified, deleted)
10. Have clear, testable acceptance criteria
11. Identify dependencies on other tasks

CRITICAL: Each task should contain ALL the information needed for an AI agent to implement it successfully. Use the research from Step 4 to provide specific technical guidance, code patterns, configuration details, and best practices. Don't assume knowledge - be explicit about HOW to implement each requirement.

The tasks you create are prompts that will be fed to an AI agent for implementation. They must be comprehensive, accurate, and actionable.`;

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

