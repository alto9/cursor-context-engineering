---
spec_id: forge-studio-implementation
name: Forge Studio Implementation Specification
description: Technical specification for the Forge Studio VSCode webview application
feature_id: [forge-studio, studio-sessions]
model_id: [session, feature, spec, model, actor, context]
context_id: [theme, vsce]
---

# Forge Studio Implementation Specification

## Overview

Forge Studio is a React-based webview application embedded in VSCode that provides a visual interface for managing Forge files and design sessions. It uses VSCode's webview API for communication between the extension host and the UI, with the filesystem serving as the source of truth for all data.

## Architecture

### Components

```mermaid
graph TD
    A[VSCode Extension Host] -->|WebviewPanel| B[ForgeStudioPanel.ts]
    B -->|HTML + React| C[Webview UI - index.tsx]
    C -->|postMessage| B
    B -->|postMessage| C
    B -->|File System| D[ai/ directory]
    B -->|FileParser| E[File I/O]
    B -->|PromptGenerator| F[Prompt Generation]
    C -->|Components| G[Dashboard, Sessions, BrowserPage, SessionPanel]
```

### Extension Host (ForgeStudioPanel.ts)

**Responsibilities:**
- Manages webview lifecycle and HTML rendering
- Handles message passing between webview and extension
- Performs file system operations (read, write, watch)
- Manages active session state (loaded from disk)
- Tracks file changes during active sessions
- Generates distillation prompts

**Key Methods:**
- `render()`: Creates and displays the webview panel
- `_getInitialState()`: Returns project path to webview
- `_getCounts()`: Counts all Forge objects recursively
- `_loadActiveSessionFromDisk()`: Scans for active session files
- `_createSession()`: Creates new session file
- `_updateSession()`: Updates session file with edits
- `_stopSession()`: Completes active session
- `_startFileWatcher()`: Watches for Forge file changes
- `_startStructureWatcher()`: Watches for any ai/ directory changes
- `_getFolderTree()`: Builds nested folder structure
- `_getFolderContents()`: Lists files and folders in a directory
- `_getFileContent()`: Reads file with frontmatter parsing
- `_saveFileContent()`: Writes file with frontmatter serialization
- `_createFolder()`: Creates nested folders
- `_createFile()`: Creates new Forge files with templates

### Webview UI (index.tsx)

**Main Component Structure:**
```
App
├── Sidebar (Navigation)
├── MainContent
│   ├── DashboardPage
│   ├── SessionsPage
│   │   └── NewSessionForm
│   └── BrowserPage (Features, Specs, Models, Actors, Contexts)
│       ├── FolderTreeView
│       ├── FolderProfile
│       └── ItemProfile
│           ├── Frontmatter Components
│           ├── GherkinEditor (for features)
│           └── TextEditor (for others)
└── SessionPanel (when active session exists)
```

## Message Protocol

Communication between webview and extension uses `postMessage` with typed message objects.

### Webview → Extension Messages

| Message Type | Parameters | Description |
|--------------|------------|-------------|
| `getInitialState` | - | Request initial project path |
| `getCounts` | - | Request counts of all Forge objects |
| `getActiveSession` | - | Request active session info |
| `listSessions` | - | Request list of all sessions |
| `createSession` | `problemStatement: string` | Create new session |
| `updateSession` | `frontmatter: any, content: string` | Update active session |
| `stopSession` | - | End active session |
| `distillSession` | `sessionId: string` | Generate distillation prompt |
| `getFolderTree` | `category: string` | Get folder hierarchy |
| `getFolderContents` | `folderPath: string, category: string` | Get files in folder |
| `getFileContent` | `filePath: string` | Read file content |
| `saveFileContent` | `filePath: string, frontmatter: any, content: string` | Write file |
| `promptCreateFolder` | `folderPath: string, category: string` | Prompt for folder name |
| `promptCreateFile` | `folderPath: string, category: string` | Prompt for file title |
| `createFolder` | `folderPath: string` | Create folder |
| `createFile` | `folderPath: string, category: string, title: string` | Create file |

### Extension → Webview Messages

