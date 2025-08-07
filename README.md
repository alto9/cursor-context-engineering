# Context Engineering with Cursor

A comprehensive template repository designed for systematic development with Cursor IDE. This template provides a structured framework to convert human-assembled requirements and context into logical implementation plans through a three-phase workflow: Brainstorming, Planning, and Refinement.

## 🎯 Purpose

This template helps development teams transform high-level ideas into executable technical implementations by providing:
- A systematic approach to requirement gathering and analysis
- Structured documentation templates for technical specifications
- A proven workflow for planning and refining implementation details
- Clear completion criteria and validation checkpoints for each epic
- Context-driven development with traceable documentation

## 🏗️ Repository Structure

```
ai/
├── tools/                          # Templates, modes, and guidelines
│   ├── modes/                     # Mode definitions and instructions
│   │   ├── brainstorm.md          # Brainstorming mode guidelines
│   │   ├── plan.md                # Planning mode guidelines
│   │   └── refine.md              # Refinement mode guidelines
│   ├── formats/                   # Document format templates
│   │   ├── PRD.md                 # Product Requirements Document format
│   │   ├── TRD.md                 # Technical Requirements Document format
│   │   ├── QRD.md                 # Quality Requirements Document format
│   │   ├── CRD.md                 # Context Requirements Document format
│   │   ├── Roadmap.md             # Roadmap format
│   │   ├── Epic.md                # Epic format
│   │   ├── Task.md                # Task format
│   │   └── Ticket.md              # Ticket format
│   ├── prompts/                   # Mode-specific prompts
│   └── SizingGuidelines.md        # Sizing and estimation guidelines
├── brainstorm/                    # Requirements and epic definitions
│   ├── PRD.md                     # Product Requirements Document
│   ├── TRD.md                     # Technical Requirements Document
│   ├── QRD.md                     # Quality Requirements Document
│   ├── CRD.md                     # Context Requirements Document
│   ├── Roadmap.md                 # Project roadmap and epics
│   ├── OpenQuestions.md           # Unresolved questions
│   ├── Checklist.md               # Brainstorm completion checklist
│   └── diagrams/                  # Supporting diagrams and visuals
├── plan/                          # Implementation planning and context
│   ├── Epic{number}.md            # Epic implementation plans
│   └── Checklist.md               # Plan completion checklist
├── refine/                        # Detailed implementation tickets
│   ├── Epic{number}/              # Epic-specific refinement folders
│   └── Checklist.md               # Refine completion checklist
├── Index.md                       # Complete documentation index
└── README.md                      # AI folder documentation
```

## 🔄 Three-Phase Workflow

### Phase 1: Brainstorming 🧠

**Purpose**: Iterative process of research and analysis to complete requirements documentation.

**Key Activities**:
- Define product requirements and success metrics
- Document technical architecture decisions
- Create epic structure with clear objectives
- Establish dependencies and milestones
- Generate supporting diagrams and documentation

**Completion Criteria**:
- Complete product requirements with no open questions
- Complete technical requirements with no open questions
- Defined epics with clear objectives and dependencies
- Validated requirements against business goals
- All items in the Brainstorm Completion Checklist are completed

### Phase 2: Planning 📋

**Purpose**: Transform brainstorming output into logically ordered implementation tasks with relevant context.

**Key Activities**:
- Collect and organize implementation context
- Break down epic objectives into tasks
- Associate relevant context with each task
- Establish task dependencies and order
- Validate coverage of requirements

**Completion Criteria**:
- Tasks align with epic objectives
- Context references are documented
- Dependencies are identified
- Clear task boundaries and scope
- Security and compliance tasks included
- All items in the Plan Completion Checklist are completed

### Phase 3: Refining 🔍

**Purpose**: Create detailed, implementation-ready tickets with all necessary context.

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
- All items in the Refine Completion Checklist are completed

## 🛠️ Tools and Resources

The `ai/tools/` folder provides comprehensive resources to support the three-phase workflow:

### Mode Guidelines (`ai/tools/modes/`)
- **brainstorm.md**: Detailed guidelines for the brainstorming phase
- **plan.md**: Instructions for the planning phase  
- **refine.md**: Guidelines for the refinement phase

### Document Format Templates (`ai/tools/formats/`)
- **PRD.md**: Product Requirements Document template
- **TRD.md**: Technical Requirements Document template
- **QRD.md**: Quality Requirements Document template
- **CRD.md**: Context Requirements Document template
- **Roadmap.md**: Project roadmap template
- **Epic.md**: Epic documentation template
- **Task.md**: Task definition template
- **Ticket.md**: Implementation ticket template

### Prompts and Guidelines
- **prompts/**: Mode-specific prompts for AI assistance
- **SizingGuidelines.md**: Estimation and sizing guidelines

### Navigation and Index
- **ai/Index.md**: Complete index of all documents with objectives and links
- **ai/README.md**: Detailed documentation about the AI folder structure

## 🚀 Getting Started

1. **Use this template** to create a new repository
2. **Review the mode files** in `ai/tools/modes/` to understand each phase
3. **Check the Index** at `ai/Index.md` for complete documentation overview
4. **Start Brainstorming**:
   - Document product requirements using format templates
   - Define technical architecture and quality requirements
   - Establish project epics and roadmap
   - Complete the Brainstorm Completion Checklist
5. **Move to Planning**:
   - Gather implementation context
   - Create epic-specific tasks using Epic format
   - Associate context with tasks
   - Complete the Plan Completion Checklist
6. **Begin Refinement**:
   - Create detailed implementation tickets
   - Include all necessary technical details
   - Define comprehensive test requirements
   - Complete the Refine Completion Checklist

## 📋 Usage Guidelines

### For Product Managers
- Focus on product requirements first
- Define clear success metrics
- Ensure user stories are comprehensive
- Validate market analysis
- Review epic dependencies

### For Technical Leads
- Document architecture decisions
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
   - Maintain focus on current epic

2. **Document Everything**
   - Keep context references up to date
   - Include rationale for decisions
   - Document dependencies clearly

3. **Validate Continuously**
   - Check completion criteria
   - Review cross-document references
   - Verify requirement coverage

4. **Maintain Focus**
   - Work on one epic at a time
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