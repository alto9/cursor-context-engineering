# Glam - Context Engineering for Agentic Development

A comprehensive toolkit for structured context engineering in AI-assisted development. Glam provides both a VSCode extension and an MCP server to help engineers create well-structured prompts with complete context.

## 🎯 What is Glam?

Glam is a session-driven workflow system for structured context engineering in AI-assisted development. It uses design sessions to track changes, then distills those sessions into minimal, actionable implementation stories with complete context.

## 📦 Packages

This is a monorepo containing two packages:

### [@glam/vscode-extension](./packages/vscode-extension/)
VSCode extension that provides commands for session-driven design and implementation.

**Features:**
- Start and manage design sessions
- Glam Studio for browsing and managing Glam files
- Distill sessions into Stories and Tasks
- Build stories with complete context
- Right-click context menu integration

### [@glam/mcp-server](./packages/mcp-server/)
Model Context Protocol server that exposes Glam capabilities to AI assistants like Claude Desktop and Cursor.

**Features:**
- get_glam_about - Comprehensive workflow overview
- get_glam_schema - Schema definitions for all file types
- get_glam_context - Technical object guidance
- get_glam_objects - List supported spec objects

## 🏗️ Project Structure

When you use Glam in a project, it manages files in a nestable folder structure:

```
your-project/
└── ai/
    ├── sessions/      # Design session tracking (nestable)
    ├── features/      # Feature definitions with Gherkin (nestable, index.md)
    ├── specs/         # Technical specifications with Mermaid (nestable)
    ├── models/        # Data model definitions (nestable)
    ├── contexts/      # Context references and guidance (nestable)
    ├── tickets/       # Implementation Stories and Tasks (nestable, by session)
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
- `Glam: Start Design Session`
- `Glam: Distill Session into Stories and Tasks`
- `Glam: Build Story Implementation`
- `Glam: Open Glam Studio`

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

### Session Files (*.session.md)
```markdown
---
session_id: user-authentication-session
start_time: 2025-10-25T10:00:00Z
end_time: null
status: active
problem_statement: "Add user authentication with email verification"
changed_files: [
  "ai/features/user/login.feature.md",
  "ai/specs/api/auth-endpoint.spec.md"
]
---

# User Authentication Session

## Problem Statement
Add secure user authentication...

## Goals
- Secure password handling
- Email verification
- Session management
```

### Feature Files (*.feature.md)
```markdown
---
feature_id: user-login
spec_id: [authentication-spec]
model_id: [user]
---

\`\`\`gherkin
Feature: User Login

Scenario: Successful login
  Given a registered user with email "user@example.com"
  When they enter valid credentials
  Then they should be logged into the system
  And receive a session token
\`\`\`
```

### Model Files (*.model.md)
```markdown
---
model_id: user
type: entity
related_models: [user-role, user-session]
---

## Overview
User entity representing system users.

### Properties
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| email | string | Yes | Email address (unique) |
| password_hash | string | Yes | Bcrypt hash |
```

### Story Files (*.story.md)
```markdown
---
story_id: add-email-validation
session_id: user-authentication-session
feature_id: [user-login]
spec_id: [authentication-spec]
status: pending
priority: high
estimated_minutes: 25
---

## Objective
Add email validation to User model

## Implementation Steps
1. Add validation function
2. Update tests
3. Apply to registration endpoint

## Acceptance Criteria
- [ ] Valid emails pass validation
- [ ] Invalid emails are rejected
```

## 🔄 The Glam Workflow

1. **Start a Session** - Begin a design session with a clear problem statement
2. **Design Changes** - Edit features, specs, models, and contexts during the active session
3. **Distill to Stories & Tasks** - Convert the session into minimal implementation stories (< 30 min each) and external tasks
4. **Build Stories** - Implement each story with complete context from linked features, specs, and models

The session-driven approach ensures changes are tracked systematically, and distillation creates focused, actionable stories with all necessary context.

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
