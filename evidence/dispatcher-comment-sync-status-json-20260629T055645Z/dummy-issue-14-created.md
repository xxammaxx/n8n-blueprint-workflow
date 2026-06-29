# Dummy Issue #14 — Created

**Timestamp (UTC):** 2026-06-29T06:14:30Z
**Evidence Directory:** `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/`

## Issue Details

| Field | Value |
|-------|-------|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/14 |
| Title | [Dummy] Comment sync verification with patched dispatcher (status.json source) |
| Labels | `agent:ready`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |
| Purpose | Verify that GitHub comment uses real Runner Evidence from `status.json` |
| Created at | 2026-06-29T06:14:30Z |

## Expected Flow

1. Schedule Trigger (15 min) fires
2. Dispatcher searches for `agent:ready` issues
3. Picks up Issue #14
4. Guardrails pass (Issue #14 is not blocked)
5. Runner starts on lxc-dev-runner (192.168.1.53)
6. OpenCode runs with DeepSeek provider
7. Runner creates evidence including `status.json`
8. SSH Read node fetches `status.json`
9. **Format Evidence Comment (Node 11) parses `status.json` correctly**
10. **Format Final Result (Node 15) uses evidence data**
11. GitHub Comment posted with correct values from `status.json`

## Expected Comment Values

| Field | Expected |
|-------|----------|
| Evidence source | `status.json` |
| Status | `GREEN` |
| Mode | `opencode-run` |
| Provider configured | `true` |
| Provider | `deepseek` |
| Model | `deepseek-v4-pro` |
| OpenCode | `1.17.9` |
