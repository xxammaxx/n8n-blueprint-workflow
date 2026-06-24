# n8n MCP Integration — Discovery and Configuration

## Discovery Results (2026-06-24)

### n8n Instance

| Field | Value |
|-------|-------|
| URL | `http://192.168.1.52:5678` |
| Version | **2.26.8** (Community Edition) |
| MCP Feature | **Instance-level MCP (Preview)** |
| MCP Menu Location | Settings → Instance-level MCP |
| MCP Status | **DISABLED** (toggle off) |

### Settings Menu Structure

```
Settings
├── Usage and plan
├── Personal
├── Users
├── Project roles (New)
├── n8n API
├── External Secrets
├── Environments
├── SSO
├── Security & policies
├── LDAP
├── Log Streaming
├── Community nodes
├── Instance-level MCP (Preview)  ← MCP IS HERE
└── Chat (Preview)
```

### MCP Page Details (when disabled)

- Description: *"Connect MCP clients like Claude Code and Cursor to build, run, and iterate on workflows in your instance"*
- Toggle: OFF
- "Enable MCP access" button: Available (blue, clickable)
- Connection details: Hidden (only after enabling)
- Transport protocol: Not exposed (likely SSE/HTTP)
- Documentation link: `https://docs.n8n.io/advanced-ai/mcp/mcp_tools_reference`

## Activation Process

> **WARNING:** Do NOT enable MCP without explicit user approval.
> MCP activation requires auth token generation and workflow scoping decisions.

### Step 1: Enable MCP

1. Navigate to n8n Settings → Instance-level MCP
2. Click "Enable MCP access"
3. n8n generates:
   - MCP Server URL (e.g., `/mcp-server/http`)
   - Auth token (Bearer token)
   - OAuth client configuration (optional)

### Step 2: Scope Workflows

**DO NOT enable MCP globally on all workflows.** Instead:

1. Import `workflows/mcp-smoke-test.export.json` into n8n
2. Set `availableInMCP: true` ONLY on the smoke test workflow
3. Keep `availableInMCP: false` on all production workflows

### Step 3: Configure MCP Client

```json
{
  "mcpServers": {
    "n8n": {
      "type": "http",
      "url": "http://192.168.1.52:5678/mcp-server/http",
      "headers": {
        "Authorization": "Bearer <N8N_MCP_TOKEN>"
      }
    }
  }
}
```

**Never store the real token in the repository.** Use `templates/mcp-client-config.example.json` as a reference.

### Step 4: Smoke Test

After activation, test only these MCP tools:

| Tool | Safe? | Description |
|------|-------|-------------|
| `search_workflows` | ✅ YES | Lists available workflows |
| `execute_workflow` (smoke test only) | ✅ YES | Runs only the smoke test workflow |
| `get_workflow` | ⚠️ READ-ONLY | View workflow structure |
| `list_workflow_executions` | ⚠️ READ-ONLY | View execution history |

**DO NOT test these without explicit approval:**

| Tool | Risk | Reason |
|------|------|--------|
| `update_workflow` | HIGH | Can modify production workflows |
| `create_workflow_from_code` | HIGH | Can create arbitrary workflows |
| `publish_workflow` | HIGH | Activates workflows |
| `unpublish_workflow` | HIGH | Deactivates workflows |
| `archive_workflow` | MEDIUM | Data loss risk |
| `delete_workflow` | CRITICAL | Irreversible |

## n8n MCP Tools Reference

When enabled, n8n Instance-level MCP exposes these tools:

### Safe (Read-Only)
- `search_workflows` — List/search available workflows
- `get_workflow` — View workflow structure (nodes, connections, settings)
- `list_workflow_executions` — View execution history
- `get_execution` — View specific execution details
- `get_credential` — View credential metadata (NOT decrypted values)

### Dangerous (Requires Approval)
- `execute_workflow` — Run a workflow (OK for smoke test only)
- `update_workflow` — Modify workflow structure
- `create_workflow_from_code` — Create new workflow from description
- `publish_workflow` — Activate a workflow
- `unpublish_workflow` — Deactivate a workflow
- `archive_workflow` — Archive a workflow
- `delete_workflow` — Delete a workflow

## Test Workflow: MCP Smoke Test

File: `workflows/mcp-smoke-test.export.json`

```json
{
  "ok": true,
  "system": "n8n-blueprint-workflow",
  "runner_expected": "192.168.1.53",
  "no_secrets": true
}
```

This workflow:
- Has NO access to credentials
- Has NO SSH connections
- Has NO GitHub API access
- Returns only static metadata
- Is safe for MCP client testing

## Security Notes

1. **MCP Auth Token:** Must be stored outside the repo. Use environment variables or a secure vault.
2. **Workflow Scoping:** Only `mcp-smoke-test` should have `availableInMCP: true`.
3. **No Edit Rights:** Production workflows must never be editable via MCP.
4. **No Credential Readback:** MCP tools can list credential names but never expose encrypted values.
5. **Network Isolation:** n8n MCP is internal-only (192.168.1.52:5678). No public exposure.

## Current Blocker

~~**n8n Instance-level MCP is DISABLED.**~~ **RESOLVED** — MCP activated by user.

### Known Limitation: execute_workflow requires published workflow for production mode

Manual Trigger workflows cannot be published in n8n, and MCP `execute_workflow` in default `production` mode requires the workflow to have an active (published) version. 

**Solution:** Use `executionMode: "manual"` to bypass the publish requirement:
```json
{
  "method": "tools/call",
  "params": {
    "name": "execute_workflow",
    "arguments": {
      "workflowId": "mcpSmoke001",
      "executionMode": "manual"
    }
  }
}
```

### Additional Parameter Requirements

- **`get_execution`** requires BOTH `executionId` AND `workflowId` — not just executionId alone.
- **`test_workflow`** requires `pinData` parameter — use empty object `{}` for workflows without pin data.
- **`prepare_test_pin_data`** returns schema coverage analysis, not actual pin data values.

### Verified Execution Results

| Mode | Execution | Status | Duration | Notes |
|------|-----------|--------|----------|-------|
| `execute_workflow` (manual) | #20 | success | 106ms | No publish required |
| `test_workflow` | #22 | success | 11ms | `pinData: {}` works |

**MCP Client Config with correct headers:**
```json
{
  "mcpServers": {
    "n8n": {
      "type": "http",
      "url": "http://192.168.1.52:5678/mcp-server/http",
      "headers": {
        "Authorization": "Bearer <N8N_MCP_TOKEN>",
        "Accept": "application/json, text/event-stream"
      }
    }
  }
}
```

Note: The `Accept` header including `text/event-stream` is REQUIRED for SSE protocol support.

## Reference

- n8n MCP Documentation: https://docs.n8n.io/advanced-ai/mcp/mcp_tools_reference
- MCP Client Config Template: `templates/mcp-client-config.example.json`
- Smoke Test Workflow: `workflows/mcp-smoke-test.export.json`
