# Refining

## Definition

The act of fully populating a technical ticket with details and context that allow a high probability of a developer being able to complete the ticket without needing any external information.

## Goals

The goal is to create fully detailed, implementation-ready tickets that developers can work on independently with all necessary contextual information and requirements provided.

## Validation Checkpoints

- Verify each ticket references relevant context from Context.md
- Confirm implementation steps are detailed and actionable
- Check that unit test requirements are specific and comprehensive
- Validate that acceptance criteria are measurable and testable
- Ensure all technical dependencies are identified and documented
- Verify that security considerations are addressed in implementation steps
- Check that performance requirements are clearly specified
- Confirm error handling and edge cases are documented
- Validate that the ticket scope remains focused and manageable
- Ensure monitoring and logging requirements are included
- Verify that any open questions are clearly documented and tracked
- Confirm the ticket status accurately reflects its refinement state
- Check that all necessary code snippets or pseudo-code are provided
- Validate that integration points with other components are well-defined

## Instructions

- **Input**: 
  1. Analyze the plans within /.cursor/context-engineering/planning/
  2. Review relevant context from @planning/Context.md for each ticket

- **Output**: Define detailed work tickets in the /.cursor/context-engineering/refining/ folder. Each phase should have its own file like 'Phase1.md' for example. Each phase file should have an ordered list of tasks to accomplish the phase.

- Maintain a focus of one ticket at a time.
- For each ticket:
  1. Review and reference relevant context from Context.md when refining
  2. Break down into the simplest most logical change
  3. Include full unit testing requirements 
  4. Add detailed technical steps including pseudo-code where helpful
  5. Define clear acceptance criteria
  6. Set appropriate status ('Refinement Complete' or 'Refinement')
  7. List any open questions if refinement is incomplete

## Ticket Template

```markdown
### Ticket [Phase].[Number]: [Title]

**Status**: [Refinement Complete|Refinement]

#### Context References
- [List relevant items from Context.md using the format: Category - Item Title]

#### Description
[Detailed description of the task]

#### Technical Details
- Implementation Steps:
  1. [Step-by-step implementation instructions]
  2. [Include code snippets or pseudo-code where helpful]

#### Dependencies
- [List any ticket dependencies]

#### Testing Requirements
- Unit Tests:
  - [Specific test scenarios]
  - [Expected coverage requirements]
- Integration Tests:
  - [Integration test scenarios if applicable]

#### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] All unit tests pass
- [ ] Code review completed

#### Open Questions
- [List any unresolved questions if status is 'Refinement']
```

## Restrictions

- Only edit files in the 'refining' folder. Never edit anything outside of that when in 'Refine' mode.

## Example Prompts

- `Refining Mode: Take the first task from @planning/Phase1.md and create a detailed implementation ticket in @refining/Phase1.md, including relevant context from @planning/Context.md`
- `Refining Mode: Review the database setup ticket in @refining/Phase1.md and add detailed steps based on the AWS documentation referenced in Context.md`
- `Refining Mode: Add unit test requirements and acceptance criteria to the auth implementation ticket in @refining/Phase1.md using the Auth0 examples from Context.md`
- `Refining Mode: Break down the large API integration task in @refining/Phase2.md into smaller tickets using the API documentation referenced in Context.md`
- `Refining Mode: Update the status of ticket #3 in @refining/Phase1.md after adding implementation details from Context.md`