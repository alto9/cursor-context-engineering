# Contributing to Glam

Thank you for your interest in contributing to Glam! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/glam.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Test your changes by pressing F5 in VSCode
6. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 20+
- VSCode 1.80+
- TypeScript 5+

### Building the Extension

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch
```

### Testing

Press `F5` in VSCode to launch the Extension Development Host with your changes loaded.

## Code Style

- Use TypeScript for all source code
- Follow existing code formatting conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose

## File Structure

```
src/
├── extension.ts                 # Main extension entry point
├── commands/                    # Command implementations
│   ├── DistillDecisionCommand.ts
│   └── ConvertToTasksCommand.ts
├── panels/                      # Webview panels
│   └── NewDecisionPanel.ts
└── utils/                       # Utility functions
    ├── PromptGenerator.ts
    └── FileParser.ts
```

## Adding New Commands

1. Create a new command file in `src/commands/`
2. Implement the command logic
3. Register the command in `src/extension.ts`
4. Add the command to `package.json` contributions
5. Update README.md with command documentation

## Adding New Features

1. Create an issue describing the feature
2. Get feedback from maintainers
3. Implement the feature in a feature branch
4. Write tests if applicable
5. Update documentation
6. Submit a pull request

## Prompt Generation Guidelines

When adding or modifying prompt generation:

1. **Be Specific**: Prompts should be clear and actionable
2. **Include Context**: Always include relevant file contents and relationships
3. **Be Structured**: Use consistent formatting with clear sections
4. **Avoid Bloat**: Include only necessary context to keep prompts efficient
5. **Test Thoroughly**: Verify prompts work well with AI agents

## Pull Request Process

1. Update the CHANGELOG.md with your changes
2. Update documentation if needed
3. Ensure your code compiles without errors
4. Write a clear PR description explaining your changes
5. Link any related issues

## Reporting Bugs

When reporting bugs, please include:

- VSCode version
- Glam extension version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

## Feature Requests

We welcome feature requests! Please:

- Check if the feature already exists or is planned
- Clearly describe the feature and its benefits
- Provide use cases and examples
- Be open to discussion and refinement

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Maintain professionalism in all interactions

## Questions?

Feel free to open an issue with your questions or reach out to the maintainers.

Thank you for contributing to Glam!

