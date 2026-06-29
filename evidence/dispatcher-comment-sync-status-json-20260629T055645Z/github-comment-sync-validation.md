# GitHub Comment Sync Validation — Issue #16

**Timestamp (UTC):** 2026-06-29T06:50:00Z

## Actual Comment (Issue #16)

```
## Runner Result

Status: GREEN
Mode: opencode-run
Provider configured: true
Provider: deepseek
Model: deepseek-v4-pro
OpenCode: 1.17.9

Evidence: /opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-16/gh-issue-16-20260629T064530Z

Safety:
- No secrets emitted
- No auto-merge
- No GitHub Actions

---
Evidence source: status.json
```

## Validation Against Expected

| Field | Expected | Actual | Match |
|-------|----------|--------|-------|
| Evidence source | `Evidence source: status.json` | `Evidence source: status.json` | ✅ |
| Status | `GREEN` | `GREEN` | ✅ |
| Mode | `opencode-run` | `opencode-run` | ✅ |
| Provider configured | `true` | `true` | ✅ |
| Provider | `deepseek` | `deepseek` | ✅ |
| Model | `deepseek-v4-pro` | `deepseek-v4-pro` | ✅ |
| OpenCode | `1.17.9` | `1.17.9` | ✅ |
| Evidence path present | Yes | Yes | ✅ |
| Safety section | Present | Present | ✅ |
| No secrets | Yes | Yes | ✅ |

## Comparison: Before vs After

| Field | Issue #12 (Old) | Issue #16 (New) |
|-------|-----------------|-----------------|
| Comment title | `## Agent Run Result` | `## Runner Result` |
| Status | `UNKNOWN` ❌ | `GREEN` ✅ |
| Mode | `manual-terminal` ❌ | `opencode-run` ✅ |
| Provider configured | `NO` ❌ | `true` ✅ |
| Provider | Not shown | `deepseek` ✅ |
| Model | Not shown | `deepseek-v4-pro` ✅ |
| OpenCode | Not shown | `1.17.9` ✅ |
| Evidence source | Not labeled | `status.json` ✅ |
| Data source | RUN_INPUT.json (stale) | status.json (runner) ✅ |

## Decision

✅ **COMMENT_SYNC_GREEN** — GitHub comment now uses real Runner Evidence from `status.json`. All values match expected. Evidence source explicitly labeled.
