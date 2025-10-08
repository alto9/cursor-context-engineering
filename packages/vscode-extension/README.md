# Glam VSCode Extension

VSCode extension that helps engineers use proper context engineering to build and maintain software using Agentic development practices.

## Features

- **Glam: New Decision** - Interactive webview form for creating new decision documents
- **Glam: Distill Decision into Features and Specs** - Generate prompts to convert decisions into features and specs
- **Glam: Convert Decision to Tasks** - Generate prompts to break down decisions into implementation tasks
- **Context Menu Integration** - Right-click on files and folders for quick access
- **Output Panel** - Clean, formatted prompts ready to copy and paste

## Installation

### From Source (Development)

```bash
# From the monorepo root
npm install
npm run build -w @glam/vscode-extension

# Package the extension
cd packages/vscode-extension
vsce package

# Install
code --install-extension glam-0.1.0.vsix
```

### From VSIX

```bash
code --install-extension glam-0.1.0.vsix
```

## Usage

### Create a New Decision

1. Open Command Palette (`Cmd/Ctrl+Shift+P`)
2. Type "Glam: New Decision"
3. OR right-click on the `ai/decisions` folder
4. Fill out the form with:
   - What is changing?
   - Why is it changing?
   - Summary of the proposed change?
   - Options considered?
5. Click "Generate Prompt"
6. Copy the prompt from the Glam output panel
7. Paste into Cursor Agent to create the decision file

### Distill Decision into Features and Specs

1. Right-click on a `.decision.md` file
2. Select "Glam: Distill Decision into Features and Specs"
3. OR use Command Palette and select the decision file
4. Copy the generated prompt
5. Paste into Cursor Agent to create/update features and specs

### Convert Decision to Tasks

1. Right-click on a `.decision.md` file
2. Select "Glam: Convert Decision to Tasks"
3. OR use Command Palette and select the decision file
4. Copy the generated prompt
5. Paste into Cursor Agent to generate task files

## Project Structure

Glam works with the following directory structure:

```
your-project/
└── ai/
    ├── decisions/     # Architecture Decision Records
    ├── features/      # Feature definitions (Gherkin)
    ├── specs/         # Technical specifications
    ├── contexts/      # Context guidance
    ├── tasks/         # Implementation tasks
    └── docs/          # Supporting documentation
```

## Development

```bash
# From the monorepo root
npm install

# Build the extension
npm run build -w @glam/vscode-extension

# Watch mode
npm run watch -w @glam/vscode-extension

# Lint
npm run lint -w @glam/vscode-extension

# Package for distribution
npm run vscode:package
```

## Architecture

```
src/
├── extension.ts                    # Extension entry point
├── commands/                       # Command implementations
│   ├── DistillDecisionCommand.ts
│   └── ConvertToTasksCommand.ts
├── panels/                         # Webview panels
│   └── NewDecisionPanel.ts
└── utils/                          # Utilities
    ├── PromptGenerator.ts          # Prompt generation logic
    └── FileParser.ts               # Frontmatter parsing
```

## License

MIT

