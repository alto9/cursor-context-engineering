# Glam MCP Server - Quick Start Guide

## What You Have

Your Glam MCP Server now provides **two focused tools**:

### 1. `get_glam_schema`
- **Purpose:** Returns the complete schema specification for Glam file types
- **Input:** `schema_type` - one of: `decision`, `feature`, `spec`, `task`, `context`
- **Output:** Detailed schema with frontmatter fields, content structure, and linkage requirements

### 2. `get_glam_context`
- **Purpose:** Generates a research prompt for investigating technical objects
- **Input:** `spec_object` - any technical concept (e.g., "AWS Lambda", "React Context API")
- **Output:** A structured research prompt with 5 steps to thoroughly understand the topic

## How to Start the MCP Server

### Step 1: Build the Server (if not already built)

```bash
cd /home/danderson/code/alto9/opensource/cursor-context-engineering/packages/mcp-server
npm run build
```

### Step 2: Start the Server

You have three options:

#### Option A: Using npx (Recommended)
```bash
npx @glam/mcp-server
```

#### Option B: Using Node directly
```bash
node /home/danderson/code/alto9/opensource/cursor-context-engineering/packages/mcp-server/dist/index.js
```

#### Option C: Development mode (auto-reload)
```bash
cd /home/danderson/code/alto9/opensource/cursor-context-engineering/packages/mcp-server
npm run dev
```

### Step 3: Configure Cursor

Add this to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "glam": {
      "command": "npx",
      "args": ["@glam/mcp-server"],
      "cwd": "/home/danderson/code/alto9/opensource/cursor-context-engineering"
    }
  }
}
```

### Step 4: Restart Cursor

After updating the MCP configuration, restart Cursor completely.

### Step 5: Test It

Ask the Cursor agent:
```
Can you call get_glam_schema for the "decision" schema type?
```

You should see a detailed decision file schema returned.

## What's Been Removed

The AI-generated code had several tools that have been removed:
- `generate_decision_prompt`
- `generate_distill_prompt`
- `generate_tasks_prompt`
- `list_decisions`
- `list_features`
- `list_specs`

These were replaced with the two core tools that align with your actual requirements.

## Schema Content

Each schema provides:
- **File naming pattern** (e.g., `<decision-id>.decision.md`)
- **Location** (e.g., `ai/decisions/`)
- **Frontmatter fields** with data types and requirements
- **Content structure** guidelines
- **Linkage rules** showing relationships between file types

## Research Prompt Content

When you call `get_glam_context` with a technical object, it returns a prompt that instructs the agent to:

1. **Check project docs** - Search `ai/docs/` for existing information
2. **Search codebase** - Use `codebase_search` to find implementations
3. **External research** - Web search for official docs and best practices
4. **Synthesize findings** - Create a summary with definition, purpose, implementation details
5. **Create context** - Optionally create a context file for future use

## Troubleshooting

### Server won't start
- Ensure you've run `npm install` and `npm run build`
- Check that Node.js version >= 22.14.0

### Cursor doesn't see the tools
- Verify `.cursor/mcp.json` is in the project root
- Restart Cursor completely (not just reload window)
- Check Cursor's MCP connection status

### Tools return errors
- Check the server logs (stderr output)
- Verify the tool arguments match the expected schema
- Ensure you're passing the correct parameter names

## Next Steps

Now that your MCP server is set up with the correct tools, you can:

1. Test both tools thoroughly
2. Integrate them into your Glam workflow
3. Use `get_glam_schema` when creating/validating Glam files
4. Use `get_glam_context` when researching technical concepts

The server is now focused on providing **schema specifications** and **research guidance**, which are the core needs for your Glam system.

