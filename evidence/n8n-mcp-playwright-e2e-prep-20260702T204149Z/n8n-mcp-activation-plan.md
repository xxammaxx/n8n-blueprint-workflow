# n8n MCP Activation Plan

## Current State
- **n8n Version:** 2.26.8
- **Native MCP:** Not available
- **Community MCP:** Not installed
- **Existing MCP Test:** mcpSmoke001 (inactive, manual trigger + code node)

## Goals
1. Enable MCP Server capability in n8n for Workflow-Bau/Validierung
2. Secure, LAN-limited access
3. No secrets in repo
4. Read-only tool safety

## Implementation Options

### Option A: Install Community Node (Recommended)
- Package: `n8n-nodes-mcp` or equivalent
- Install via n8n UI: Settings → Community Nodes → Install
- Provides native MCP Server Trigger node
- Requires n8n restart

### Option B: Webhook + Code Approach (Workaround)
- Use existing mcpSmoke001 pattern
- Webhook trigger with MCP protocol implementation in Code node
- More work, but no external dependencies
- Already partially tested (mcpSmoke001)

### Option C: SSE Supergateway Proxy
- Run external MCP-to-SSE proxy
- Point n8n HTTP Request nodes at proxy
- More complex, but more flexible

## Activation Plan (Option A - Recommended)

### Prerequisites
- [ ] SSH to CT 101 with root access
- [ ] Backup current n8n configuration
- [ ] User manually logs into n8n UI (192.168.1.52:5678)

### Steps
1. **Install community node**
   ```bash
   pct exec 101 -- npm install -g n8n-nodes-mcp
   ```
   Or via UI: Settings → Community Nodes → Install `n8n-nodes-mcp`

2. **Restart n8n** (requires maintenance window)
   ```bash
   pct exec 101 -- systemctl restart n8n
   ```

3. **Verify node availability**
   - Check UI for MCP Server Trigger node
   - Create test workflow with MCP trigger

4. **Configure MCP Allowlist/Denylist**
   - Tool Allowlist: Workflow lesen, Workflow validieren, Workflow draften
   - Tool Denylist: Credentials lesen, Executions löschen, Workflows aktivieren, Shell/SSH/DB

5. **Create dedicated MCP workflow**
   - Separate from production workflows
   - Named clearly: `MCP Server - Read-Only`
   - Access: LAN-only (no external exposure)

### Safety Gates
- **Activation Gate:** No activation without explicit authorization
- **Rollback:** Remove community node, restart n8n, remove workflow
- **Evidence:** Redacted screenshots, API logs without secrets

### Transport
- Use whatever transport the community node provides (likely SSE or HTTP)
- Limit to LAN (192.168.1.0/24)
- No external exposure

### Auth
- If MCP token required: generate fresh, store in n8n credential manager
- Never in repo
- Rotatable

## Status
- **PLAN_READY**
- **ACTIVATION_PENDING_AUTH** (Authorization received for preparation, but native support not available — needs community node install)
