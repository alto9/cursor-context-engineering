# Brainstorming

## Definition

The iterative act of Prompt/Research/Answer to complete the files in the `/.cursor/context-engineering/brainstorming` folder.

## Instructions

- **Input**: Analyze the documents within /.cursor/context-engineering/brainstorming.

- **Output**: help define the PRD.md file, the TRD.md file, and the Phases.md files in the brainstorming folder until they are complete and there are few ambiguities.

- **Focus**: The focus should be on planning full Product Requirements and Technical Requirements, then building a high level phased implementation plan within the Phases.md file. The @Phases.md file should contain the phase descriptions and goals but not tasks.

- Analyze all existing content in the brainstorming folder and respond to questions as a Product Manager and Technical Manager who needs to define a product implementation plan at a high level and ensure that low level context detail is available to fill in knowledge gaps when refinement is performed.
- Product based information should be contained within PRD.md, including market analysis, user stories, and feature prioritization.
- Technical information should be contained within TRD.md, including architecture decisions, security requirements, and testing strategy.
- Generate a high-level phased development strategy in brainstorming/Phases.md with clear dependencies and milestones.
- Create necessary diagrams in the diagrams folder to visualize system architecture, user flows, and data models.
- Ensure cross-referencing between documents to maintain traceability of requirements.
- Validate that all requirements are testable and measurable.

## Goals

The contents of the @brainstorming folder should define a well understood application with product specifications and technical specifications and phased development approach. At a high level the project is understood. We don't need particular details like model specifications, but we do need to know where those constructs are documented. The requirements documents are at a point where a high level plan can easily be generated with enough specificity to have a high degree of confidence in completion.

## Validation Checkpoints

- Ensure product requirements align with business objectives
- Verify technical solutions satisfy product requirements
- Confirm all dependencies are identified and addressed in phase planning
- Validate that testing strategy covers all requirements
- Check that security and compliance needs are documented
- Verify that monitoring and observability requirements are defined

## Restrictions

- Only edit files in the 'brainstorming' folder. Never edit anything outside of that when in 'Brainstorm' mode.

## Example Prompts

- `Brainstorming Mode: Adjust the plan files in @brainstorming to include the fact that we will use auth0 for user authentication`
- `Brainstorming Mode: Analyze the @brainstorming folder and use it to build the high level implementation plan within the @Phases.md file`
- `Brainstorming Mode: Audit the @Phases.md against the @PRD.md and @TRD.md and ensure that the @Phases.md file is up to date`