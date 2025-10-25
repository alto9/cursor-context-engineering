---
story_id: "story-mcp-tools"
session_id: "session-mcp-server-implementation"
feature_id: ["mcp-server"]
spec_id: ["mcp-implementation"]
model_id: ["mcp-tool", "mcp-response"]
context_id: ["mcp", "node"]
status: "pending"
priority: "high"
estimated_time: 28
---

# MCP Tools Implementation

## Objective
Implement the four core MCP tools for Forge: get_forge_about, get_forge_schema, get_forge_context, and get_forge_objects.

## Implementation Steps
1. Implement get_forge_about tool with comprehensive workflow overview
2. Create get_forge_schema tool with file format schemas
3. Implement get_forge_context tool with technical guidance
4. Add get_forge_objects tool for supported spec objects
5. Add proper error handling and validation
6. Test tools with AI assistants

## Acceptance Criteria
- [ ] get_forge_about returns complete workflow overview
- [ ] get_forge_schema returns schemas for all file types
- [ ] get_forge_context provides guidance for technical objects
- [ ] get_forge_objects lists all supported spec objects
- [ ] All tools handle errors gracefully
- [ ] Tools return properly formatted responses
- [ ] Integration works with Claude Desktop and Cursor

## Context
This story implements the MCP server functionality defined in `ai/features/mcp/mcp-server.feature.md` and uses the MCP implementation spec. The implementation should follow the MCP guidance in `ai/contexts/foundation/mcp.context.md` and Node.js patterns in `ai/contexts/foundation/node.context.md`.

## Technical Notes
- Use @modelcontextprotocol/sdk for protocol implementation
- Implement Zod schemas for parameter validation
- Handle file system operations with proper error handling
- Use async/await patterns consistently
- Return structured responses in expected format
