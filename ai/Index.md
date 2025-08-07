# Context Engineering Index

The documents below that have formats associated should contain content that should follow the format as a template.

## Brainstorm Documents

- **Product Requirements Document(PRD)**:
    - Link: [PRD](/ai/brainstorm/PRD.md)
    - Format: [PRD Format](/ai/tools/formats/PRD.md)
    - **PRD Population Objectives**:
        - Business objectives and value propositions
        - User personas and use cases
        - Feature requirements and priorities
        - Success metrics and KPIs
        - Integration requirements with external systems
- **Technical Requirements Document(TRD)**:
    - Link: [TRD](/ai/brainstorm/TRD.md)
    - Format: [TRD Format](/ai/tools/formats/TRD.md)
    - **TRD Population Objectives**:
        - Technical architecture decisions
        - Technology stack choices
        - API specifications and data models
        - Security and compliance requirements
        - Infrastructure and deployment strategies
- **Quality Requirements Document(QRD)**:
    - Link: [QRD](/ai/brainstorm/QRD.md)
    - Format: [QRD Format](/ai/tools/formats/QRD.md)
    - **QRD Population Objectives**:
        - Testing strategies and quality gates
        - Performance and reliability requirements
        - Security testing approaches
        - Monitoring and observability needs
        - Quality metrics and standards
- **Context Requirements Document(CRD)**:
    - Link: [CRD](/ai/brainstorm/CRD.md)
    - Format: [CRD Format](/ai/tools/formats/CRD.md)
    - **CRD Population Objectives**:
        - External dependencies and APIs
        - Documentation requirements
        - Tool integrations and MCP tools
        - Context sources and references
- **Roadmap**:
    - Link: [Roadmap](/ai/brainstorm/Roadmap.md)
    - Format: [Roadmap Format](/ai/tools/formats/Roadmap.md)
    - **Roadmap Population Objectives**:
        - Epic breakdown and sequencing
        - Dependencies between epics
        - Resource allocation and timelines
        - Risk mitigation strategies
        - Success criteria for each epic
- **Brainstorm Completion Checklist**:
    - Link: [Brainstorm Checklist](/ai/brainstorm/Checklist.md)
    - **Checklist Objectives**:
        - Ensure all critical open questions are resolved
        - Verify all brainstorm documents are cohesive and in sync
        - Confirm the Roadmap is complete

## Planning Documents

- **Epic{epic_number}.md**:
    - Link Format: `/ai/plan/Epic{epic_number}.md`
    - Link Example: [Epic 1](/ai/plan/Epic1.md)
    - Description: This file should contain the populated epic, along with a list of Stories ready for refinement. The Stories will be pollenated with Context Hints that will assist the developer during Refinement.
    - Format: [Epic Format](/ai/tools/formats/Epic.md)
- **Plan Completion Checklist**:
    - Link: [Plan Checklist](/ai/plan/Checklist.md)
    - **Checklist Objectives**:
        - Ensure all open questions are resolved
        - Verify all epics within the Roadmap have been planned with populated Epic documents

## Refinement Documents

- **Task{task-number}-Ticket{ticket-number}.md**:
    - Link Format: `/ai/plan/refine/Epic{epic-number}/Task{task-number}-Ticket{ticket-number}.md`
    - Link Example: [Ticket 1.1.1](/ai/refine/Epic1/Task1-Ticket1.md)
- **Refine Completion Checklist**:
    - Link: [Refine Checklist](/ai/refine/Checklist.md)
    - **Checklist Objectives**:
        - Ensure all epics within the Roadmap have been planned with populated Epic documents based on the Epic format
