# Runner status.json Structure

**Source:** Issue #12 Runner Evidence  
**Path:** `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-12/gh-issue-12-20260628T123030Z/status.json`

## Actual Structure (Issue #12)

```json
{
  "status": "GREEN",
  "mode": {
    "requested": "manual-terminal",
    "effective": "opencode-run",
    "manual_reason": ""
  },
  "agent_runtime": {
    "opencode_available": true,
    "opencode_version": "1.17.9",
    "opencode_provider_configured": true,
    "tmux_available": true
  }
}
```

## Field Verification

| Field | Path | Present | Value (Issue #12) |
|-------|------|---------|-------------------|
| `status` | `.status` | ✅ YES | `"GREEN"` |
| `effective_mode` | `.mode.effective` | ✅ YES | `"opencode-run"` |
| `opencode_provider_configured` | `.agent_runtime.opencode_provider_configured` | ✅ YES | `true` |
| `open_code_version` | `.agent_runtime.opencode_version` | ✅ YES | `"1.17.9"` |
| `provider` | `.provider` | ❌ NOT in status.json v1 | N/A |
| `model` | `.model` | ❌ NOT in status.json v1 | N/A |
| `exit_code` | `.exit_code` | ❌ NOT in status.json v1 | N/A |
| `evidence_path` | (from evidence_dir) | ✅ Constructed from `evidence_dir` | See below |

## Additional Evidence Files

| File | Present | Notes |
|------|---------|-------|
| `status.json` | ✅ YES (1,805 B) | Machine-readable status (structure above) |
| `agent.log` | ✅ YES (926 B) | Contains `effective_mode`, `provider`, `model`, etc. |
| `run-report.md` | ✅ YES (2,305 B) | Full human-readable report |
| `RUN_INPUT.json` | ✅ YES (782 B) | Original dispatcher input |
| `RUN_INPUT.redacted.json` | ✅ YES (783 B) | Redacted safe version |

## agent.log Fields (Issue #12)

```
requested_mode=manual-terminal
effective_mode=opencode-run
opencode_provider_configured=true
opencode_version=1.17.9
```

The agent.log contains `provider` and `model` if the runner was updated to include them after the dispatch script patch. These may not be present in older status.json versions.

## SSH Node Output Format

When the "SSH Read status.json" node (ID `592fc2b2-...`) executes `jq . "$STATUS_PATH"`, the n8n SSH node returns:

```json
{
  "success": true,
  "stdout": "{\n  \"status\": \"GREEN\",\n  \"mode\": {\n    \"requested\": \"manual-terminal\",\n    \"effective\": \"opencode-run\",\n    \"manual_reason\": \"\"\n  },\n  \"agent_runtime\": {\n    \"opencode_available\": true,\n    \"opencode_version\": \"1.17.9\",\n    \"opencode_provider_configured\": true,\n    \"tmux_available\": true\n  }\n}\n",
  "exitCode": 0
}
```

The `stdout` field contains the raw `jq` output as a string. This must be parsed with `JSON.parse()`.

## Secret Hygiene

| Check | Result |
|-------|--------|
| Secret values in status.json | ❌ NO |
| API keys in status.json | ❌ NO |
| Passwords in status.json | ❌ NO |
| Safe to parse and display | ✅ YES |
