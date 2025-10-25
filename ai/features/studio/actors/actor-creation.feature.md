---
feature_id: actor-creation
name: Actor Creation
description: User experience for creating new actors in Forge Studio
spec_id: [actor-creation-ui, actor-templates]
model_id: [actor-creation, studio-state]
context_id: [theme, vsce]
---

# Actor Creation

## Feature: Create New Actor

```gherkin
Feature: Create New Actor
  As a developer
  I want to create new actors for my system
  So that I can document who interacts with my application

  Scenario: Create actor with active session
    Given I have an active design session
    And I am in the Actors section
    When I want to create a new actor
    Then I should be able to click "New Actor" button
    And I should be prompted for actor name
    And I should be able to select actor type (user, system, external)
    And I should be able to enter actor description
    And I should be able to save the actor
    And the actor should be created with proper template
    And I should be taken to edit the new actor

  Scenario: Create actor without active session
    Given I do not have an active session
    When I try to create a new actor
    Then I should see that creation is disabled
    And I should see a message to start a session first
    And I should be able to start a session from this prompt

  Scenario: Create actor in specific folder
    Given I have an active session
    And I have selected a subfolder in the actors list
    When I want to create a new actor
    Then I should be able to click "New Actor" button
    And the new actor should be created in the selected folder
    And I should be prompted for actor details
    And the actor should be saved in the correct location
```

## Feature: Actor Creation Form

```gherkin
Feature: Actor Creation Form
  As a developer
  I want a guided form for creating actors
  So that I can provide complete actor information

  Scenario: Fill actor creation form
    Given I am creating a new actor
    When I fill out the actor creation form
    Then I should be able to enter actor ID (auto-generated from name)
    And I should be able to select actor type from dropdown
    And I should be able to enter actor name
    And I should be able to enter actor description
    And I should see validation for required fields
    And I should be able to save or cancel

  Scenario: Validate actor creation form
    Given I am filling out the actor creation form
    When I try to save with missing required fields
    Then I should see validation errors
    And I should not be able to save until errors are fixed
    And I should see which fields are required

  Scenario: Auto-generate actor ID
    Given I am creating a new actor
    When I enter the actor name
    Then the actor ID should be auto-generated in kebab-case
    And I should be able to modify the actor ID if needed
    And the actor ID should be validated for uniqueness
```

## Feature: Actor Template

```gherkin
Feature: Actor Template
  As a developer
  I want a proper template for new actors
  So that I can structure actor information consistently

  Scenario: Apply actor template
    Given I am creating a new actor
    When the actor is created
    Then it should have proper frontmatter with actor_id and type
    And it should have template content with sections for:
      - Overview
      - Responsibilities
      - Characteristics
      - Interactions
      - Context
    And the template should include helpful placeholder text
    And I should be able to edit all sections

  Scenario: Template based on actor type
    Given I am creating an actor
    When I select different actor types
    Then the template should adapt to the actor type
    And user actors should have user-specific template sections
    And system actors should have system-specific template sections
    And external actors should have external-specific template sections
```
