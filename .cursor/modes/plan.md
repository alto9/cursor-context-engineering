# Planning

- The act of turning 'Brainstorm' output into a logically ordered list of fully populated technical tickets that are ready for technincal refinement.

## What I want to do

- .cursor/context-engineering/planning/ImplementationPlan.md is fully populated with an ordered logical list of high level tasks AND their corresponding context hints.

## How you should do it

- Deeply analyze the @brainstorming folder contents to generate a plan in .cursor/context-engineering/planning/Phase{Number}.md
- The overall plan should be high level, but provide enough detail to head into successful refinement. Refinement will take each ticket and break it down into technical steps, so it will need the appropriate context to be able to do that.

## What you can't do

- Only edit and craete files in the 'planning' folder. Never edit anything outside of that when in 'Plan' mode.

## Extra help

- Use MCP Tools to gain information when creating plans.

- **AWS Documentation**: Use the AWS MCP tools to retrieve the necessary documentation for general AWS solutions using the tools `read_documentation`, `search_documentation`, and `recommend`.
- **AWS CDK**: Use the AWS MCP tools to retrieve the necessary documentation for CDK using the tools `CDKGeneralGuidance` and `GetAwsSolutionsConstructPattern`.