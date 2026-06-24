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

## Symptom: n8n UI Login required for automation

### Root cause: n8n Webinterface is auth-protected
The n8n instance at `http://192.168.1.52:5678` requires email/password authentication. Fresh browser contexts (Playwright, Chrome DevTools MCP) cannot share the existing session.

### Solutions (in priority order):

#### Option A: n8n API Key (RECOMMENDED)
Create an API Key in n8n UI (Settings → API Keys) and use it for API calls instead of browser UI. Store the key in `%USERPROFILE%\.n8n-automation\n8n-api-key.txt` (Windows) or `/home/runner/.config/n8n-automation/n8n-api-key` (Linux). Never store in repo.

```bash
# Example usage pattern (placeholder — never include real key):
export N8N_API_KEY="$(cat /home/runner/.config/n8n-automation/n8n-api-key)"
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://192.168.1.52:5678/api/v1/workflows
```

#### Option B: Playwright persistent storageState (for UI automation)
Open a visible browser, log in manually once, save `storageState` to `%USERPROFILE%\.n8n-automation\playwright\n8n-storage-state.json`. Future Playwright sessions load this to skip login. File is a SECRET — never commit to repo.

#### Option C: Temporarily disable n8n login (RED_HOLD)
Requires separate explicit approval. See `docs/n8n-auth-automation.md`. Only for emergencies, max 15 minutes, must re-enable immediately.

#### Option D: Login credentials in file (YELLOW_REVIEW — LAST RESORT)
Not recommended. Only if Options A/B/C are impossible. Requires separate approval.

### Reference: `docs/n8n-auth-automation.md`

## Symptom: GitHub Credential not found in n8n

### Check credential exists:
Log into n8n UI → Credentials → look for `github-n8n-blueprint`.

### If credential missing:
1. n8n UI → Credentials → Add Credential
2. Type: **GitHub API**
3. Name: `github-n8n-blueprint`
4. Authentication: **Access Token**
5. Token: Personal Access Token (classic) with `repo` scope
6. Save and run Connection Test

### If credential exists but nodes fail:
Check that the HTTP Request nodes reference the correct credential type (`githubApi`) and name (`github-n8n-blueprint`). Verify the token has not expired and has `repo` scope.

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
n8n requires workflows to be published (active) for MCP `execute_workflow` in default `production` mode. Manual Trigger nodes are not publishable triggers. n8n considers only webhooks, cron schedules, and polling nodes as valid triggers.

### Fix: Use `executionMode: "manual"`
Add `"executionMode": "manual"` to the execute_workflow arguments to bypass the publish requirement:
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
This works for non-published Manual Trigger workflows. Verified with Execution #20: `status:success` (106ms).

### Alternative: Use Webhook trigger
Replace Manual Trigger with a Webhook node to make the workflow publishable for `production` mode. The webhook endpoint is internal-only (192.168.1.52) and harmless for smoke testing.

### Additional: get_execution parameter requirements
`get_execution` requires BOTH `executionId` AND `workflowId` parameters — not just executionId:
```json
{ "executionId": "20", "workflowId": "mcpSmoke001" }
```
### Additional: test_workflow parameter requirements
`test_workflow` requires `pinData` parameter. Use empty object `{}` for workflows without pin data:
```json
{ "workflowId": "mcpSmoke001", "pinData": {} }
```

### Alternative: Test via n8n UI
Even without MCP execution, the workflow can be manually executed in the n8n editor UI to verify it works.

## Symptom: SSH expressions not resolved (`{{ $json.xxx }}` appears literally)

### Root cause: SSH Node in Fixed Mode instead of Expression Mode
n8n SSH nodes have two input modes for the `command` parameter:
- **Fixed Mode** (default): Text is treated as a literal string. `{{ $json.run_input_b64 }}` is NOT resolved — bash sees the literal text.
- **Expression Mode**: Text is evaluated as an n8n expression. `{{ }}` placeholders are resolved to their actual values.

### Fix: Switch to Expression Mode
1. Open the SSH node in n8n UI
2. Click the **fx** (expression) toggle button next to the Command field — it switches from grey (Fixed) to blue/green (Expression)
3. Ensure all `{{ }}` expressions are resolved in the node output preview
4. Save the workflow

### Verification
After switching to Expression Mode, the SSH node output should contain resolved values, not literal `{{ }}` strings. Example of correct output:
```json
{"ok":true,"phase":"ssh_write_run_input","path":"/opt/dev-fabric/evidence/...","bytes":779}
```

## Symptom: Wait node stuck forever

### Root cause: "At a Specific Time" mode (Hours) instead of "After Time Interval"
The n8n Wait node has two modes:
- **"After Time Interval"** (`timeInterval`): Waits for a relative duration (e.g., 5 seconds)
- **"At a Specific Time"** (`hours`): Waits until an absolute date/time in the future

If the Wait node is set to **"At a Specific Time"** with value `5` and unit `Hours`, it waits until 5:00 AM on some date — which could be **hours or forever**. The SSH Read node never gets to execute because the Wait node never finishes.

### Fix: Use "After Time Interval" mode
1. Open the Wait node in n8n UI
2. Set **Resume** field to **"After Time Interval"**
3. Set **Amount** to `5`
4. Set **Unit** to **"Seconds"**
5. Save the workflow

