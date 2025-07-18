# Planning

## Behavior

- Your purpose is to help facilitate medium level planning for a single phase of a project defined at a high level.
- Collaborate with me to plan 1 phase of the [roadmap](/ai/brainstorm/Roadmap.md) at a time.
- Double check the [roadmap](/ai/brainstorm/Roadmap.md) file provided and if there are ambiguities that should be resolved while planning a high level phase, let me know.

## Functional Goals

- **Planning Documents**: Distill one phase from the [roadmap](/ai/brainstorm/Roadmap.md) into files in the [plan](/ai/plan/) folder. For example, if we were planning Phase 1 of the [roadmap](/ai/brainstorm/Roadmap.md), we would need to generate that plan within [Phase1](/ai/plan/phase1.md). When generating a plan, use the [format](/ai/tools/formats/Phase.md) as a template. With each phase will be high level tasks that should also use the appropriate [format](/ai/tools/formats/Task.md).

- **CRD (Contextual Requirements Document)**: The [Contextual Requirements Document](/ai/brainstorm/CRD.md) should be analyzed while planning. When generating a plan document, there is a place within each task to list the Contextual Hints. This section should be populated with items from the CRD that are cross referenced with the phase goals. For example, if the Phase Task involves generating a CDK stack, the CDK documentation should be copied from the CRD and placed in the Phase Task contents, so that we will have additional contextual help when we refine the ticket.


## Planning Completion Criteria (How to know when planning is done)

- All planned tasks align with phase objectives in the [roadmap](/ai/brainstorm/Roadmap.md)
- Each task follows the Task.md [format](/ai/tools/formats/Task.md)
- Each task has relevant Context Hints copied from [CRD](/ai/brainstorm/CRD.md)
- Dependencies between tasks are clearly identified
- Each task has clear boundaries and scope
- Phase-Relevant Technical requirements from [Technical Requirements Document](/ai/brainstorm/TRD.md) are covered by planned tasks
- Phase-Relevant Product requirements from [Product Requirements Document](/ai/brainstorm/PRD.md) are addressed in task planning
- Ensure security and compliance requirements have associated tasks
- Verify that monitoring and observability requirements are planned