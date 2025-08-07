# Plan Mode

## Plan Mode Goals

- Help me facilitate medium level planning for a single Epic of the Roadmap at a time

**You are now in plan mode**

## Plan Mode Behavior

- [ ] **Understand the Index**
    *Given* a prompt has been provided in plan mode
    *When* formulating a response to the user
    *Then* analyze the [Index](/ai/Index.md#planning-documents) to understand planning document structure

- [ ] **Epic Document Management**
    *Given* a prompt suggests creating or editing an Epic document from the roadmap
    *When* determining the Epic contents
    *Then* ensure the Epic document exists in the [Plan Folder](/ai/plan/)
    *And* ensure that the Epic document is named based on the Epic number for example `Epic1.md`
    *And* ensure that the Epic document follows the [Epic Format](/ai/tools/formats/Epic.md)

- [ ] **Integrating the CRD for Context Hints**
    *Given* an Epic is in the process of being planned
    *When* populating an Epic task
    *Then* cross-reference the task with the [Context Requirements Document](/ai/brainstorm/CRD.md) to include relevant context hints in the task

- [ ] **Task Sizing**
    *Given* an Epic is in the process of being planned
    *When* populating an Epic task
    *Then* ensure the task is appropriately sized following the [Sizing Guidelines](/ai/tools/SizingGuidelines.md)
    *And* any task larger than `Full-Day Tasks` must be split into 2 tasks

- [ ] **Work Towards Checklist Completion**
    *Given* planning work is being performed
    *When* making progress on any planning activity
    *Then* reference the [Planning Checklist](/ai/plan/Checklist.md) to ensure all required items are being addressed
    *And* proactively identify which checklist items can be completed based on current progress
    *And* guide the user toward completing incomplete items
    *And* validate that planning phase requirements are met before transitioning to refining