# Planning

## Behavior

- Help me assemble the proper context to plan a single epic from the [Roadmap](/ai/brainstorm/Roadmap.md).
- Maintain epic details and a logically ordered list of highly defined tasks for the epic.

## Imperatives

- [ ] **Analyze Index**: Analyze the [Index](/ai/Index.md) to fully understand the document structure.
- [ ] **Epic Document**: Work to distill one epic from the [Roadmap](/ai/brainstorm/Roadmap.md) into a file in the [Plan Folder](/ai/plan/) folder. For example, if we were planning Epic 1 of the [Roadmap](/ai/brainstorm/Roadmap.md), we would need to generate that plan within [Epic 1](/ai/plan/Epic1.md). When generating a plan, use the [Epic Format](/ai/tools/formats/Epic.md) as a template. With each epic will be high level tasks that should also use the appropriate [Task Format](/ai/tools/formats/Task.md).
- [ ] **CRD (Contextual Requirements Document)**: The [Context Requirements Document](/ai/brainstorm/CRD.md) should be analyzed while planning. When generating a plan document, cross reference the epic goals with the CRD. For example, if the Task being maintained involves generating a CDK stack, the CDK documentation item should be copied AS-IS from the [Context Requirements Document](/ai/brainstorm/CRD.md) and placed in the Task Context Hints, so that we will have additional contextual help when we refine the ticket. Do not place anything in Context Hints that does not exist in the [Context Requirements Document](/ai/brainstorm/CRD.md).
- [ ] **Task Size Restraints**: Use the [Sizing Guidelines](/ai/tools/SizingGuidelines.md) as a guide to provide an estimate to each task. ANY TASK ESTIMATED TO BE `Multi-Day Task` or higher should be split into smaller tasks. Do not make subtasks. 
- [ ] **Generating Epic Tasks**: Follow the following instructions closely when generating epic tasks.

    - All planned tasks should align with objectives in the [Roadmap](/ai/brainstorm/Roadmap.md)
    - Each task follows the Task.md [Task Format](/ai/tools/formats/Task.md)
    - Each task has relevant Context Hints copied from [CRD](/ai/brainstorm/CRD.md)
    - Dependencies between tasks are clearly identified
    - Each task has clear boundaries and scope
    - Epic-Relevant Technical requirements from [Technical Requirements Document](/ai/brainstorm/TRD.md) are covered by planned tasks
    - Epic-Relevant Product requirements from [Product Requirements Document](/ai/brainstorm/PRD.md) are addressed in task planning
    - Epic-Relevant Quality requirements from [Quality Requirements Document](/ai/brainstorm/QRD.md) are addressed in task planning
    - Ensure security and compliance requirements have associated tasks
    - Verify that monitoring and observability requirements are planned

- [ ] **Plan Cohesion**: After ANY change to a document in [Plan Folder](/ai/plan/), re-examine the other documents in the plan folder to see if they should be updated based on that change. All of these files represent a living project plan and should be kept up to date at all times.