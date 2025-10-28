---
model_id: task
name: Task Model
type: implementation
description: Data structure for non-code tasks in Forge
related_models: [session, feature, spec, model]
---

# Task Model

## Overview

Tasks in Forge represent non-code work items that need to be completed as part of a design session. Unlike Stories which focus on code implementation, Tasks are for manual actions, external system configurations, documentation, and other activities that don't involve writing code.

## File Format

Task files are stored in `ai/tickets/{session-id}/` with naming convention: `{task-id}.task.md`

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| task_id | string | Yes | Unique identifier for the task |
| session_id | string | Yes | Session this task was created from |
| feature_id | array | No | Features this task relates to |
| spec_id | array | No | Technical specs this task relates to |
| model_id | array | No | Data models this task affects |
| objective | string | Yes | Clear description of what needs to be done |
| action_items | array | Yes | Specific steps to complete the task |
| status | enum | Yes | Current status of the task |
| priority | enum | Yes | Priority level for completion |
| created_at | datetime | Yes | When the task was created |
| assigned_to | string | No | Person assigned to complete the task |

## Status Values

- `pending`: Task is ready to be completed
- `in_progress`: Task is currently being worked on
- `completed`: Task has been finished and verified
- `cancelled`: Task was cancelled or no longer needed

## Priority Values

- `high`: Critical for project success
- `medium`: Important but not critical
- `low`: Nice to have or future enhancement

## Relationships

- **Many-to-One**: Task → Session
- **Many-to-Many**: Task → Features
- **Many-to-Many**: Task → Specs
- **Many-to-Many**: Task → Models

## Task Types

Tasks are typically used for:

### External Service Setup
- Sign up for third-party services (e.g., AWS, Stripe, SendGrid)
- Configure API keys and credentials
- Set up OAuth applications

### System Configuration
- Configure DNS records
- Set up SSL certificates
- Configure deployment environments

### Documentation
- Update README files
- Write user guides
- Create API documentation

### Manual Testing
- Perform user acceptance testing
- Verify third-party integrations
- Test deployment procedures

### Administrative Work
- Schedule meetings or reviews
- Request access to systems
- Coordinate with other teams

## Validation Rules

1. **task_id**: Must be unique across all tasks
2. **session_id**: Must reference a valid session
3. **objective**: Must be clear and actionable
4. **action_items**: Must have at least one action item
5. **status**: Must be one of the defined status values
6. **priority**: Must be one of the defined priority values

## Example Usage

```yaml
task_id: "task-setup-stripe-account"
session_id: "session-2024-01-15-payment-integration"
feature_id: ["payment-processing", "subscription-billing"]
spec_id: ["stripe-integration"]
model_id: ["payment", "subscription"]
objective: "Set up Stripe account and configure webhooks for payment processing"
action_items:
  - "Sign up for Stripe account at stripe.com"
  - "Generate API keys (test and live)"
  - "Configure webhook endpoint URL"
  - "Add webhook events: payment_intent.succeeded, payment_intent.failed"
  - "Store API keys in environment variables"
status: "pending"
priority: "high"
created_at: "2024-01-15T12:45:00Z"
assigned_to: "developer"
```

## Task File Example

```markdown
---
task_id: task-setup-stripe-account
session_id: session-2024-01-15-payment-integration
feature_id: [payment-processing, subscription-billing]
spec_id: [stripe-integration]
model_id: [payment, subscription]
objective: Set up Stripe account and configure webhooks for payment processing
action_items:
  - Sign up for Stripe account at stripe.com
  - Generate API keys (test and live)
  - Configure webhook endpoint URL
  - Add webhook events payment_intent.succeeded, payment_intent.failed
  - Store API keys in environment variables
status: pending
priority: high
created_at: "2024-01-15T12:45:00Z"
assigned_to: developer
---

## Objective

Set up Stripe account and configure webhooks for payment processing

## Action Items

1. **Sign up for Stripe account**
   - Go to https://stripe.com
   - Create business account
   - Complete verification process

2. **Generate API keys**
   - Navigate to Developers > API Keys
   - Copy test mode keys (publishable and secret)
   - Store in secure location for environment variables

3. **Configure webhook endpoint**
   - Go to Developers > Webhooks
   - Add endpoint: `https://api.example.com/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.failed`
   - Copy webhook signing secret

4. **Update environment configuration**
   - Add `STRIPE_PUBLISHABLE_KEY`
   - Add `STRIPE_SECRET_KEY`
   - Add `STRIPE_WEBHOOK_SECRET`

## Notes

- Keep test and live keys separate
- Never commit API keys to version control
- Test webhook delivery using Stripe CLI before going live
```

## Implementation Notes

- Tasks are created during session distillation alongside Stories
- Tasks should be clearly distinguished from Stories - if it involves writing code, it should be a Story
- Tasks often have dependencies on Stories (e.g., webhook endpoint must be implemented before configuring it in Stripe)
- Task completion may require access to external systems or elevated permissions