### Correct configuration in exported JSON:
```json
{
  "parameters": {
    "mode": "timeInterval",
    "amount": 5,
    "unit": "seconds"
  }
}
```

## Symptom: "Validate Issue Contract" blocks workflow

### Root cause: Missing `labels` array in Pin Data
The Validate Issue Contract node (JS Code) expects `input.body.labels` to be an array. When triggering manually with Pin Data, if the `labels` field is missing or not an array, the validation throws an error.

### Fix: Include labels in Pin Data
When setting Pin Data for manual testing, ensure the `labels` array is present:
```json
{
  "owner": "xxammaxx",
  "repo": "n8n-blueprint-workflow",
  "issue_number": 1,
  "labels": ["agent:queued"]
}
```
Valid values: `agent:queued` (waiting) or `agent:ready` (start signal).

### Verification
Check the node execution output — it should show `validation_passed: true` or similar.

## Symptom: `start_github_issue_run.sh unknown argument`

### Root cause: Missing `--input-json` flag
The `start_github_issue_run.sh` script on the Runner requires the `--input-json` flag before the path argument. Without it, the script interprets the path as an unknown positional argument and fails.

### Fix: Add `--input-json` flag
In the SSH Start node command, ensure the flag is present:
```bash
# CORRECT:
ssh .../start_github_issue_run.sh --input-json '/path/to/RUN_INPUT.json'

# WRONG (fails):
ssh .../start_github_issue_run.sh '/path/to/RUN_INPUT.json'
```

### Verification
Exit code should be 0. The script outputs a JSON line confirming the run.

## Symptom: `bash: json: unbound variable` in SSH node

### Root cause: Expression not resolved — literal text treated as bash variable
When an SSH node is in **Fixed Mode** (not Expression Mode), n8n does not resolve `{{ $json.run_input_remote }}`. The literal text `{{ $json.run_input_remote }}` is passed to bash. Bash interprets `$json` as an undefined variable, causing `unbound variable` error if `set -u` is active.

### Fix options:
1. **Primary fix:** Switch the SSH node to **Expression Mode** (fx toggle) — this resolves `{{ }}` expressions before sending to bash
2. **Alternative:** Use explicit node references like `{{ $node["Prepare RUN_INPUT.json"].json.run_input_remote }}` — but this also requires Expression Mode to resolve

### Diagnosis
Check the SSH node's execution output for the exact command that ran. If it contains literal `{{ }}` characters, the node was in Fixed Mode.

## Symptom: SSH Node Expression Mode — "node green but command fails"

**Symptom:** SSH node shows green/success but the command didn't work (template variables not resolved, empty paths, usage errors).

**Root Cause:** SSH command field is in **Fixed mode** (default in n8n). In Fixed mode, `{{$json.field}}` expressions are passed literally to bash.

**Fix:**
1. Open the SSH node
2. Click the "fx" toggle next to the Command field to switch to **Expression mode**
3. Template expressions will now be highlighted (blue/purple) and resolved before sending to SSH

**Verification:** The command should show the Expression radio button active, and `{{...}}` parts highlighted.

## Symptom: Node 11/12 GitHub API gets 404 — "resource not found"

**Symptom:** GitHub Add Labels or Remove Label node returns HTTP 404 "Not Found" even though the issue exists. Labels are not applied.

**Root Cause (data flow):** The URL expression uses `$json.owner`, `$json.repo`, `$json.issue_number`. After Node 10 (GitHub Comment API) executes, `$json` contains the GitHub API comment response (`url`, `html_url`, `id`, `body`, etc.), NOT the original issue identifiers. The URL resolves to something like `api.github.com/repos/undefined/undefined/undefined/labels` instead of the correct issue URL.

**Diagnosis:**
1. Open the failing node's execution output
2. Check the "Request URL" field — if it contains `undefined` or the comment response URL, the data flow is wrong
3. Check the "Input" section — if `owner`, `repo`, `issue_number` are missing, the node is receiving wrong data

**Fix — Use a stable data source:**
Replace `$json.owner` / `$json.repo` / `$json.issue_number` with explicit cross-node references to the Prepare node:

```javascript
// CORRECT - references Prepare node directly:
$('Prepare RUN_INPUT.json').first().json.owner
$('Prepare RUN_INPUT.json').first().json.repo
$('Prepare RUN_INPUT.json').first().json.issue_number

// WRONG - unstable after GitHub API calls:
// $json.owner
// $json.repo
// $json.issue_number
```

**Why:** The Prepare RUN_INPUT.json node (Node 3) produces the issue data BEFORE any API calls. Its output is stable and always contains `owner`, `repo`, `issue_number`. Cross-node references (`$('Node Name').first().json.field`) bypass the `$json` overwrite problem.

**Prevention:** Any node that calls an external API will overwrite `$json`. Always use `$('Prepare RUN_INPUT.json').first().json.*` for issue context data in nodes after GitHub API calls.

**Also check:**
- If using GitHub API nodes: `$json` is overwritten by each API response
- The Remove Label node should have "On Error: Continue" set (`continueOnFail: true`) to tolerate 404 when `agent:running` label doesn't exist
- If the label name contains special characters (like `:`), URL-encode it: `agent%3Arunning`
