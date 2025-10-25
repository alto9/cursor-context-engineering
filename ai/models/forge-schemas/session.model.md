---
model_id: session
name: Session Model
type: core
description: Core data structure for tracking design sessions in Forge
related_models: [file-change, story, task]
---

# Session Model

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| session_id | string | Yes | Unique identifier for the session |
| start_time | datetime | Yes | When the session was started |
| end_time | datetime | No | When the session was ended |
| status | enum | Yes | Current status of the session |
| problem_statement | string | Yes | Description of the problem being solved |
| changed_files | array | Yes | List of files modified during session |
| created_by | string | Yes | User who created the session |
| project_id | string | Yes | Project this session belongs to |

## Status Values

- `active`: Session is currently running
- `completed`: Session has been finished
- `cancelled`: Session was cancelled

## Relationships

- **One-to-Many**: Session → File Changes
- **One-to-Many**: Session → Stories
- **One-to-Many**: Session → Tasks
- **Many-to-One**: Session → Project

## Validation Rules

1. **session_id**: Must be unique across all sessions
2. **start_time**: Must be before end_time if session is completed
3. **status**: Must be one of the defined enum values
4. **problem_statement**: Must not be empty
5. **changed_files**: Must be an array of file change objects

## Example Usage

```yaml
session_id: "session-2024-01-15-auth-redesign"
start_time: "2024-01-15T10:30:00Z"
end_time: "2024-01-15T12:45:00Z"
status: "completed"
problem_statement: "Redesign authentication system to support OAuth2 and improve security"
changed_files:
  - file_path: "ai/features/authentication/login.feature.md"
    modified_at: "2024-01-15T10:45:00Z"
    change_type: "modified"
  - file_path: "ai/specs/auth-endpoints.spec.md"
    modified_at: "2024-01-15T11:15:00Z"
    change_type: "created"
created_by: "developer"
project_id: "forge-project"
```