| Message Type | Data | Description |
|--------------|------|-------------|
| `initialState` | `{ projectPath: string }` | Project information |
| `counts` | `{ sessions, features, specs, models, actors, contexts, stories, tasks }` | Counts of all objects |
| `activeSession` | `ActiveSession \| null` | Current active session |
| `sessions` | `Session[]` | List of all sessions |
| `sessionCreated` | `ActiveSession` | New session created |
| `sessionStopped` | - | Session ended |
| `sessionUpdated` | `{ success: boolean }` | Session save result |
| `folderTree` | `FolderNode[], category: string` | Folder hierarchy |
| `folderContents` | `FileItem[]` | Files in folder |
| `fileContent` | `{ path, frontmatter, content }` | File data |
| `fileSaved` | `{ success: boolean, path: string }` | File save result |
| `folderCreated` | `{ success: boolean }` | Folder creation result |
| `fileCreated` | `{ success: boolean }` | File creation result |
| `structureChanged` | - | Trigger UI refresh |

## Session Management

### Active Session Detection

The extension uses a **filesystem-first approach**:

1. On Studio open, scan `ai/sessions/` for `*.session.md` files
2. Read frontmatter of each file
3. Find file with `status: "active"`
4. Load that session into memory
5. Start file watcher to track changes
6. Display session panel in UI

**Only one active session is allowed per project.** If multiple sessions have `status: "active"`, the first one found is loaded.

### Session Panel

The session panel is a persistent right-side panel that:
- Shows session metadata (ID, start time)
- Provides editable fields for problem statement, goals, approach, decisions, notes
- Auto-saves changes with 500ms debounce
- Shows list of changed files with count
- Can be minimized to a narrow vertical bar
- Provides "Save Session" and "End Session" buttons

### File Change Tracking

When a session is active:
1. File watcher monitors: `ai/**/*.{feature.md,spec.md,model.md,context.md,actor.md}`
2. On file create/change, add relative path to `session.changedFiles[]`
3. Exclude `*.session.md` files from tracking
4. Update session file on disk
5. Notify webview to update UI

## File Management

### Session-Aware Operations

All file creation and editing operations require an active session:
- Without active session: UI shows read-only mode
- With active session: Full CRUD operations enabled

### File Creation Flow

1. User clicks "New {Type}" button in category view
2. Extension prompts for title via `vscode.window.showInputBox()`
3. Title is converted to kebab-case for filename
4. Extension generates appropriate frontmatter template
5. Extension generates category-specific content template
6. File is created with `FileParser.stringifyFrontmatter()`
7. File watcher detects change and adds to session
8. UI refreshes to show new file

### Frontmatter Templates

Each category has specific frontmatter fields:

**Features:**
```yaml
feature_id: {id}
spec_id: []
model_id: []
```

**Specs:**
```yaml
spec_id: {id}
feature_id: []
model_id: []
context_id: []
```

**Models:**
```yaml
model_id: {id}
type: ''
related_models: []
```

**Actors:**
```yaml
actor_id: {id}
type: user
```

**Contexts:**
```yaml
context_id: {id}
category: ''
```

### Content Templates

Each category gets appropriate markdown template:

- **Features**: Overview, Gherkin behavior block, Notes
- **Specs**: Overview, Mermaid architecture, Implementation Details, Notes
- **Models**: Overview, Properties table, Relationships, Validation Rules, Notes
- **Actors**: Overview, Responsibilities, Interactions, Notes
- **Contexts**: Overview, Gherkin usage block, Guidance, Notes

## Gherkin Editing

Features get special structured editing via Gherkin parser:

### Parser (parseFeatureContent)

Extracts Gherkin from ` ```gherkin ` code blocks into structured data:

```typescript
interface ParsedFeatureContent {
  background: GherkinStep[];
  rules: GherkinRule[];
  scenarios: GherkinScenario[];
  otherContent: string;
}
```

### Editor Components

- **BackgroundSection**: Edit background steps
- **RulesSection**: Edit rules with nested examples
- **ScenariosSection**: Edit standalone scenarios
- **GherkinStepRow**: Edit individual Given/When/Then/And/But steps

Each component provides:
- Add/remove steps
- Reorder steps (up/down buttons)
- Change step keywords (dropdown)
- Collapsible scenarios/rules
- Read-only mode when no active session

### Serializer (serializeFeatureContent)

Converts structured data back to Gherkin markdown:

```markdown
```gherkin
Background:
  Given step
  
Rule: Title
  Example: Scenario
    When action
    Then result
```

## Real-Time Updates

### Structure Watcher

Monitors entire `ai/` directory for changes:

```typescript
pattern: new vscode.RelativePattern(aiPath, '**/*')
```

