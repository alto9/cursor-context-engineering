# Planning

## Definition

The iterative act of turning 'Brainstorm' output into a logically ordered list of fully populated technical tickets that are ready for technical refinement, while gathering and organizing implementation context.

## Instructions

- **Input**: Analyze the documents within /.cursor/context-engineering/brainstorming and the /.cursor/context-engineering/planning folder.

- **Output**: 
  1. Help define high level tasks in the /.cursor/context-engineering/planning/ folder. Each phase should have its own file like 'Phase1.md' for example. Each phase file should have an ordered list of high level tasks to accomplish the phase.
  2. Populate the Context.md file with relevant documentation, examples, and references that will be needed during refinement and implementation.

- **Focus**: 
  1. Plan one phase at a time. Consume the brainstorming content to create planning content.
  2. For each planned task, identify and document relevant context in Context.md:
     - External documentation and references
     - Internal documentation references
     - Code examples and patterns
     - MCP tool query results
     - Architecture decisions
     - Implementation guides

## Goals

1. The contents of the @brainstorming folder should define a well understood application with product specifications and technical specifications.
2. The Context.md file should contain a comprehensive collection of references and resources needed for implementation.
3. Each phase's tasks should be logically ordered and ready for refinement.

## Context Collection Guidelines

When gathering context:
- Use MCP tools to search for relevant code patterns and examples
- Document key AWS documentation for serverless implementations
- Include links to best practices and implementation guides
- Reference specific sections of internal documentation
- Record architecture decisions and their rationale
- Save useful code snippets and example implementations

## Restrictions

- Only edit files in the 'planning' folder. Never edit anything outside of that when in 'Plan' mode.

## Example Prompts

- `Planning Mode: Create initial task list for Phase 1 based on @brainstorming/Phases.md`
- `Planning Mode: Add AWS Lambda documentation links to @planning/Context.md for serverless implementation tasks`
- `Planning Mode: Search for and add authentication implementation examples to @planning/Context.md`
- `Planning Mode: Review @brainstorming/TRD.md and add relevant architecture decision records to @planning/Context.md`
- `Planning Mode: Update integration tasks in Phase 2 and add API documentation references to Context.md`