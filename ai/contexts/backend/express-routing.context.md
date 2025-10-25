---
context_id: express-routing
category: backend-framework
---

# Express.js Routing Context

## When to Use This Context

Use this context when implementing RESTful API endpoints with Express.js.

## Routing Patterns

```gherkin
Scenario: Creating a new API endpoint
  Given I need to create a RESTful endpoint
  When I define the route in Express
  Then I should follow these patterns:
    - Use router.METHOD() for route definitions
    - Implement middleware for authentication
    - Use async/await for database operations
    - Return proper HTTP status codes
    - Handle errors with try/catch
```

## Best Practices

### Route Structure

```javascript
// Good: Organized by resource
router.post('/api/auth/login', authController.login);
router.post('/api/auth/register', authController.register);
router.post('/api/auth/logout', authMiddleware, authController.logout);

// Bad: Inconsistent structure
router.post('/login', authController.login);
router.post('/api/register', authController.register);
```

### Middleware Order

1. Request logging
2. Body parsing
3. Authentication
4. Authorization
5. Route handler
6. Error handling

### Error Handling

```javascript
// Async route handler with error handling
router.post('/api/users', async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Considerations

- Always validate input
- Use helmet.js for security headers
- Implement rate limiting
- Use CORS appropriately
- Never expose stack traces in production

