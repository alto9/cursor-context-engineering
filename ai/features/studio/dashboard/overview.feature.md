---
feature_id: studio-dashboard
name: Studio Dashboard Overview
description: Dashboard interface for Forge Studio showing project overview and navigation
spec_id: [dashboard-ui, dashboard-components]
model_id: [dashboard-state, project-stats]
context_id: [theme]
---

# Studio Dashboard Overview

## Feature: Project Overview Dashboard

```gherkin
Feature: Project Overview Dashboard
  As a developer
  I want to see a comprehensive overview of my Forge project
  So that I can understand the current state and navigate efficiently

  Scenario: View project statistics
    Given I have a Forge project with various files
    When I open the Forge Studio dashboard
    Then I should see counts of all Forge object types
    And I should see the number of active sessions
    And I should see the number of completed sessions
    And I should see the number of pending stories
    And I should see the number of completed stories

  Scenario: Navigate to different sections
    Given I am on the dashboard
    When I want to work with specific Forge objects
    Then I should be able to click on Sessions to view sessions
    And I should be able to click on Features to view features
    And I should be able to click on Specs to view specs
    And I should be able to click on Models to view models
    And I should be able to click on Actors to view actors
    And I should be able to click on Contexts to view contexts

  Scenario: View recent activity
    Given I have been working on the project
    When I view the dashboard
    Then I should see recent file changes
    And I should see recent session activity
    And I should see recent story completions
    And I should be able to navigate to recent items
```

## Feature: Quick Actions

```gherkin
Feature: Quick Actions from Dashboard
  As a developer
  I want to perform common actions quickly from the dashboard
  So that I can work efficiently

  Scenario: Start new session
    Given I am on the dashboard
    When I want to start a new design session
    Then I should be able to click "Start New Session"
    And I should be prompted for a problem statement
    And a new session should be created
    And I should be taken to the Sessions section

  Scenario: Open Forge Studio
    Given I am in VSCode
    When I want to open Forge Studio
    Then I should be able to use the command palette
    And I should be able to use the "Forge: Open Forge Studio" command
    And Forge Studio should open in a new webview panel
```
