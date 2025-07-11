# Context Engineering with Cursor

A comprehensive template repository designed for systematic development with Cursor IDE. This template provides a structured framework to convert human-assembled requirements and context into logical implementation plans through a three-phase workflow.

## 🎯 Purpose

This template helps development teams transform high-level ideas into executable technical implementations by providing:
- A systematic approach to requirement gathering and analysis
- Structured documentation templates for technical specifications
- A proven workflow for planning and refining implementation details
- Clear completion criteria for each development phase

## 🏗️ Repository Structure

```
.cursor/
├── modes/                          # Workflow phase definitions
│   ├── brainstorm.md              # Brainstorming phase instructions
│   ├── plan.md                    # Planning phase instructions
│   └── refine.md                  # Refining phase instructions
└── context-engineering/
    ├── brainstorming/
    │   ├── PRD.md                 # Product Requirements Document
    │   ├── TRD.md                 # Technical Requirements Document
    │   ├── ContextGuide.md        # Context and documentation guide
    │   └── diagrams/              # Visual diagrams and flowcharts
    └── planning/
        └── ImplementationPlan.md  # Detailed implementation roadmap
```

## 🔄 Three-Phase Workflow

### Phase 1: Brainstorming 🧠

**Purpose**: Iterative process of research and analysis to complete requirements documentation.

**Key Activities**:
- Gather and analyze requirements through prompt/research/answer cycles
- Complete PRD (Product Requirements Document)
- Complete TRD (Technical Requirements Document)
- Develop Context Guide with detailed implementation context
- Create supporting diagrams and visual documentation

**Completion Criteria**: All requirements documents are complete with sufficient detail to generate a high-level implementation plan.

### Phase 2: Planning 📋

**Purpose**: Transform brainstorming output into a logically ordered list of technical tickets.

**Key Activities**:
- Analyze PRD, TRD, and all context documentation
- Generate ordered, logical implementation plan
- Create high-level tickets with context hints
- Ensure proper sequencing and dependencies

**Completion Criteria**: Complete ImplementationPlan.md with ordered technical tickets and context hints.

### Phase 3: Refining 🔍

**Purpose**: Fully populate technical tickets with implementation details for high-probability developer success.

**Key Activities**:
- Focus on one ticket at a time
- Break down complex changes into simple, logical steps
- Include detailed technical steps and pseudo-code
- Define clear acceptance criteria
- Ensure complete unit testing coverage
- Provide context clues for implementation

**Completion Criteria**: Each ticket reaches "Refinement Complete" status or maintains a list of open questions.

## 🚀 Getting Started

1. **Clone this template** to start a new project
2. **Begin with Brainstorming**: Work through the brainstorming phase to gather requirements
3. **Complete Planning**: Transform requirements into a structured implementation plan
4. **Refine Tickets**: Work through each ticket systematically until implementation-ready

## 📋 Usage Guidelines

### For Product Managers
- Use the brainstorming phase to define product requirements thoroughly
- Ensure all context and constraints are documented
- Focus on high-level understanding before diving into technical details

### For Technical Leads
- Use the planning phase to create logical implementation sequences
- Ensure technical requirements are comprehensive and actionable
- Balance high-level strategy with implementation practicality

### For Developers
- Use refined tickets as your implementation guide
- Follow the detailed technical steps and acceptance criteria
- Leverage context clues to gather additional information when needed

## 🎯 Best Practices

- **Complete each phase fully** before moving to the next
- **Maintain focus** on one ticket at a time during refinement
- **Document everything** - context is crucial for successful implementation
- **Use diagrams** to visualize complex systems and workflows
- **Test thoroughly** - ensure complete unit testing coverage for all changes

## 🤝 Contributing

This template is designed to be adapted to your specific needs. Feel free to:
- Modify the document templates to match your organization's standards
- Add additional phases or checkpoints as needed
- Customize the workflow to fit your development process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Created by alto9 to provide a structured approach to context engineering with Cursor IDE.