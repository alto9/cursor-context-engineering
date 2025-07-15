# Context Collection

## Purpose

This file serves as a central repository for all relevant context that will be needed during the refinement and implementation phases. Context items should be organized by category and include clear references to their sources.

## Categories

### External Documentation
- **Format**: [Title](link) - Brief description of relevance
- **Example**: [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html) - Reference for serverless implementation patterns and optimization techniques

### Internal References
- **Format**: `path/to/file.md` - Specific section/content reference
- **Example**: `.cursor/context-engineering/brainstorming/TRD.md#Authentication` - Details of the authentication implementation requirements

### Code Examples
- **Format**: [Title](link) - Language/Framework - Relevance
- **Example**: [Auth0 React Integration](https://auth0.com/docs/quickstart/spa/react) - React/Auth0 - Reference implementation for authentication flow

### MCP Tool Results
- **Format**: `Tool: [tool_name]` - Query/Purpose - Key findings
- **Example**: `Tool: codebase_search` - "auth implementation patterns" - Found existing auth patterns in related projects at `examples/auth/patterns.ts`

### Architecture Decisions
- **Format**: Decision [ID] - Title - Reference link/document
- **Example**: Decision 001 - Use Auth0 for Authentication - See RFC in `.cursor/context-engineering/brainstorming/TRD.md#AuthenticationDecision`

## Usage Instructions
1. Add new context items under appropriate categories
2. Include brief descriptions of why each item is relevant
3. Maintain links to source materials
4. Update as new context is discovered during planning
5. Reference specific context items in refinement tickets using the format `Context: [Category] - [Item Title]`
