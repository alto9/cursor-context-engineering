# Glam - Context Engineering for Agentic Development

A comprehensive toolkit for structured context engineering in AI-assisted development. Glam provides both a VSCode extension and an MCP server to help engineers create well-structured prompts with complete context.

## 🎯 What is Glam?

Glam is a workflow tool designed to help developers create well-structured, context-rich prompts for AI agents. It uses a systematic approach with decisions, features, specs, contexts, and tasks to ensure AI assistants have all the information they need.

## 📦 Packages

This is a monorepo containing two packages:

### [@glam/vscode-extension](./packages/vscode-extension/)
VSCode extension that provides commands for generating context-rich prompts for decisions, features, specs, and tasks.

**Features:**
- Interactive webview for creating new decisions
- Prompt generation for distilling decisions into features/specs
- Task generation from decisions with full context
- Right-click context menu integration

### [@glam/mcp-server](./packages/mcp-server/)
Model Context Protocol server that exposes Glam capabilities to AI assistants like Claude Desktop and Cursor.

**Features:**
- Resources for accessing decisions, features, specs, contexts, and tasks
- Tools for generating prompts programmatically
- File management for Glam project structures

## 🏗️ Project Structure

When you use Glam in a project, it helps you manage files in the following structure:

```
your-project/
└── ai/
    ├── decisions/     # Architecture Decision Records (ADRs)
    ├── features/      # Feature definitions with Gherkin scenarios
    ├── specs/         # Technical specifications with Mermaid diagrams
    ├── contexts/      # Context references and guidance
    ├── tasks/         # Implementation tasks
    └── docs/          # Supporting documentation
```

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/alto9/cursor-context-engineering.git
cd cursor-context-engineering

# Install dependencies for all packages
npm install

# Build all packages
npm run build
```

### Using the VSCode Extension

```bash
# Package the extension
npm run vscode:package

# Install the extension
code --install-extension packages/vscode-extension/glam-0.1.0.vsix
```

Then use the Command Palette (`Cmd/Ctrl+Shift+P`) to access Glam commands:
- `Glam: New Decision`
- `Glam: Distill Decision into Features and Specs`
- `Glam: Convert Decision to Tasks`

### Using the MCP Server

Add to your MCP settings file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "glam": {
      "command": "node",
      "args": ["/path/to/cursor-context-engineering/packages/mcp-server/dist/index.js"],
      "cwd": "/path/to/your/project"
    }
  }
}
```

## 📋 File Formats

### Decision Files (*.decision.md)
```markdown
---
decision_id: add-user-authentication
date: 2025-10-01
status: proposed
---

# Add User Authentication

[ADR content with context, decision, alternatives, and consequences]
```

### Feature Files (*.feature.md)
```markdown
---
feature_id: user-login
spec_id: [authentication-spec, session-management-spec]
---

# User Login Feature

GIVEN a registered user
WHEN they enter valid credentials
THEN they should be logged into the system
AND receive a session token
```

### Spec Files (*.spec.md)
```markdown
---
spec_id: authentication-spec
feature_id: [user-login, password-reset]
---

# Authentication Specification

[Technical details and Mermaid diagrams]
```

### Context Files (*.context.md)
```markdown
---
context_id: typescript-guidance
---

GIVEN we are working within Glam files
WHEN information is needed about TypeScript implementation
THEN read the document at `ai/docs/typescript_guidance.md`
AND use that information to help inform decisions
```

## 🔄 The Glam Workflow

1. **Create Context** - Set up context files that define how to handle specific scenarios
2. **Make Decisions** - Use "New Decision" to create ADRs for significant changes
3. **Distill to Features & Specs** - Convert decisions into user-facing features and technical specs
4. **Generate Tasks** - Break down the work into specific, actionable tasks with full context

Each step builds on the previous one, creating a comprehensive knowledge graph that ensures your AI agent has all the context it needs for accurate implementation.

## 💡 Why Glam?

Traditional prompting can be ad-hoc and miss important context. Glam helps you:

- **Build Comprehensive Context** - Systematically gather all relevant information
- **Maintain Consistency** - Use standardized formats across your project
- **Improve AI Accuracy** - Provide complete context for better AI-generated code
- **Create Traceable Documentation** - Link decisions, features, specs, and tasks
- **Reduce Rework** - Get it right the first time with well-structured prompts

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Watch mode for development
npm run watch

# Lint all packages
npm run lint

# Clean build artifacts
npm run clean
```

### Working with Individual Packages

```bash
# Build just the VSCode extension
npm run build -w @glam/vscode-extension

# Build just the MCP server
npm run build -w @glam/mcp-server

# Watch the MCP server
npm run dev -w @glam/mcp-server
```

## 📚 Documentation

- [VSCode Extension README](./packages/vscode-extension/README.md)
- [MCP Server README](./packages/mcp-server/README.md)
- [File Format Examples](./EXAMPLES.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🎯 Best Practices

1. **Start with Context** - Define context files early to guide decision-making
2. **One Decision at a Time** - Focus on completing each decision fully before starting another
3. **Link Everything** - Use IDs to create relationships between files
4. **Be Specific** - Provide detailed information in decisions to get better features and specs
5. **Review Before Distilling** - Ensure decisions are complete before converting to features/specs
6. **Iterate** - Refine features and specs before generating tasks

## 🔮 Future Plans

- Direct integration with Cursor Agent CLI (when stable)
- Template customization for different project types
- Prompt history and versioning
- Validation and linting for file formats
- Visualization of decision/feature/spec relationships
- Export to various documentation formats
- Enhanced MCP server capabilities

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Submit issues for bugs or feature requests
- Create pull requests with improvements
- Share your experiences and use cases

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

Created by alto9 to provide structured context engineering for AI-assisted development with Cursor IDE.

---

**Note**: Glam generates prompts for AI agents rather than executing tasks directly. This gives you full control and visibility into what's being requested, ensuring quality and allowing for customization before execution.
