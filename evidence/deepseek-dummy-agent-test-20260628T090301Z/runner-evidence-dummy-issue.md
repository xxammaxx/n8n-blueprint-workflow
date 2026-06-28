# Runner Evidence — Dummy Issue #9

**Timestamp (UTC):** 2026-06-28T09:18:00Z
**Evidence Dir:** `evidence/deepseek-dummy-agent-test-20260628T090301Z/`

## Evidence Path

```
/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-9/gh-issue-9-20260628T091530Z/
```

## Evidence Files

| File | Size | Content |
|------|------|---------|
| `RUN_INPUT.json` | 779 B | Original dispatcher input (contains env vars — NOT exposed) |
| `RUN_INPUT.redacted.json` | 780 B | Redacted input (safe for review) |
| `agent.log` | 989 B | Agent run log (timestamps, mode, version) |
| `commands.log` | 274 B | Shell commands executed |
| `github-context.md` | 237 B | GitHub issue metadata |
| `operator-commands.md` | 991 B | Manual handoff instructions |
| `run-report.md` | 2,360 B | Full run report |
| `status.json` | 1,866 B | Machine-readable status |

## Key Evidence Contents

### Status
- **Run Status:** `GREEN_PARTIAL`
- **Run ID:** `gh-issue-9-20260628T091530Z`
- **Source of Truth:** GitHub

### Agent Runtime
- **OpenCode Available:** ✅ true (v1.17.9)
- **OpenCode Provider Configured:** ❌ false
- **Tmux Available:** ✅ true
- **Hermes Available:** ❌ false

### Mode
- **Requested:** `manual-terminal`
- **Effective:** `manual-terminal`
- **Reason:** Safe default — no agent autonomy

### Approval Policy (All Denied)
- Push: false
- PR: false
- Merge: false
- GitHub Actions: false
- Provider/API-Key config: false

## DeepSeek/OpenCode Usage

| Check | Result |
|-------|--------|
| OpenCode binary present | ✅ v1.17.9 |
| OpenCode provider configured | ❌ NO |
| DeepSeek provider used | ❌ NO (not configured in runner dispatch script) |
| Agent autonomy | ❌ NO (`manual-terminal` mode) |
| Provider env sourced | ❌ NO |

## Explanation

The runner's `start_github_issue_run.sh` script does NOT source the provider environment file (`/opt/dev-fabric/secrets/opencode-provider.env`). The DeepSeek provider IS configured on the system (proven in Phase 2), but the runner dispatch pipeline doesn't use it. This is the expected current behavior — the `manual-terminal` mode is the fallback when no provider is configured for the agent run.

**This is NOT a DeepSeek provider failure.** It's an architectural gap: the runner dispatch script needs to be updated to optionally source the provider env file and pass it to OpenCode.

## Secret Check

| Check | Result |
|-------|--------|
| Secrets in evidence files | ❌ NO |
| API keys in evidence | ❌ NO |
| `RUN_INPUT.json` exposed | ❌ NO (redacted version provided) |
| `RUN_INPUT.redacted.json` safe | ✅ YES |

## Integrity

| Check | Result |
|-------|--------|
| Evidence directory created | ✅ YES |
| Final report present | ✅ YES (`run-report.md`) |
| Runner logs present | ✅ YES (`agent.log`) |
| OpenCode/DeepSeek usage belegbar | ⚠️ PARTIAL (OpenCode available but not configured for this run) |
| No secrets | ✅ YES |
| Exit status documented | ✅ YES (`GREEN_PARTIAL`) |
| No productive files changed | ✅ YES |
| No GitHub Actions | ✅ YES |
| No auto-merge | ✅ YES |
