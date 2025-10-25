---
feature_id: auth-login
spec_id:
  - api-auth-endpoints
model_id:
  - user-model
---

# User Login Feature

```gherkin
Feature: User Login

Scenario: Successful login with valid credentials
  Given a registered user with email "user@example.com"
  When they submit valid credentials
  Then they should receive a JWT token
  And they should be redirected to the dashboard

Scenario: Failed login with invalid credentials
  Given a registered user
  When they submit invalid credentials
  Then they should see an error message
  And they should remain on the login page
```

## Acceptance Criteria

- User can log in with email and password
- Invalid credentials show appropriate error
- Session token is stored securely
- User is redirected after successful login

