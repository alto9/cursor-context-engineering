---
model_id: feature
name: Feature Model
type: requirement
description: Data structure for user-facing features in Forge
related_models: [scenario, spec, model]
---

# Feature Model

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| feature_id | string | Yes | Unique identifier for the feature |
| name | string | Yes | Human-readable name of the feature |
| description | string | Yes | Brief description of the feature |
| spec_id | array | No | Technical specs that implement this feature |
| model_id | array | No | Data models used by this feature |
| context_id | array | No | Context guidance for this feature |
| scenarios | array | Yes | Gherkin scenarios for this feature |
| background | string | No | Shared context for all scenarios |
| rules | array | No | Business rules that apply to this feature |
| status | enum | Yes | Current status of the feature |
| created_at | datetime | Yes | When the feature was created |
| updated_at | datetime | Yes | When the feature was last updated |

## Status Values

- `draft`: Feature is being defined
- `review`: Feature is under review
- `approved`: Feature is approved for implementation
- `implemented`: Feature has been implemented
- `deprecated`: Feature is no longer needed

## Relationships

- **One-to-Many**: Feature → Scenarios
- **Many-to-Many**: Feature → Specs
- **Many-to-Many**: Feature → Models
- **Many-to-Many**: Feature → Contexts
- **Many-to-Many**: Feature → Stories

## Validation Rules

1. **feature_id**: Must be unique across all features
2. **scenarios**: Must have at least one scenario
3. **scenarios**: All scenarios must be valid Gherkin
4. **name**: Must be descriptive and clear
5. **description**: Must provide context for the feature

## Gherkin Structure

Each scenario must follow the Given-When-Then format:

```gherkin
Scenario: [Scenario Name]
  Given [precondition]
  When [action]
  Then [expected result]
  And [additional expected result]
```

## Example Usage

```yaml
feature_id: "user-login"
name: "User Login"
description: "Allow users to authenticate with email and password"
spec_id: ["auth-endpoints", "session-management"]
model_id: ["user", "session"]
context_id: ["security-guidelines", "express-routing"]
scenarios:
  - name: "Successful login"
    gherkin: |
      Given a registered user with email "user@example.com"
      When they enter valid credentials
      Then they should be logged into the system
      And receive a session token
  - name: "Invalid credentials"
    gherkin: |
      Given a registered user
      When they enter invalid credentials
      Then they should see an error message
      And remain on the login page
background: |
  Given the authentication system is configured
  And users can register accounts
rules:
  - "Passwords must be at least 8 characters"
  - "Sessions expire after 24 hours"
status: "approved"
created_at: "2024-01-15T10:30:00Z"
updated_at: "2024-01-15T11:15:00Z"
```