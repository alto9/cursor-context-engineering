---
model_id: story
name: Story Model
type: implementation
description: Data structure for implementation stories in Forge
related_models: [session, feature, spec, model, task]
---

# Story Model

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| story_id | string | Yes | Unique identifier for the story |
| session_id | string | Yes | Session this story was created from |
| feature_id | array | Yes | Features this story implements |
| spec_id | array | No | Technical specs this story implements |
| model_id | array | No | Data models this story affects |
| context_id | array | No | Context guidance for this story |
| objective | string | Yes | Clear description of what to implement |
| acceptance_criteria | array | Yes | Criteria for story completion |
| estimated_time | number | Yes | Estimated implementation time in minutes |
| status | enum | Yes | Current status of the story |
| priority | enum | Yes | Priority level for implementation |
| created_at | datetime | Yes | When the story was created |
| assigned_to | string | No | Developer assigned to implement |

## Status Values

- `pending`: Story is ready for implementation
- `in_progress`: Story is currently being implemented
- `completed`: Story has been implemented and verified
- `cancelled`: Story was cancelled or no longer needed

## Priority Values

- `high`: Critical for project success
- `medium`: Important but not critical
- `low`: Nice to have or future enhancement

## Relationships

- **Many-to-One**: Story → Session
- **Many-to-Many**: Story → Features
- **Many-to-Many**: Story → Specs
- **Many-to-Many**: Story → Models
- **Many-to-Many**: Story → Contexts
- **One-to-One**: Story → Task (for non-code work)

## Validation Rules

1. **story_id**: Must be unique across all stories
2. **estimated_time**: Must be ≤ 30 minutes for minimal stories
3. **objective**: Must be clear and actionable
4. **acceptance_criteria**: Must have at least one criterion
5. **feature_id**: Must link to at least one feature

## Example Usage

```yaml
story_id: "story-auth-validation"
session_id: "session-2024-01-15-auth-redesign"
feature_id: ["user-login", "password-validation"]
spec_id: ["auth-endpoints", "validation-rules"]
model_id: ["user", "session"]
context_id: ["express-validation", "security-guidelines"]
objective: "Add email validation to user login form"
acceptance_criteria:
  - "Email field validates proper email format"
  - "Invalid email shows clear error message"
  - "Validation happens on both client and server"
estimated_time: 25
status: "pending"
priority: "high"
created_at: "2024-01-15T12:45:00Z"
assigned_to: "developer"
```
