# Glam - Context Engineering for Agentic Development

A VSCode extension that helps engineers use proper context engineering to build and maintain software using Agentic development practices. Glam provides a structured approach to creating decisions, features, specs, and tasks with intelligent prompt generation for AI-assisted development.

## 🎯 What is Glam?

Glam is a workflow tool designed to help developers create well-structured, context-rich prompts for AI agents. Rather than executing tasks directly, Glam generates intelligent prompts that include all necessary context, making it easy to work with AI assistants like Cursor Agent.

**Key Benefits:**
- Build comprehensive context systematically
- Maintain consistency with standardized formats
- Improve AI accuracy with complete context
- Create traceable documentation linking decisions to implementation
- Reduce rework by getting it right the first time

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

## 🚀 Commands

Glam provides three main commands accessible from the Command Palette (`Cmd/Ctrl+Shift+P`) or via right-click context menus:

### 1. Glam: New Decision
Creates a prompt for a new decision document.

**How to use:**
- Open Command Palette and select "Glam: New Decision"
- OR right-click on the `ai/decisions` folder and select "Glam: New Decision"
- Fill out the form with decision details
- Copy the generated prompt from the Glam output panel
- Paste into Cursor Agent to create the decision file

### 2. Glam: Distill Decision into Features and Specs
Generates a prompt to convert a decision into features and specs.

**How to use:**
- Right-click on a `.decision.md` file and select the command
- OR use Command Palette and select the decision file
- Copy the generated prompt from the Glam output panel
- Paste into Cursor Agent to create/update features and specs

### 3. Glam: Convert Decision to Tasks
Generates a prompt to break down a decision into implementation tasks.

**How to use:**
- Right-click on a `.decision.md` file and select the command
- OR use Command Palette and select the decision file
- Copy the generated prompt from the Glam output panel
- Paste into Cursor Agent to generate task files

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

## 🛠️ Installation

### From Source (Development)
1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to open a new VSCode window with the extension loaded

### From VSIX (When Published)
```bash
code --install-extension glam-0.1.0.vsix
```

## 📖 Getting Started

1. Open or create a project in VSCode
2. Open the Command Palette (`Cmd/Ctrl+Shift+P`)
3. Type "Glam: New Decision" to start your first decision
4. Follow the three-step workflow: Decision → Features/Specs → Tasks

## 🎨 Features

- **Beautiful Webview Forms** - Modern UI for data entry
- **Intelligent Prompt Generation** - Context-aware prompts that include related files
- **Automatic File Discovery** - Finds and links related decisions, features, specs, and contexts
- **Frontmatter Parsing** - Extracts metadata from markdown files
- **Right-Click Integration** - Context menu support for quick access
- **Output Panel Display** - Clean, formatted prompts ready to copy

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