# Context Engineering

A structured approach to project planning and implementation using AI-assisted context engineering. This system provides a systematic workflow for breaking down complex projects from high-level strategy to detailed implementation tickets.

## Overview

Context Engineering is a methodology that leverages AI to systematically plan, organize, and execute software projects. It transforms vague project ideas into detailed, actionable implementation plans through a three-phase workflow:

1. **Brainstorm** - High-level project planning and requirements gathering
2. **Plan** - Detailed epic breakdown with task arrays
3. **Refine** - Implementation-level ticket creation

## Workflow Modes

### 🧠 Brainstorm Mode
**Purpose**: Transform project ideas into comprehensive project roadmaps and requirements documents.

**Outputs**:
- `PRD.md` - Product Requirements Document
- `TRD.md` - Technical Requirements Document  
- `QRD.md` - Quality Requirements Document (testing strategy and quality assurance)
- `CRD.md` - Contextual Requirements Document (external references and best practices)
- `Roadmap.md` - High-level project roadmap with epics

**Key Activities**:
- Market analysis and user story development
- Technical architecture decisions
- Quality strategy and testing approach
- Epic identification and dependencies
- Risk assessment and mitigation strategies
- Success metrics and KPI definition
- External context gathering and documentation

### 📋 Plan Mode
**Purpose**: Convert roadmap epics into detailed implementation plans with task arrays.

**Outputs**:
- `plan/Epic{N}.md` - Detailed epic files with task arrays

**Key Activities**:
- Epic-level planning using the Epic.md template
- Task breakdown following the Task.md format
- Context hint integration from CRD.md
- Dependency mapping between tasks
- Effort estimation and prioritization
- Cross-referencing with PRD, TRD, and QRD requirements

### 🔧 Refine Mode
**Purpose**: Convert high-level tasks into detailed implementation tickets.

**Outputs**:
- `refine/Epic{N}Ticket{M}.md` - Detailed implementation tickets

**Key Activities**:
- Task-to-ticket conversion using the Ticket.md template
- Detailed technical specifications
- Comprehensive testing requirements
- Acceptance criteria definition
- Implementation step documentation
- Security and performance considerations

## File Structure

```
ai/
├── README.md                    # This file
├── brainstorm/                  # Brainstorm mode outputs
│   ├── PRD.md                  # Product Requirements Document
│   ├── TRD.md                  # Technical Requirements Document
│   ├── QRD.md                  # Quality Requirements Document
│   ├── CRD.md                  # Contextual Requirements Document
│   ├── Roadmap.md              # High-level project roadmap
│   └── diagrams/               # Supporting diagrams and visuals
│       └── README.md           # Diagram documentation
├── plan/                       # Plan mode outputs
│   ├── Epic1.md                # Detailed epic 1 with tasks
│   ├── Epic2.md                # Detailed epic 2 with tasks
│   └── ...                     # Additional epics
├── tickets/                    # Refine mode outputs
│   ├── Epic1Ticket1.md         # Implementation ticket 1.1
│   ├── Epic1Ticket2.md         # Implementation ticket 1.2
│   └── ...                     # Additional tickets
└── tools/                      # Workflow tools and templates
    ├── formats/                # Format templates
    │   ├── README.md           # Format documentation
    │   ├── Roadmap.md          # Roadmap template
    │   ├── Epic.md             # Epic template
    │   ├── Task.md             # Task template
    │   ├── Ticket.md           # Ticket template
    │   ├── PRD.md              # Product Requirements Document template
    │   ├── TRD.md              # Technical Requirements Document template
    │   └── CRD.md              # Contextual Requirements Document template
    ├── modes/                  # Mode definitions
    │   ├── brainstorm.md       # Brainstorm mode instructions
    │   ├── plan.md             # Plan mode instructions
    │   └── refine.md           # Refine mode instructions
    └── prompts/                # AI prompts for each mode
        ├── brainstorm.md       # Brainstorm mode prompts
        ├── plan.md             # Plan mode prompts
        └── refine.md           # Refine mode prompts
```

## Getting Started

### 1. Initialize Your Project
Start by creating the basic folder structure:
```bash
mkdir -p ai/brainstorm ai/plan ai/tickets
```

### 2. Begin with Brainstorm Mode
Use brainstorm mode to create your initial project documentation:
- Define your product requirements in `brainstorm/PRD.md`
- Document technical requirements in `brainstorm/TRD.md`
- Define quality strategy in `brainstorm/QRD.md`
- Gather external references in `brainstorm/CRD.md`
- Create your project roadmap in `brainstorm/Roadmap.md`

### 3. Move to Plan Mode
For each epic in your roadmap:
- Create detailed epic files in `plan/Epic{N}.md`
- Break down epics into tasks using the Task.md format
- Include context hints and dependencies
- Cross-reference with PRD and TRD requirements

