# n8n MCP Capability Check

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z
- **n8n Version:** 2.26.8 (CT 101)
- **Required for MCP:** 2.18.4+

## Version Assessment
- **Version 2.26.8 >> 2.18.4+** — MCP is supported
- n8n 2.26.8 was released well after MCP Public Preview
- MCP Server Trigger node should be available as a built-in core node
- Instance-level MCP Server should be available in Settings

## API Accessibility
- n8n API (REST): HTTP 200 ✓
- Workflows endpoint: accessible, returns data ✓
- Settings endpoint: accessible, returns public config ✓

## MCP Configuration Status
- No explicit MCP configuration found on CT 101
- No MCP env vars in `/opt/dev-fabric/n8n/.env`
- MCP must be manually enabled/configured

## Requirements for n8n MCP Activation
1. Enable Instance MCP Server in n8n Settings (UI)
2. Configure MCP Server authentication token
3. For Workflow MCP (MCP Server Trigger node):
   - Add `MCP Server Trigger` node to a workflow
   - Configure SSE or streamable HTTP transport
   - Ensure stable routing to one instance for `/mcp*` paths (webhook/queue setups)

## Status
- **N8N_MCP_CAPABLE** — version supports it, just not enabled
- No MCP activation performed
- No n8n workflow changes
- No credentials read
- No secrets displayed

## Next Steps (after approval)
1. Enable Instance MCP Server in n8n UI
2. Generate MCP auth token
3. Configure MCP client with URL + token
