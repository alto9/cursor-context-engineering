#!/bin/bash

echo "Testing Glam MCP Server..."
echo ""
echo "Node version:"
node --version
echo ""
echo "Server location:"
which node
echo ""
echo "Testing tools/list request:"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node /home/danderson/code/alto9/opensource/cursor-context-engineering/packages/mcp-server/dist/index.js 2>&1 | grep -o '"name":"[^"]*"' | head -5
echo ""
echo "If you see tool names above, the server works!"

