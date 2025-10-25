---
model_id: user-model
type: entity
related_models:
  - session-model
  - profile-model
---

# User Model

## Overview

The User model represents authenticated users in the system.

## Properties

| Property | Type | Required | Description | Validation |
|----------|------|----------|-------------|------------|
| id | string | Yes | Unique identifier | UUID v4 |
| email | string | Yes | User's email address | Valid email format, unique |
| passwordHash | string | Yes | Hashed password | bcrypt hash |
| name | string | Yes | User's full name | 2-100 characters |
| createdAt | Date | Yes | Account creation timestamp | ISO 8601 |
| updatedAt | Date | Yes | Last update timestamp | ISO 8601 |
| isActive | boolean | Yes | Account active status | Default: true |

## Relationships

- **Has Many**: Sessions (for JWT token management)
- **Has One**: Profile (extended user information)

## Validation Rules

1. Email must be unique across the system
2. Password must be at least 8 characters
3. Name cannot be empty
4. Email verification required before activation

## Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
```

## Notes

- Passwords should never be stored in plain text
- Use bcrypt with salt rounds of 10 or higher
- Consider adding 2FA support in future iterations

