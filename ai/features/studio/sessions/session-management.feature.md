---
feature_id: studio-sessions
name: Studio Session Management
description: Complete session lifecycle management within Forge Studio
spec_id: [session-ui, session-tracking, session-persistence]
model_id: [session]
context_id: []
---

# Studio Session Management

## Feature: Session Management Interface

```gherkin
Feature: Session Management in Studio
  As a developer
  I want to manage design sessions through Forge Studio
  So that I can track my design work effectively

  Scenario: View sessions page
    Given I have multiple design sessions
    When I navigate to the Sessions section in Studio
    Then I should see all sessions sorted by start time (newest first)
    And I should see active session prominently displayed at the top
    And I should see completed sessions in a list below
    And I should see session IDs, problem statements, and metadata
    And I should see file change counts for each session

  Scenario: Start a new session from Studio
    Given I do not have an active session
    When I navigate to the Sessions page
    Then I should see a "New Session" button
    And when I click it, I should see a form
    And I should be prompted for a problem statement
    And I should be able to enter a detailed description
    And when I submit, a new session file should be created
    And the session should be marked as active with status: "active"
    And the session should record the start time and start commit (if git repo)
    And I should see the active session indicator appear

  Scenario: Start session without active session
    Given I do not have any active sessions
    When I am on any Forge Studio page
    Then file creation and editing should be disabled
    And I should see read-only indicators
    And I should see messages prompting me to start a session

  Scenario: Only one active session at a time
    Given I have an active design session
    When I try to start another session
    Then I should not see the "New Session" button
    Or I should see a message that a session is already active
    And I must end the current session before starting a new one

  Scenario: Stop an active session
    Given I have an active design session
    When I click "Stop Session" or "End Session"
    Then the session status should be updated to "completed"
    And the end time should be recorded
    And the final list of changed files should be saved
    And the active session should be cleared
    And I should see the session move to completed sessions list
```

## Feature: Session Persistence and Recovery

```gherkin
Feature: Session Persistence
  As a developer
  I want sessions to persist across Studio reopens
  So that my work is never lost

  Scenario: Resume active session on Studio open
    Given I have an active session and close Forge Studio
    When I reopen Forge Studio
    Then the system should scan for session files with status: "active"
    And the active session should be automatically loaded
    And the session panel should appear with all saved data
    And file watching should resume to track changes

  Scenario: Filesystem as source of truth
    Given I have session files on disk
    When I open Forge Studio
    Then the system should read all session files
    And determine active vs completed sessions from file status
    And load the session with status: "active" if one exists
    And display all sessions accurately based on disk state

  Scenario: Handle no active sessions
    Given no session files have status: "active"
    When I open Forge Studio
    Then no active session should be loaded
    And I should be prompted to start a session to edit files
    And all editing capabilities should be disabled
```

## Feature: Session File Tracking

```gherkin
Feature: Automatic File Change Tracking
  As a developer
  I want files I change to be automatically tracked
  So that I don't have to manually maintain the list

  Scenario: Track file changes in ai directory
    Given I have an active design session
    When I create or modify a file in the ai directory
    Then the file path should be automatically added to changed_files
    And the session file should be updated on disk
    And the session panel should show the updated file count
    And session files themselves should not be tracked

  Scenario: File watcher lifecycle
    Given I start a new session
    Then a file watcher should be created for ai/**/*.{feature.md,spec.md,model.md,context.md}
    And when I stop the session, the file watcher should be disposed
    And no more changes should be tracked after session ends
```

## Feature: Session Details and Editing

```gherkin
Feature: Session Details Editing
  As a developer
  I want to document my session in real-time
  So that I can capture context while it's fresh

  Scenario: Edit session details in panel
    Given I have an active session with the panel open
    When I edit the Problem Statement field
    Then the change should auto-save after 500ms
    And the session file frontmatter should be updated
    And I should not lose my work

  Scenario: Document session goals and approach
    Given I have an active session
    When I type in the Goals field
    Then the content should be saved to the ## Goals section
    When I type in the Approach field
    Then the content should be saved to the ## Approach section
    When I type in Key Decisions field
    Then the content should be saved to the ## Key Decisions section
    When I type in Notes field
    Then the content should be saved to the ## Notes section

  Scenario: Session file structure
    Given I create a session
    Then the session file should have YAML frontmatter with:
      | session_id | start_time | end_time | status | problem_statement | changed_files | start_commit (if git) |
    And the session file should have markdown sections:
      | Problem Statement | Goals | Approach | Key Decisions | Notes |
    And all sections should be editable through the session panel

  Scenario: Manual save session
    Given I have made changes in the session panel
    When I click "Save Session"
    Then all current field values should be written to disk immediately
    And I should see a success message
    And the frontmatter and content sections should be properly updated
```

## Feature: Create Stories Command

```gherkin
Feature: Create Stories Command from Session
  As a developer
  I want to generate a Cursor command file from my design session
  So that I can execute it to create implementation stories and tasks

  Scenario: Create command for completed session
    Given I have a completed design session with status: "completed"
    When I view the session in the Sessions list
    Then I should see a "Create Stories Command" button for completed sessions without command_file
    And when I click it, a Cursor command file should be created
    And the command file should be placed in .cursor/commands/create-stories-{session-id}.md
    And the session should be updated with command_file path
    And the session status should change to "awaiting_implementation"

  Scenario: Create command from Studio sessions page
    Given I am viewing a completed session
    When I click the "Create Stories Command" button
    Then the system should call PromptGenerator.generateDistillSessionPrompt
    And the system should call CommandFileWriter.writeCommandFile
    And the prompt should be written as a markdown file
    And the prompt should include all changed file contents
    And the prompt should include session context and documentation
    And the prompt should instruct the agent to create stories and tasks in ai/tickets/<session-id>/
    And all stories and tasks should include session_id: "{session-id}" in their frontmatter
    And I should see a success message with the command file path

  Scenario: View session with command file created
    Given I have a session with status: "awaiting_implementation"
    And the session has a command_file path
    When I view it in the Sessions list
    Then I should see "✓ Command Created" badge
    And I should see the command file path displayed
    And I should not see the "Create Stories Command" button

  Scenario: Cannot create command for active sessions
    Given I have an active session
    When I view it in the Sessions list
    Then I should not see a "Create Stories Command" button
    And I should complete the session before creating the command

  Scenario: Execute the command file
    Given I have created a stories command for a session
    When I open the command file in .cursor/commands/
    And I execute it using Cursor's command system
    Then the agent should read the session file
    And the agent should analyze the changed files
    And the agent should create story files for code changes
    And the agent should create task files for non-code work
    And all stories and tasks should link to session_id
    And all files should be placed in ai/tickets/{session-id}/
```
