#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Glam MCP Server
 * Provides context engineering capabilities for Agentic development
 */
class GlamMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'glam-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_glam_schema',
            description: 'Get the schema specification for a Glam file type (decision, feature, spec, task, or context)',
            inputSchema: {
              type: 'object',
              properties: {
                schema_type: {
                  type: 'string',
                  enum: ['decision', 'feature', 'spec', 'task', 'context'],
                  description: 'The type of schema to retrieve',
                },
              },
              required: ['schema_type'],
            },
          },
          {
            name: 'get_glam_context',
            description: 'Generate a research prompt for a technical object that needs to be investigated. Returns prompt text that the agent should execute to perform proper research.',
            inputSchema: {
              type: 'object',
              properties: {
                spec_object: {
                  type: 'string',
                  description: 'A technical object or concept that needs to be researched (e.g., "AWS CDK Stack", "React component architecture", "PostgreSQL indexes")',
                },
              },
              required: ['spec_object'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_glam_schema':
          if (!args || typeof args.schema_type !== 'string') {
            throw new Error('schema_type is required');
          }
          return {
            content: [
              {
                type: 'text',
                text: this.getGlamSchema(args.schema_type),
              },
            ],
          };

        case 'get_glam_context':
          if (!args || typeof args.spec_object !== 'string') {
            throw new Error('spec_object is required');
          }
          return {
            content: [
              {
                type: 'text',
                text: this.getGlamContext(args.spec_object),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private getGlamSchema(schemaType: string): string {
    const schemas: Record<string, string> = {
      decision: `# Decision File Schema

## File Format
- **Filename**: <decision-id>.decision.md
- **Location**: ai/decisions/
- **Format**: Frontmatter + Markdown

## Frontmatter Fields
---
decision_id: kebab-case-id  # Must match filename without .decision.md
---

## Content Structure
The decision document should follow an ADR (Architecture Decision Record) format with these sections:

1. **Title** - Clear, descriptive title of the decision
2. **Status** - Current status (proposed, accepted, deprecated, superseded)
3. **Context** - What is the issue or situation that motivates this decision?
4. **Decision** - What is the change that we're proposing/doing?
5. **Consequences** - What becomes easier or harder as a result of this decision?

## Linkages
- A decision can be distilled into multiple **features** and **specs**
- Features and specs will reference this decision_id in their frontmatter`,

      feature: `# Feature File Schema

## File Format
- **Filename**: <feature-id>.feature.md
- **Location**: ai/features/
- **Format**: Frontmatter + Gherkin Scenarios

## Frontmatter Fields
---
feature_id: kebab-case-id  # Must match filename without .feature.md
spec_id: [spec-id-1, spec-id-2]  # Array of related spec IDs
decision_id: decision-id  # Optional: originating decision
---

## Content Structure
Feature files should contain Gherkin scenarios describing the desired behavior:

Feature: [Feature Name]

Scenario: [Scenario Name]
  GIVEN [initial context]
  WHEN [action or event]
  THEN [expected outcome]
  AND [additional outcome]
  
Scenario: [Another Scenario]
  GIVEN [context]
  AND [more context]
  WHEN [action]
  THEN [outcome]

## Linkages
- References one or more **spec_id** values
- May reference a **decision_id** that originated this feature
- Specs will also reference this feature_id in their frontmatter`,

      spec: `# Spec File Schema

## File Format
- **Filename**: <spec-id>.spec.md
- **Location**: ai/specs/
- **Format**: Frontmatter + Markdown + Mermaid Diagrams

## Frontmatter Fields
---
spec_id: kebab-case-id  # Must match filename without .spec.md
feature_id: [feature-id-1, feature-id-2]  # Array of related feature IDs
decision_id: decision-id  # Optional: originating decision
context_id: [context-id-1, context-id-2]  # Optional: related contexts
---

## Content Structure
Specification documents should include:

1. **Overview** - High-level description of what's being specified
2. **Requirements** - Detailed functional and non-functional requirements
3. **Architecture** - Technical architecture with Mermaid diagrams
4. **Implementation Notes** - Key technical considerations
5. **Dependencies** - External dependencies and integrations

### Mermaid Diagrams
Use Mermaid for visual representations:
- Sequence diagrams for workflows
- Flowcharts for decision trees
- Class diagrams for data structures
- Architecture diagrams for system design

## Linkages
- References one or more **feature_id** values
- May reference a **decision_id** that originated this spec
- May reference **context_id** values for additional guidance
- Tasks will reference this spec_id`,

      task: `# Task File Schema

## File Format
- **Filename**: <task-id>.task.md
- **Location**: ai/tasks/
- **Format**: Frontmatter + Markdown

## Frontmatter Fields
---
task_id: kebab-case-id  # Must match filename without .task.md
decision_id: decision-id  # Originating decision
spec_id: [spec-id-1, spec-id-2]  # Related specs
feature_id: [feature-id-1]  # Related features
context_id: [context-id-1, context-id-2]  # Relevant contexts
status: pending  # pending, in-progress, completed, blocked
order: 1  # Execution order within the decision
---

## Content Structure
Task documents should be specific, actionable implementation steps:

1. **Objective** - Clear statement of what needs to be done
2. **Implementation Steps** - Specific, numbered steps to complete the task
3. **Files Affected** - List of files that will be created, modified, or deleted
4. **Acceptance Criteria** - How to verify the task is complete
5. **Dependencies** - Other tasks that must be completed first
6. **Context References** - Links to relevant context documents

## Linkages
- References a **decision_id** (required)
- References one or more **spec_id** values (required)
- References one or more **feature_id** values (required)
- May reference **context_id** values for implementation guidance
- Tasks should be ordered sequentially within a decision`,

      context: `# Context File Schema

## File Format
- **Filename**: <context-id>.context.md
- **Location**: ai/contexts/
- **Format**: Frontmatter + Gherkin-style Rules

## Frontmatter Fields
---
context_id: kebab-case-id  # Must match filename without .context.md
---

## Content Structure
Context files provide guidance on when and how to use specific information or tools. They use Gherkin-style conditional logic:

GIVEN [condition or working context]
WHEN [information need arises]
THEN [action to take]
AND [additional action]

### Example 1: Document Reference
GIVEN we are working within Glam files
WHEN information is needed about TypeScript implementation
THEN read the document at ai/docs/typescript_guidance.md
AND use that information to inform decisions regarding TypeScript

### Example 2: Tool Usage
GIVEN we are working within Glam files
WHEN information is needed about AWS CDK implementation
THEN use the aws_cdk_guidance tool
AND use that information to inform decisions regarding CDK implementation

### Example 3: External Research
GIVEN a task requires understanding of [technology]
WHEN implementing features related to [domain]
THEN perform web search for latest best practices
AND verify approaches against official documentation

## Linkages
- Context files are referenced by **spec_id** and **task_id** values
- They provide just-in-time guidance without overloading the main context window
- They can point to documentation, tools, or research strategies`,
    };

    const schema = schemas[schemaType];
    if (!schema) {
      throw new Error(`Unknown schema type: ${schemaType}`);
    }

    return schema;
  }

  private getGlamContext(specObject: string): string {
    return `# Research Prompt for: ${specObject}

You need to research and understand "${specObject}" to properly implement or work with it in the current project context.

## Research Instructions

Execute the following research steps in order:

### 1. Check Project Documentation
First, search the project's ai/docs/ directory for any existing documentation about "${specObject}":
- Look for markdown files that might contain relevant information
- Check for naming patterns that relate to this object

### 2. Search Codebase
Use codebase_search to find existing implementations or references:
- Query: "How is ${specObject} implemented in this codebase?"
- Query: "Where is ${specObject} used?"
- Review the results to understand current usage patterns

### 3. External Research (if needed)
If the above steps don't provide sufficient information, perform web research:
- Search for official documentation for "${specObject}"
- Look for best practices and common patterns
- Find implementation examples and tutorials
- Check for version-specific considerations

### 4. Synthesize Findings
After gathering information, create a summary that includes:
- **Definition**: What is ${specObject}?
- **Purpose**: Why is it used?
- **Implementation**: How should it be implemented in this project?
- **Best Practices**: What are the recommended approaches?
- **Gotchas**: What are common pitfalls to avoid?
- **Dependencies**: What does it depend on or integrate with?

### 5. Create Context (if needed)
If this is a recurring concept that will be needed in multiple tasks, consider creating a context file at:
ai/contexts/${specObject.toLowerCase().replace(/\s+/g, '-')}-guidance.context.md

This context file should follow the context schema and provide GIVEN/WHEN/THEN rules for when and how to use this information in future work.

## Output Format
Provide your research findings in a structured format that can be easily referenced during implementation. Include specific code examples, configuration patterns, and integration points relevant to this project.

---

**Note**: This is a research prompt. Execute each step thoroughly before proceeding to implementation. Document your findings for future reference.`;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Glam MCP Server started');
  }
}

// Start the server
const server = new GlamMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

