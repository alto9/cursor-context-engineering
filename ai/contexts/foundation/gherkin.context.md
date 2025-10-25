---
context_id: gherkin
category: foundation
name: Gherkin Scenario Writing Guidance
description: Guidance for writing proper Gherkin scenarios in Forge feature files
---

# Gherkin Scenario Writing Context

## When to Use This Context

Use this context when:
- Writing Gherkin scenarios in feature files
- Creating background and rules sections
- Validating Gherkin syntax and structure
- Formatting scenarios for consistency

## Gherkin Format Requirements

```gherkin
Scenario: Write proper Gherkin scenarios
  Given you are creating a feature file
  When writing Gherkin scenarios
  Then use proper code blocks with gherkin language tag
  And follow Given-When-Then structure
  And use clear, descriptive language
  And focus on user behavior and outcomes

Scenario: Create feature structure
  Given you are defining a user-facing feature
  When structuring the feature
  Then include Background for shared preconditions
  And include Rules for business logic
  And group related scenarios logically
  And use descriptive scenario names
```

## Best Practices

### Scenario Writing
- Use clear, descriptive language
- Focus on user behavior and outcomes
- Avoid technical implementation details
- Make scenarios testable and verifiable
- Use specific data and examples

### Code Block Format
All Gherkin must be in code blocks with proper language tags:

```gherkin
Feature: User Authentication

Scenario: Successful login
  Given a registered user with email "user@example.com"
  When they enter valid credentials
  Then they should be logged into the system
  And receive a session token
```

### Background and Rules
- Use Background for shared preconditions
- Use Rules for business logic that applies to all scenarios
- Keep Background and Rules concise and focused
- Format using proper Gherkin syntax

## Common Patterns

### User Authentication
```gherkin
Feature: User Authentication

Background:
  Given the authentication system is configured
  And users can register accounts

Scenario: Successful login
  Given a registered user with email "user@example.com"
  When they enter valid credentials
  Then they should be logged into the system
  And receive a session token

Scenario: Invalid credentials
  Given a registered user
  When they enter invalid credentials
  Then they should see an error message
  And remain on the login page
```

### Data Validation
```gherkin
Feature: User Registration

Scenario: Valid registration
  Given a new user wants to register
  When they provide valid information
  Then their account should be created
  And they should receive a confirmation email

Scenario: Invalid email format
  Given a new user wants to register
  When they provide an invalid email
  Then they should see a validation error
  And the account should not be created
```

## Validation Rules

### Syntax Validation
- All Gherkin must be in code blocks
- Use proper Given-When-Then structure
- Validate keyword usage (Given, When, Then, And, But)
- Check for proper indentation and formatting

### Content Validation
- Scenarios should be clear and testable
- Avoid technical jargon in user-facing scenarios
- Ensure scenarios are logically complete
- Verify acceptance criteria are specific
