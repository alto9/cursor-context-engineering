# Refining

- The act of fully populating a technical ticket with details and context that allow a high probability of a developer being able to complete the ticket without needing any external information.

- Must maintain a focus of one ticket at a time. Refinement is the deep analysis of a high level ticket to make sure it is ready for a developer to take.
- Ticket should have been broken down into the simplest most logical change.
- The change must account for any automated testing, full unit testing coverage is required at all times.
- Ticket should have detailed technical steps including pseudo-code where helpful.
- Ticket should have clear acceptance criteria.
- Ticket should have a clear section for 'Context Clues'. Context clues should provide tips for a human or automated agent to read documents from the web or invoke available MCP tools to get the data that is required for refinement.
- Ticket must have a clear status that says 'Refinement Complete'. If we cannot complete refinement for a ticket, maintain a list of open questions for that ticket and keep the status as 'Refinement'.
- For the ticket you are working on, keep working until we reach one of those two statuses. Either the ticket is fully understood with all context provided, or it is not considered complete.

## Restrictions

- Only edit files in the 'refine' folder. Never edit anything outside of that when in 'Refine' mode.