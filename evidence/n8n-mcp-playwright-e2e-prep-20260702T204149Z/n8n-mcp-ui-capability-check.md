# n8n MCP UI/API Capability Check

## n8n Version
- **Version:** 2.26.8 (running since Jun29)

## MCP Native Support
- **Built-in MCP nodes:** NOT FOUND
- **MCP npm package in n8n:** no (`/usr/lib/node_modules/n8n/node_modules/` has no MCP packages)
- **Community nodes:** no custom nodes directory found

## Existing MCP-Related Workflow
- **Name:** MCP Smoke Test
- **ID:** mcpSmoke001
- **Active:** False
- **Nodes:**
  - `When called by MCP` (n8n-nodes-base.manualTrigger)
  - `Smoke Test Response` (n8n-nodes-base.code)
- **Approach:** Uses Manual Trigger + Code Node (no native MCP Server node)

## API Endpoints
- `/api/v1/node-types` → 404 (not available via API key)
- `/rest/node-types` → 404 (endpoint doesn't exist in this version)
- `/api/v1/workflows` → 200 (working, 9 workflows visible)

## Assessment
- **N8N_MCP_NATIVE:** NOT available in n8n 2.26.8
- **N8N_MCP_COMMUNITY_NODE:** Would require installation of `n8n-nodes-mcp` or similar
- **N8N_MCP_WORKAROUND:** Possible via Webhook + Code nodes (existing mcpSmoke001 pattern)
- **UI Login Required:** yes (login page confirmed)

## Status
- **N8N_MCP_UI_CAPABLE:** no (no native MCP UI elements)
- **N8N_MCP_WORKFLOW_EXISTS:** yes (mcpSmoke001, manual approach)
- **N8N_MCP_NEEDS_COMMUNITY_NODE:** yes
