# n8n Execution Summary — Issue #13

**Timestamp (UTC):** 2026-06-29T05:45:30Z

## Execution Details

| Field | Value |
|-------|-------|
| Issue | #13 |
| Run ID | `gh-issue-13-20260629T054530Z` |
| Trigger | Schedule Trigger (15 min) |
| Dispatch time | ~2026-06-29T05:45:00Z |
| Runner | lxc-dev-runner / 192.168.1.53 |
| Evidence path | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-13/gh-issue-13-20260629T054530Z` |

## Label Transition

| Stage | Labels |
|-------|--------|
| Before | `agent:ready`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |
| After | `agent:needs-review`, `evidence:attached`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |

## GitHub Comment — Confirms Stale Values

| Field | Comment Shows | Expected (from runner) | Match? |
|-------|--------------|----------------------|--------|
| Status | `UNKNOWN` | `GREEN` | ❌ |
| Mode | `manual-terminal` | `opencode-run` | ❌ |
| Provider configured | `NO` | `true` | ❌ |
| OpenCode available | `PASS (v1.17.9)` | `true` (v1.17.9) | ✅ |

## Issues #3-#12 Protection

| Check | Result |
|-------|--------|
| All 10 issues protected | ✅ YES |
| No agent:ready | ✅ YES |
| No agent:running | ✅ YES |
| No double-runs | ✅ YES |

## Conclusion

The dispatch pipeline works correctly. The runner executes with DeepSeek provider. BUT the GitHub comment still shows stale values from `RUN_INPUT.json` because:
1. The "SSH Read status.json" node works but returns wrapped output
2. The "Format Evidence Comment" node cannot parse the SSH wrapper
3. Falls back to `prepData` (RUN_INPUT) values

The fix (prepared in `exports/comment-sync-after/`) addresses exactly this issue.