### 4. Complete with Refine Mode
For each task in your epics:
- Create detailed tickets in `tickets/Epic{N}Task{M}.md`
- Add comprehensive technical specifications
- Define testing requirements and acceptance criteria
- Include security and performance considerations

## Key Principles

### Context-Driven Development
- All planning incorporates relevant context from external sources
- Best practices and implementation guides are integrated throughout
- Cross-referencing maintains traceability between requirements and implementation
- CRD.md serves as the central repository for external references

### Quality-First Approach
- Comprehensive testing requirements at every level
- Clear acceptance criteria and success metrics
- Security and performance considerations built-in
- Unit testing requirements included in all tickets

### Iterative Refinement
- Each mode builds upon the previous one
- Ambiguities are resolved progressively
- Continuous validation and review processes
- Clear completion criteria for each mode

## Template System

The workflow uses standardized templates to ensure consistency:

- **Roadmap.md** - Strategic project planning template
- **Epic.md** - Epic planning template with task arrays
- **Task.md** - High-level task planning template
- **Ticket.md** - Detailed implementation ticket template
- **PRD.md** - Product Requirements Document template
- **TRD.md** - Technical Requirements Document template
- **QRD.md** - Quality Requirements Document template
- **CRD.md** - Contextual Requirements Document template

Each template includes sections for:
- Context hints and external references
- Dependencies and relationships
- Quality assurance requirements
- Success criteria and acceptance criteria

## Mode-Specific Features

### Brainstorm Mode
- **Creative Collaboration**: Acts as a personal idea generation tool
- **Iterative Refinement**: Seeks input to make ideas more relevant
- **Comprehensive Documentation**: Ensures all requirements are captured (Product, Technical, Quality, Context)
- **External Context**: Gathers and documents relevant external references

### Plan Mode
- **Epic Focus**: Works on one epic at a time from the roadmap
- **Context Integration**: Analyzes CRD.md and incorporates relevant context
- **Task Breakdown**: Converts epic objectives into actionable tasks
- **Dependency Mapping**: Identifies and documents task relationships

### Refine Mode
- **Task-to-Ticket Conversion**: Transforms high-level tasks into detailed tickets
- **Technical Specification**: Provides comprehensive implementation details
- **Testing Requirements**: Includes unit, integration, and performance testing
- **Acceptance Criteria**: Defines measurable success criteria

## Best Practices

### Context Management
- Keep CRD.md updated with relevant external references
- Use consistent formatting for context hints: "Category - Item Title"
- Cross-reference context items throughout the planning process
- Include API documents, MCP tools, web pages, and internal documents

### File Naming
- Use consistent naming conventions: `Epic{N}.md` and `Epic{N}Task{M}.md`
- Maintain clear version control and change tracking
- Document any deviations from standard templates

### Quality Assurance
- Include unit testing requirements in all tickets
- Define measurable acceptance criteria
- Consider security, performance, and monitoring requirements
- Plan for error handling and edge cases

## Integration with Development

The context engineering workflow integrates seamlessly with development processes:

- **CI/CD Integration**: Tickets include deployment and testing requirements
- **Code Review**: Acceptance criteria guide review processes
- **Monitoring**: Observability requirements are built into tickets
- **Documentation**: Each level includes documentation requirements

## Completion Criteria

### Brainstorm Mode
- Complete PRD with no open questions
- Complete TRD with no open questions
- Complete QRD with no open questions
- Complete CRD with full list of external references
- Complete roadmap with logically ordered implementation epics

### Plan Mode
- Tasks align with epic objectives
- Context hints are properly referenced from CRD
- Dependencies are clearly identified
- Clear task boundaries and scope
- Security and compliance tasks included

### Refine Mode
- Detailed implementation steps
- Complete test requirements
- Clear acceptance criteria
- Documented dependencies
- Referenced context guides
- Status reflects refinement state

## Troubleshooting

### Common Issues
- **Missing Context**: Ensure CRD.md is populated with relevant references
- **Incomplete Templates**: Follow the full template structure for each format
- **Ambiguous Requirements**: Use brainstorm mode to clarify before planning
- **Dependency Gaps**: Review epic dependencies before creating tickets

### Validation Checklist
- [ ] All templates follow the format specifications
- [ ] Context hints are properly referenced from CRD
- [ ] Dependencies are clearly identified
- [ ] Testing requirements are comprehensive
- [ ] Acceptance criteria are measurable
- [ ] File naming follows conventions

## Contributing

To improve the context engineering workflow:
1. Update templates in `tools/formats/`
2. Enhance mode instructions in `tools/modes/`
3. Add new context categories to CRD.md
4. Improve documentation and examples

## License

This context engineering system is part of the cursor-context-engineering project.
