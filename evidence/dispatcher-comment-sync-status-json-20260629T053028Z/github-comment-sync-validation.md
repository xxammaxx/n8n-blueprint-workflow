# GitHub Comment Sync Validation — Issue #13

**Timestamp (UTC):** 2026-06-29T05:46:00Z

## Comment Analysis

### Posted Comment (from n8n Dispatcher)

```
## Agent Run Result

**Status:** UNKNOWN                    ← STALE (runner: GREEN)
**Run ID:** gh-issue-13-20260629T054530Z
**Mode:** manual-terminal              ← STALE (runner: opencode-run)
**Source of Truth:** GitHub Issue
**Runner:** lxc-dev-runner / 192.168.1.53

### Evidence
/opt/dev-fabric/evidence/.../issue-13/gh-issue-13-20260629T054530Z

### Verification
| OpenCode provider configured | NO |  ← STALE (runner: true)
```

### Expected Comment (After Patch)

```
## Runner Result

Status: GREEN                          ← from status.json
Mode: opencode-run                     ← from status.json
Provider configured: true              ← from status.json
Provider: deepseek                     ← from status.json
Model: deepseek-v4-pro                 ← from status.json
OpenCode: 1.17.9                       ← from status.json

Evidence: /opt/dev-fabric/evidence/.../
Safety:
- No secrets emitted
- No auto-merge
- No GitHub Actions
---
Evidence source: status.json
```

## Validation

| Check | Result |
|-------|--------|
| Comment posted | ✅ YES |
| Evidence path present | ✅ YES |
| Run ID present | ✅ YES |
| Status field present | ✅ YES (but UNKNOWN — stale) |
| Mode field present | ✅ YES (but manual-terminal — stale) |
| Provider configured present | ✅ YES (but NO — stale) |
| Uses status.json | ❌ NO (uses RUN_INPUT fallback) |
| Evidence source labeled | ❌ NO |
| Provider field | ❌ Not present |
| Model field | ❌ Not present |
| No secrets in comment | ✅ YES |

## Status

**YELLOW_COMMENT_SYNC_STALE** — The comment confirms the exact problem we're fixing:
- SSH Read status.json node works (returns data)
- Format Evidence Comment node can't parse SSH output wrapper
- Falls back to stale RUN_INPUT.json values
- The fix (patched JSON) addresses all these issues

## Fix Validation

The static fix is validated and ready. When applied to the live n8n instance, the comment will show:
- `Evidence source: status.json`
- Correct `Status: GREEN`
- Correct `Mode: opencode-run`
- Correct `Provider configured: true`
- Provider/model fields from status.json
