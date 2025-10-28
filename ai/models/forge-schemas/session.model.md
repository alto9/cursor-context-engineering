---
model_id: session
name: Session Model
type: core
description: Core data structure for tracking design sessions in Forge with filesystem-first persistence
related_models: [story, task]
---

# Session Model

## Overview

Sessions in Forge track design work through a session-driven workflow. The filesystem is the source of truth - active sessions are determined by reading session files with `status: "active"`. Sessions persist across Studio reopens, and the session panel provides real-time editing capabilities.

## File Format

Session files are stored in `ai/sessions/` with naming convention: `{session-id}.session.md`

### Frontmatter Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| session_id | string | Yes | Unique identifier (kebab-case, auto-generated from problem statement) |
| start_time | ISO8601 | Yes | When the session was started (auto-captured) |
| end_time | ISO8601 | No | When the session was ended (null for active sessions) |
| status | enum | Yes | Current status: "active" or "completed" |
| problem_statement | string | Yes | Description of the problem being solved |
| changed_files | string[] | Yes | Array of relative file paths modified during session |
| start_commit | string | No | Git commit hash at session start (if git repo) |

### Content Sections

The markdown content following frontmatter includes these sections:

```markdown
## Problem Statement

(User's problem statement, editable in session panel)

## Goals

(What the user is trying to accomplish, editable in session panel)

## Approach

(How the user plans to approach the problem, editable in session panel)

## Key Decisions

(Important decisions made during the session, editable in session panel)

## Notes

(Additional context, concerns, or considerations, editable in session panel)
```

## Status Values

- `active`: Session is currently running. Only one active session allowed per project.
- `completed`: Session has been finished and can be distilled into stories.

## Session Lifecycle

### Starting a Session

1. User opens Forge Studio and navigates to Sessions page
2. User clicks "Start New Session" button (only visible when no active session exists)
3. User enters a problem statement in the form
4. System creates session file in `ai/sessions/{session-id}.session.md`
5. Frontmatter is initialized with:
   - `session_id`: Generated from problem statement (kebab-case)
   - `start_time`: Current ISO8601 timestamp
   - `end_time`: null
   - `status`: "active"
   - `problem_statement`: User's input
   - `changed_files`: []
   - `start_commit`: Current git commit (if git repo detected)
6. Content sections are initialized with placeholder text
7. System loads session into memory and displays session panel
8. File watcher starts tracking changes to `ai/**/*.{feature.md,spec.md,model.md,context.md,actor.md}`

### During a Session

**Session Panel Behavior:**
- Session panel appears on the right side of Forge Studio
- Panel is persistent across all Studio pages (Dashboard, Features, Specs, etc.)
- Panel can be minimized to a narrow vertical bar
- All fields are editable (Problem Statement, Goals, Approach, Key Decisions, Notes)
- Changes debounce with 500ms delay before auto-saving to disk
- Manual "Save Session" button forces immediate save
- "End Session" button completes the session

**File Tracking:**
- File system watcher monitors `ai/` directory for Forge file changes
- When a tracked file is created or modified, its relative path is added to `changed_files[]`
- Session files (`*.session.md`) are explicitly excluded from tracking
- Session file is updated on disk whenever `changed_files[]` changes
- Changed files list is displayed in session panel with count

**Persistence:**
- All session data is stored in the session file on disk
- Frontmatter stores structured metadata
- Content sections store user documentation
- Session state persists across Studio reopens

### Resuming a Session

1. User opens Forge Studio
2. System scans `ai/sessions/` directory for all `*.session.md` files
3. System reads each file and checks `status` field in frontmatter
4. If a file has `status: "active"`, it's loaded as the active session
5. Session panel appears with all saved data
6. File watcher resumes tracking changes
7. User can continue working where they left off

**Important:** Only one session should have `status: "active"` at a time. If multiple are found, the first one is loaded.

### Ending a Session

1. User clicks "End Session" button in session panel
2. Confirmation dialog appears
3. On confirmation:
   - `end_time` is set to current ISO8601 timestamp
   - `status` is changed to "completed"
   - Final `changed_files[]` list is saved
   - Session file is written to disk
4. File watcher is disposed
5. Session panel disappears
6. Active session is cleared from memory
7. File editing becomes read-only until a new session starts

### Distilling a Session

1. User views completed session in Sessions list
2. User clicks "Distill" button (only visible for completed sessions)
3. System calls `PromptGenerator.generateDistillSessionPrompt(sessionFile)`
4. Prompt is generated with:
   - Session metadata and context
   - All changed file contents
   - Instructions to create stories and tasks
5. Prompt is displayed in Forge output panel
6. User copies prompt to Cursor Agent
7. Agent creates stories in `ai/tickets/{session-id}/`

## Relationships

- **One-to-Many**: Session → Changed Files (simple string array, not separate objects)
- **One-to-Many**: Session → Stories (created during distillation)
- **One-to-Many**: Session → Tasks (created during distillation)

## Validation Rules

1. **session_id**: Must be unique, kebab-case, auto-generated from problem statement
2. **start_time**: Must be valid ISO8601 datetime
3. **end_time**: Must be null for active sessions, must be after start_time for completed sessions
4. **status**: Must be "active" or "completed"
5. **problem_statement**: Cannot be empty
6. **changed_files**: Must be array of strings (relative paths from project root)
7. **Only one session with status="active" allowed per project**

## Session File Example

```markdown
---
session_id: redesign-authentication-system
start_time: "2024-01-15T10:30:00.000Z"
end_time: null
status: active
problem_statement: Redesign authentication system to support OAuth2 and improve security
changed_files:
  - ai/features/authentication/login.feature.md
  - ai/specs/auth-endpoints.spec.md
  - ai/models/user.model.md
start_commit: abc123def456
---

## Problem Statement

Redesign authentication system to support OAuth2 and improve security

## Goals

- Implement OAuth2 provider integration (Google, GitHub)
- Add refresh token rotation
- Improve password security with better hashing
- Add rate limiting to prevent brute force

## Approach

Start by defining the feature requirements, then spec out the API endpoints, and finally update the user model to support OAuth tokens.

## Key Decisions

- Using Passport.js for OAuth integration
- Implementing refresh token rotation per OWASP guidelines
- Moving from bcrypt to Argon2 for password hashing

## Notes

Need to consider backward compatibility with existing user accounts. May need a migration strategy.
```

## Implementation Notes

- **Filesystem is source of truth**: Always read session files from disk to determine state
- **Auto-save debouncing**: 500ms debounce on session panel edits prevents excessive disk writes
- **File watcher pattern**: `ai/**/*.{feature.md,spec.md,model.md,context.md,actor.md}`
- **Session ID generation**: Problem statement → lowercase → remove special chars → replace spaces with hyphens → truncate to 50 chars
- **Structure watcher**: Separate watcher monitors all `ai/` changes to refresh Studio UI in real-time
