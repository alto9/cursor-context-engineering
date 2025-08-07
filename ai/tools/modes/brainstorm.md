# Brainstorm Mode

## Brainstorm Mode Goals

- Help me brainstorm a high level idea so it can be broken down into a Roadmap of ordered epics.
- Do not write actual code, only exhibit the brainstorming behavior defined below.

**You are now in brainstorm mode**

## Brainstorm Mode Behavior

- [ ] **Understand the Index**
    *Given* a prompt has been provided in brainstorm mode
    *When* formulating a response to the user
    *Then* analyze the [Index](/ai/Index.md#brainstorm-documents) to understand brainstorm document structure

- [ ] **Populate the PRD**
    *Given* a feature specific decision has been made
    *When* formulating a response to the user
    *Then* update the [PRD](/ai/brainstorm/PRD.md) document
    *And* verify the PRD follows the [PRD Format](/ai/tools/formats/PRD.md)

- [ ] **Populate the TRD**
    *Given* an architecture specific decision has been made
    *When* formulating a response to the user
    *Then* update the [TRD](/ai/brainstorm/TRD.md) document
    *And* verify the TRD follows the [TRD Format](/ai/tools/formats/TRD.md)

- [ ] **Populate the QRD**
    *Given* a testing specific decision has been made
    *When* formulating a response to the user
    *Then* update the [QRD](/ai/brainstorm/QRD.md) document
    *And* verify the QRD follows the [QRD Format](/ai/tools/formats/QRD.md)

- [ ] **Populate the Roadmap**
    *Given* a testing specific decision has been made
    *When* formulating a response to the user
    *Then* update the [Roadmap](/ai/brainstorm/Roadmap.md) document
    *And* verify the Roadmap follows the [Roadmap Format](/ai/tools/formats/Roadmap.md)

- [ ] **Manage New Questions**
    *Given* there is an ambiguity or decision that needs to be made in order to complete brainstorming
    *When* formulating a response to the user
    *Then* update the [Open Questions](/ai/brainstorm/OpenQuestions.md) document to include/update this question

- [ ] **Resolving Questions**
    *Given* an answer to an open question has been provided within the prompt
    *When* formulating a response to the user
    *Then* update the [Open Questions](/ai/brainstorm/OpenQuestions.md) document to mark this question resolved
    *And* make sure that the answer is represented by clarity in the existing [Brainstorming Documents](/ai/Index.md#brainstorm-documents)

- [ ] **Ensure Brainstorm Plan Cohesion**
    *Given* any change to the plan has been requested by the user
    *When* updating brainstorming documents in the Index
    *Then* scan *all* [Brainstorming Documents](/ai/Index.md#brainstorm-documents) for potential updates to maintain plan cohesion

- [ ] **Work Towards Checklist Completion**
    *Given* brainstorming work is being performed
    *When* making progress on any brainstorming activity
    *Then* reference the [Brainstorm Checklist](/ai/brainstorm/Checklist.md) to ensure all required items are being addressed
    *And* proactively identify which checklist items can be completed based on current progress
    *And* guide the user toward completing incomplete items
    *And* validate that brainstorming phase requirements are met before transitioning to planning