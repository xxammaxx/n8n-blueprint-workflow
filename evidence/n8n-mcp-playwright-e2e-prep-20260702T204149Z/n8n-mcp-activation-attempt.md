# n8n MCP Activation Attempt

## Authorization
- **Status:** AUTHORIZED (user provided explicit authorization)
- **Constraint:** "Kein n8n Restart" (hard constraint, non-negotiable)

## Pre-Activation Discovery

### Native MCP Support
- **n8n 2.26.8:** No native MCP server nodes
- **Community package:** `n8n-nodes-mcp@0.1.37` available on npm
- **Community env:** `N8N_COMMUNITY_PACKAGES_ENABLED` not set on CT 101

### What Was Done (this run)
1. ✅ Verified npm package availability (`n8n-nodes-mcp@0.1.37`)
2. ✅ Checked community packages env (not set)
3. ✅ Documented activation prerequisites

### What Was NOT Done (blocked by restart constraint)
1. ❌ Community package not installed (requires restart to take effect)
2. ❌ `N8N_COMMUNITY_PACKAGES_ENABLED` not set (requires env change + restart)
3. ❌ n8n not restarted (hard constraint)
4. ❌ No existing workflows modified
5. ❌ No credentials read

## Activation Prerequisites (for future run)

### Step 1: Enable Community Packages
```bash
# On CT 101, add to n8n environment:
echo 'N8N_COMMUNITY_PACKAGES_ENABLED=true' >> /etc/n8n/n8n.env
```

### Step 2: Install MCP Community Node
```bash
# On CT 101:
pct exec 101 -- npm install -g n8n-nodes-mcp@0.1.37
```

### Step 3: Restart n8n
```bash
# On CT 101:
pct exec 101 -- systemctl restart n8n
```

### Step 4: Verify in UI
- Login to n8n UI
- Check node panel for "MCP Server" trigger
- Create test workflow

### Step 5: Configure MCP Workflow
- Create dedicated MCP workflow (not modifying existing ones)
- Set allowed tools: workflow read, workflow validate
- Deny: credential read, execution delete, workflow activate

## Alternative: No-Restart Workaround
- Activate existing `mcpSmoke001` workflow (Manual Trigger + Code node)
- Use webhook approach for MCP-like functionality
- No restart required
- Already partially configured

## Status
- **N8N_MCP_ACTIVATION_PREPARED:** prerequisites documented
- **N8N_MCP_ACTIVATION_BLOCKED_BY_RESTART:** cannot restart (hard constraint)
- **No secrets exposed**
- **No workflows modified**