When files/folders are created, modified, or deleted:
1. Debounce for 300ms to batch rapid changes
2. Refresh counts on dashboard
3. Send `structureChanged` message to webview
4. Webview refreshes folder trees and lists

### Session Auto-Save

Session panel changes trigger debounced saves:
1. User types in any field
2. 500ms timeout starts
3. If user types again, timeout resets
4. After 500ms of no changes, save to disk
5. Frontmatter and content sections are updated
6. No UI confirmation shown (silent save)

## Theme Integration

Studio uses VSCode CSS variables for theming:

```css
--vscode-editor-background
--vscode-editor-foreground
--vscode-sideBar-background
--vscode-panel-border
--vscode-button-background
--vscode-button-foreground
--vscode-input-background
--vscode-focusBorder
--vscode-list-activeSelectionBackground
--vscode-list-hoverBackground
```

This ensures Studio automatically adapts to VSCode theme changes without code updates.

## File I/O Utilities

### FileParser

**Purpose**: Read/write files with YAML frontmatter

```typescript
// Read file
FileParser.readFile(path: string): Promise<string>

// Parse frontmatter
FileParser.parseFrontmatter(content: string): { frontmatter: any, content: string }

// Stringify frontmatter
FileParser.stringifyFrontmatter(frontmatter: any, content: string): string
```

Uses `gray-matter` library for YAML frontmatter parsing.

### FolderManager

**Purpose**: Utilities for folder operations (not currently used, but available)

## Security Considerations

### Content Security Policy

Webview uses strict CSP:
```
default-src 'none';
img-src ${webview.cspSource} blob: data:;
script-src 'nonce-${nonce}';
style-src 'unsafe-inline' ${webview.cspSource};
font-src ${webview.cspSource};
```

Only scripts with matching nonce can execute.

### Path Validation

All file paths are validated:
- Relative paths resolved against project URI
- Paths must be within project directory
- No directory traversal allowed

## Error Handling

### Extension Host Errors

Errors are caught and displayed via:
- `vscode.window.showErrorMessage()` for user-facing errors
- `console.error()` for debugging
- Webview receives `{ success: false, error: string }` messages

### Webview Errors

Errors in React components:
- Console logging for debugging
- Graceful fallbacks (empty states)
- Read-only mode when operations not allowed

## Performance Optimizations

### Debouncing

- Session auto-save: 500ms debounce
- Structure change refresh: 300ms debounce

### Lazy Loading

- Folder contents loaded on-demand when folder clicked
- File content loaded when file opened
- Counts calculated once and cached until refresh

### Recursive Operations

- Folder tree building is recursive but bounded (excludes node_modules, dot files)
- Count operations use efficient directory traversal
- File watching uses glob patterns for targeted monitoring

## Build Process

### Webview Bundle

```bash
esbuild src/webview/studio/index.tsx \
  --bundle \
  --outfile=media/studio/main.js \
  --format=iife \
  --platform=browser \
  --minify
```

- Bundles React + components into single IIFE
- Minified for production
- Output to `media/studio/main.js`

### Extension Bundle

```bash
webpack --mode production --devtool hidden-source-map
```

- Bundles TypeScript extension code
- Output to `dist/extension.js`
- Source maps hidden in production

## Testing Approach

### Unit Tests

- GherkinParser: Test parsing and serialization
- FileParser: Test YAML frontmatter handling
- YamlIO: Test YAML read/write

### Integration Tests

- Session lifecycle
- File CRUD operations
- Message protocol

### Manual Testing

- Open Studio, verify UI loads
- Create session, verify file created
- Edit files, verify tracking works
- Close and reopen, verify session resumes
- End session, verify completion
- Distill session, verify prompt generated

## Deployment

Extension packaged with:
```bash
vsce package
```

Produces `forge-{version}.vsix` file that can be installed in VSCode.

## Known Limitations

1. Only one active session per project
2. No undo/redo in structured Gherkin editor
3. No file deletion through UI (must use file explorer)
4. No drag-and-drop file organization
5. Session panel not resizable (fixed width)
6. No search functionality across files
7. No file history/diff view

## Future Enhancements

1. Multi-file editing (tabs)
2. Undo/redo for Gherkin edits
3. File deletion and moving
4. Drag-and-drop organization
5. Resizable panels
6. Global search
7. Git integration (commit from Studio)
8. Collaborative sessions (multiple users)
9. Real-time preview of Mermaid diagrams
10. Story/Task management in Studio

