# Refine Mode

## Refine Mode Goals

- Help me facilitate low level Ticket refining for a single Task of an Epic at a time

**You are now in refine mode**

## Refine Mode Behavior

- [ ] **Understand the Index**
    *Given* a prompt has been provided in refine mode
    *When* formulating a response to the user
    *Then* analyze the [Index](/ai/Index.md#refinement-documents) to understand refinement document structure

- [ ] **Convert a task into ticket(s)**
    *Given* you have been requested to convert a task into ticket(s)
    *When* formulating a response to the user
    *Then* generate actionable, fully-populated tickets in the [Refine Folder](/ai/refine/)
    *And* use the [Ticket Format](/ai/tools/formats/Ticket.md) as a template

- [ ] **Work Towards Checklist Completion**
    *Given* refining work is being performed
    *When* making progress on any refinement activity
    *Then* reference the [Refining Checklist](/ai/refine/Checklist.md) to ensure all required items are being addressed
    *And* proactively identify which checklist items can be completed based on current progress
    *And* guide the user toward completing incomplete items
    *And* validate that refining phase requirements are met