# Troubleshooting Guide

## Symptom: Form returns HTTP 404 / "Problem loading form"

### Check n8n service
```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "systemctl status n8n --no-pager"'
```

### Check workflow activation
Look for "No webhook path could be found" in n8n logs:
```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "journalctl -u n8n --no-pager | grep -i webhook"'
```

### Verify workflow is published
```bash
n8n export:workflow --all --published
```
The workflow should appear in the export output.

### Common root cause: workflow_published_version = 0
Even after successful publish, some workflows get stuck with `workflow_published_version = 0`.
This prevents webhook registration.

**Workaround:** Create a NEW workflow with a NEW form path. Do not attempt to repair the broken one.

## Symptom: SSH node fails

### Check SSH credential
Verify `dev-runner-ssh` credential exists in n8n credential store and is not expired.

### Test SSH manually
```bash
ssh -i /path/to/key runner@192.168.1.136 -p 22
```

### Check runner container
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "whoami; hostname"'
```

## Symptom: Code node error — `SyntaxError: missing ) after argument list`

### Root cause: Corrupted JS code
The V2 workflow export/import process corrupts single quotes in JavaScript:
```javascript
// WRONG after import:
const crypto = require(''crypto'');  // doubled quotes!
Buffer.from(data, ''base64'').toString(''utf8'');
```

**Fix:** Replace `''word''` with `'word'` in all JS Code nodes. Use the targeted fix script:
```python
text = text.replace("''crypto''", "'crypto'")
text = text.replace("''utf8''", "'utf8'")
text = text.replace("''base64''", "'base64'")
text = text.replace("''hex''", "'hex'")
```

## Symptom: Code node error — `Module 'crypto' is disallowed`

### Root cause: n8n task runner blocks crypto
n8n v2.26.8's JS Task Runner blocks `require('crypto')`. The `crypto` built-in Node.js module is not in the allowed list.

**Fix:** Replace `crypto` calls with pure-JavaScript alternatives:
- Instead of `require('crypto')`: remove the line entirely
- Instead of `crypto.randomBytes(3).toString('hex')`: use `Math.floor(Math.random()*16777216).toString(16).padStart(6,'0')`
- Instead of `crypto.createHash('sha256')...`: use a simple hash via `TextEncoder`

## Symptom: Form submission returns HTTP 200 but all fields are null

### Root cause: curl multipart parsing bug
n8n v2.26.8 Form Trigger V2 does not correctly parse fields from curl's multipart/form-data submissions. The server accepts the request (HTTP 200) but all form field values are `null`.

**Workaround:** Submit through the browser-rendered HTML form at the production URL. Browser-based submissions work correctly.

**Diagnosis:** Check execution data for null field values:
```sql
SELECT data FROM execution_data WHERE executionId=<ID>;
-- Look for: "project_slug":null,"project_title":null,...
```

## Symptom: SSH nodes work but evidence not created — `Permission denied`

### Root cause: Runner user lacks write permissions
The `runner` user on LXC 102 cannot create directories under `/opt/dev-fabric/`. The parent directories (`/opt/dev-fabric/workspaces/`, etc.) are `runner:runner` but subdirectories (`projects/`, `blueprint-bootstrap/`) are `root:root` with no write for others (755).

**Fix (limited scope — only operational subdirs, NOT n8n or system paths):**
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "
chown -R runner:runner /opt/dev-fabric/workspaces/projects
chown -R runner:runner /opt/dev-fabric/evidence/blueprint-bootstrap
chown -R runner:runner /opt/dev-fabric/logs/blueprint-bootstrap
chmod 750 /opt/dev-fabric/workspaces/projects /opt/dev-fabric/evidence/blueprint-bootstrap /opt/dev-fabric/logs/blueprint-bootstrap
"'
```

**Verify:**
```bash
ssh root@192.168.1.136 'pct exec 102 -- runuser -u runner -- bash -c "mkdir -p /opt/dev-fabric/workspaces/projects/test && echo ok && rmdir /opt/dev-fabric/workspaces/projects/test"'
# Expected: "ok"
```

### Check SSH credential
Verify `dev-runner-ssh` credential exists in n8n credential store and is not expired.

### Code node issues
- **Doubled quotes in JS:** See syntax error section above
- **`crypto` module blocked:** See module disallowed section above
- File not parsed correctly (check mimetype)
- Blueprint text empty when file missing (add validation)
- Invalid project_slug (must match `^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$`)
- Template file not found on runner

## Symptom: SSH Node reports green but command doesn't execute

### Root cause: Missing `mode: command` in SSH node parameters
n8n SSH nodes require `"mode": "command"` in the parameters to execute bash commands. Without this, n8n may default to SFTP/create mode which uploads files but doesn't execute commands. The node reports "success" because the connection/upload succeeds, but no command runs on the runner.

**Fix:** In the exported workflow JSON, ensure all SSH nodes have `"mode": "command"`:
```json
"parameters": {
    "protocol": "ssh",
    "host": "192.168.1.53",
    "port": 22,
    "username": "runner",
    "mode": "command",
    "command": "set +e\n..."
}
```

