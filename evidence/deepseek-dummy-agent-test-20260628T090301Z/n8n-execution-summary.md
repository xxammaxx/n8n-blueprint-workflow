# n8n Execution Summary — DeepSeek Dummy Agent Test

**Timestamp (UTC):** 2026-06-28T09:18:00Z
**Evidence Dir:** `evidence/deepseek-dummy-agent-test-20260628T090301Z/`

## Execution Timeline

| Event | Timestamp (UTC) | Delta |
|-------|----------------|-------|
| Dummy Issue #9 Created | 09:14:30Z | — |
| Schedule Trigger Fired | ~09:15:00Z | ~30s |
| Dispatcher Picked Up Issue | 09:15:29Z | +59s |
| `agent:ready` → `agent:running` | 09:15:29Z | +59s |
| Runner Completed | 09:16:53Z | +143s (2m 23s) |
| GitHub Comment Posted | 09:16:53Z | +143s |
| `agent:running` → `agent:needs-review` + `evidence:attached` | 09:16:53Z | +143s |

## Execution Details

| Field | Value |
|-------|-------|
| Trigger Type | Schedule Trigger (15 min) |
| Schedule Window | ~09:15 UTC |
| Pickup Delay | 59 seconds from issue creation |
| Total Duration | ~84 seconds (runner execution) |
| End-to-End | ~143 seconds (creation to completion) |
| Issue Processed | #9 only |
| Issues #3-#8 Re-processed | NO |

## Dispatcher Behavior

| Check | Result |
|-------|--------|
| Schedule Trigger fired | YES |
| Issue #9 detected with `agent:ready` | YES |
| `agent:ready` removed | YES |
| `agent:running` set | YES |
| Runner dispatched | YES |
| Runner started exactly once | YES |
| Runner completed | YES |
| `agent:running` removed | YES |
| `agent:needs-review` set | YES |
| `evidence:attached` set | YES |
| Runner comment posted | YES |
| Issues #3-#8 NOT touched | YES |

## n8n API Access Note

- n8n REST API: 401 Unauthorized (email auth required)
- n8n API v1: Requires `X-N8N-API-KEY` header (not configured)
- n8n healthz: 200 OK, `{"status":"ok"}`
- Execution data: Observed via GitHub issue label transitions (indirect method)
- SQLite direct access: Not available on CT 101

## Verification Method

Since n8n API is not directly accessible, verification was performed via:
1. GitHub issue #9 label transitions (pre/post comparison)
2. GitHub issue #9 comment content
3. Runner evidence files
4. Issues #3-#8 label comparison (pre/post)
