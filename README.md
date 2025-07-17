# Context Engineering with Cursor

A comprehensive template repository designed for systematic development with Cursor IDE. This template provides a structured framework to convert human-assembled requirements and context into logical implementation plans through a three-phase workflow: Brainstorming, Planning, and Refinement.

## 🎯 Purpose

This template helps development teams transform high-level ideas into executable technical implementations by providing:
- A systematic approach to requirement gathering and analysis
- Structured documentation templates for technical specifications
- A proven workflow for planning and refining implementation details
- Clear completion criteria and validation checkpoints for each phase
- Context-driven development with traceable documentation

## 🏗️ Repository Structure

```
.cursor/
├── modes/                          # Mode definitions and instructions
│   ├── brainstorm.md              # Brainstorming mode guidelines
│   ├── plan.md                    # Planning mode guidelines
│   └── refine.md                  # Refinement mode guidelines
└── context-engineering/
    ├── brainstorming/             # Requirements and phase definitions
    │   ├── PRD.md                 # Product Requirements Document
    │   ├── TRD.md                 # Technical Requirements Document
    │   └── Phases.md              # Phase definitions and dependencies
    ├── planning/                  # Implementation planning
    │   ├── Context.md            # Implementation context and references
    │   └── Phase{N}.md           # High-level tasks for each phase
    └── refining/                  # Detailed implementation tickets
        └── Phase{N}.md           # Refined tickets for each phase
```

## 🔄 Three-Phase Workflow

### Phase 1: Brainstorming 🧠

**Purpose**: Iterative process of research and analysis to complete requirements documentation.

**Key Files**:
- `PRD.md`: Product requirements, user stories, market analysis
- `TRD.md`: Technical architecture, security, testing strategy
- `Phases.md`: High-level phase definitions and dependencies

**Key Activities**:
- Define product requirements and success metrics
- Document technical architecture decisions
- Create phase structure with clear objectives
- Establish dependencies and milestones
- Generate supporting diagrams and documentation

**Completion Criteria**:
- Complete PRD with no open questions
- Complete TRD with no open questions
- Defined phases with clear objectives and dependencies
- Validated requirements against business goals

### Phase 2: Planning 📋

**Purpose**: Transform brainstorming output into logically ordered implementation tasks with relevant context.

**Key Files**:
- `Context.md`: Implementation references and resources
- `Phase{N}.md`: High-level tasks for each phase

**Key Activities**:
- Collect and organize implementation context
- Break down phase objectives into tasks
- Associate relevant context with each task
- Establish task dependencies and order
- Validate coverage of requirements

**Completion Criteria**:
- Tasks align with phase objectives
- Context references are documented
- Dependencies are identified
- Clear task boundaries and scope
- Security and compliance tasks included

### Phase 3: Refining 🔍

**Purpose**: Create detailed, implementation-ready tickets with all necessary context.

**Key Files**:
- `refining/Phase{N}.md`: Detailed implementation tickets

**Key Activities**:
- Break down tasks into detailed steps
- Include specific technical requirements
- Define comprehensive test criteria
- Document acceptance requirements
- Link relevant implementation context

**Completion Criteria**:
- Detailed implementation steps
- Complete test requirements
- Clear acceptance criteria
- Documented dependencies
- Referenced context guides
- Status reflects refinement state

## 🚀 Getting Started

1. **Use this template** to create a new repository
2. **Review the mode files** in `.cursor/modes/` to understand each phase
3. **Start Brainstorming**:
   - Begin with product requirements in PRD.md
   - Document technical decisions in TRD.md
   - Define phases in Phases.md
4. **Move to Planning**:
   - Gather implementation context in Context.md
   - Create phase-specific task files
   - Associate context with tasks
5. **Begin Refinement**:
   - Create detailed implementation tickets
   - Include all necessary technical details
   - Define comprehensive test requirements

## 📋 Usage Guidelines

### For Product Managers
- Focus on completing the PRD.md first
- Define clear success metrics
- Ensure user stories are comprehensive
- Validate market analysis
- Review phase dependencies

### For Technical Leads
- Document architecture decisions in TRD.md
- Define clear technical boundaries
- Establish testing strategy
- Review security requirements
- Validate implementation approach

### For Developers
- Review context documentation thoroughly
- Follow ticket implementation steps
- Ensure test coverage requirements
- Use provided context references
- Update ticket status appropriately

## 🎯 Best Practices

1. **Follow the Mode Guidelines**
   - Use appropriate prompts for each mode
   - Complete validation checkpoints
   - Maintain focus on current phase

2. **Document Everything**
   - Keep context references up to date
   - Include rationale for decisions
   - Document dependencies clearly

3. **Validate Continuously**
   - Check completion criteria
   - Review cross-document references
   - Verify requirement coverage

4. **Maintain Focus**
   - Work on one phase at a time
   - Complete current mode before switching
   - Keep scope manageable

## 🤝 Contributing

We welcome contributions to improve this template:
- Submit issues for suggestions or problems
- Create pull requests with improvements
- Share your customizations and adaptations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Created by alto9 to provide a structured approach to context engineering with Cursor IDE. This template aims to bridge the gap between high-level requirements and detailed implementation through systematic context management.