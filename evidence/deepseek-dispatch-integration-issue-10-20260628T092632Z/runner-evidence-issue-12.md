# Runner Evidence — Issue #12

**Timestamp (UTC):** 2026-06-28T12:34:00Z

## Evidence Path

```
/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-12/gh-issue-12-20260628T123030Z/
```

## Evidence Files (8 files)

| File | Size | Content |
|------|------|---------|
| `RUN_INPUT.json` | 782 B | Original dispatcher input |
| `RUN_INPUT.redacted.json` | 783 B | Redacted input |
| `agent.log` | 926 B | Agent run log — COMPLETE |
| `commands.log` | 273 B | Shell commands executed |
| `github-context.md` | 239 B | GitHub issue metadata |
| `operator-commands.md` | 989 B | Manual handoff instructions |
| `run-report.md` | 2,305 B | Full run report |
| `status.json` | 1,805 B | Machine-readable status |

## Key Evidence — agent.log

```
[2026-06-28T12:31:21Z] requested_mode=manual-terminal
[2026-06-28T12:31:21Z] effective_mode=opencode-run        ← UPGRADED!
[2026-06-28T12:31:21Z] manual_reason=none                  ← No fallback
[2026-06-28T12:31:21Z] opencode_actually_available=true
[2026-06-28T12:31:21Z] opencode_version=1.17.9
[2026-06-28T12:31:21Z] opencode_provider_configured=true   ← PROVIDER LOADED!
[2026-06-28T12:31:21Z] tmux_available=true
```

## Key Evidence — status.json

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

## Verification Gates

| Gate | Status |
|------|--------|
| Evidence directory created | ✅ YES |
| Final report present | ✅ YES (`run-report.md`) |
| Runner logs present | ✅ YES (`agent.log`, `commands.log`) |
| Dispatch script loaded provider env | ✅ YES (direct source, set +e protected) |
| OpenCode provider configured | ✅ `true` |
| Model `deepseek-v4-pro` via DEEPSEEK_API_KEY | ✅ YES (env mapped) |
| No `manual-terminal` fallback as main path | ✅ YES (upgraded to opencode-run) |
| No secrets in evidence | ✅ YES |
| Exit status documented | ✅ YES (`GREEN`) |
| No productive files changed | ✅ YES |
| No GitHub Actions | ✅ YES |
| No auto-merge | ✅ YES |