**Fix via n8n UI:**
1. Open the SSH node settings
2. Set "Operation" / "Mode" dropdown to "Execute Command"
3. Verify the credential is set to `dev-runner-ssh`
4. Save the workflow

**Verification:** After fixing, the SSH node output should contain the expected JSON (e.g., `{"ok":true,"phase":"ssh_write_run_input",...}`).

### Additional SSH Write Issue: SFTP/create doesn't create parent directories
When using SFTP mode, n8n's SSH node does NOT create parent directories. If `/opt/dev-fabric/evidence/github-agent-runs/...` doesn't exist yet, the file upload fails silently.

**Fix:** Always use command mode with `mkdir -p` before writing:
```bash
RUN_INPUT_PATH="/opt/dev-fabric/evidence/..."
RUN_INPUT_DIR="$(dirname "$RUN_INPUT_PATH")"
mkdir -p "$RUN_INPUT_DIR"
printf '%s' '{{$json.run_input_b64}}' | base64 -d > "$RUN_INPUT_PATH"
```

## Symptom: Runner script fails

### Check runner logs
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "find /opt/dev-fabric/evidence -name commands.log -exec tail -50 {} \;"'
```

### Check disk space
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "df -h /opt"'
```

### Check permissions
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "ls -lah /opt/dev-fabric/scripts/"'
```

## Symptom: n8n MCP not visible in Settings

### Check n8n version
n8n Instance-level MCP requires n8n >= 2.x (Preview feature).
```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "n8n --version"'
```
Expected: 2.26.8 or higher.

### Check Settings menu
Navigate to: n8n UI → Settings (left sidebar gear icon) → scroll to "Instance-level MCP"
If not visible at n8n >= 2.x, the feature may be disabled via environment variable:
```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "env | grep -i mcp"'
```

### MCP disabled — expected behavior
If MCP is visible but the toggle is OFF, this is normal. MCP must be explicitly enabled:
1. Go to Settings → Instance-level MCP
2. Click "Enable MCP access"
3. Generate auth token
4. Only expose dedicated test workflow (not production)

## Symptom: Chrome DevTools MCP fails to start

### Check prerequisites
```bash
node -v     # Expected: >= 18
npm -v      # Expected: >= 9
```

### Check Chrome version
Chrome DevTools MCP requires Chrome >= 144:
```powershell
(Get-Item "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe").VersionInfo.ProductVersion
# Expected: >= 144
```

### Test installation
```bash
npx -y chrome-devtools-mcp@latest --help
```

### Use slim mode if resource constrained
```bash
npx -y chrome-devtools-mcp@latest --slim --isolated
```

## Symptom: Playwright CLI tests abort with LOGIN_REQUIRED

This is expected behavior when n8n requires authentication. The test spec includes a graceful abort:

```typescript
test.skip(loginVisible, 'LOGIN_REQUIRED — n8n sign-in page detected.');
```

**Workaround:** Log into n8n manually in a browser first, then run tests (session reuse). Or configure Playwright with a dedicated auth state file (not stored in repo).

## Symptom: BrowserMCP evaluation needed

BrowserMCP is NOT installed. It was evaluated as a potential auth-session fallback but carries profile access risk. See `docs/browser-automation-strategy.md` for the tiered approach. Do not install BrowserMCP without separate approval.

## Symptom: MCP tools/list returns HTTP 401

### Check: Token format
n8n MCP uses JWT Bearer tokens. Verify the token was copied correctly from the Access Token tab (not the OAuth config JSON).

### Check: Authorization header
```
Authorization: Bearer <token>
```
Ensure there is exactly one space after "Bearer".

### Check: Token not expired
The JWT has an `iat` (issued at) claim. If the token was generated and then the MCP was disabled/re-enabled, the old token becomes invalid. Generate a new token in Settings → MCP → Connection Details → Access Token.

## Symptom: MCP returns HTTP 406 "Not Acceptable"

### Root cause: Missing SSE Accept header
n8n MCP uses Server-Sent Events (SSE) for streaming responses. The client must accept both JSON and event-stream content types.

### Fix: Add Accept header
```
Accept: application/json, text/event-stream
```

Without this header, all MCP requests return HTTP 406.

### Full working curl example:
```bash
curl -s -X POST http://192.168.1.52:5678/mcp-server/http \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer $N8N_MCP_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Symptom: MCP execute_workflow fails with "no published version"

### Root cause: Manual Trigger workflow cannot be published
n8n requires workflows to be published (active) for MCP execution. Manual Trigger nodes are not publishable triggers. n8n considers only webhooks, cron schedules, and polling nodes as valid triggers.

### Fix: Use Webhook trigger
Replace Manual Trigger with a Webhook node to make the workflow publishable. The webhook endpoint is internal-only (192.168.1.52) and harmless for smoke testing.

### Alternative: Test via n8n UI
Even without MCP execution, the workflow can be manually executed in the n8n editor UI to verify it works.
