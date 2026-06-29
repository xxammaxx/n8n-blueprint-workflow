# Workflow Patch Applied — Status

**Timestamp (UTC):** 2026-06-29T05:34:00Z

## Patch Status

| Item | Value |
|------|-------|
| Patch prepared | ✅ YES — modified JSON file ready |
| Patch applied to live n8n | ❌ BLOCKED — no API/UI auth available |
| Patch method | n8n UI manual edit required |
| Blocked by | n8n API: 401 (no JWT token), n8n UI: sign-in page (no credentials) |

## Patch Details

| Item | Value |
|------|-------|
| Affected nodes | 2 (Node 11: Format Evidence Comment, Node 15: Format Final Result) |
| Triggers unchanged | ✅ Manual Trigger + Schedule Trigger |
| Credentials unchanged | ✅ All 10 credentials match |
| Node count | 18 → 18 (unchanged) |
| Active status | true → true (unchanged) |

## Patched Files

| File | Path | SHA256 |
|------|------|--------|
| Before snapshot | `exports/comment-sync-before/dispatcher-Sv12QTo56NoPUu2D-before-comment-sync-20260629T053028Z.json` | `446AEE48...` |
| After (patched) | `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-after-comment-sync-20260629T053028Z.json` | `17A4159C...` |

## Deployment Instructions (Manual)

To apply the fix to the live n8n instance:

1. Navigate to `http://192.168.1.52:5678` and sign in
2. Open workflow `Sv12QTo56NoPUu2D` — "GitHub Ready Issue → Runner Agent Dispatch"
3. Locate **Node 11: "Format Evidence Comment"** (ID `25d2cbd3-...`)
4. Replace the entire JavaScript code with the contents from the patched JSON file (search for node `25d2cbd3-b919-4f19-9f41-5aac51841742` in the `after` export)
5. Locate **Node 15: "Format Final Result"** (ID `f1aedb55-...`)
6. Replace the JavaScript code with the contents from the patched JSON file (search for node `f1aedb55-8b84-4886-85be-8a672817add5`)
7. Save and publish the workflow

## Rollback

To rollback, restore the original JS code from the `before` snapshot.

## Constraints

| Constraint | Status |
|------------|--------|
| No trigger changes | ✅ |
| No schedule changes | ✅ |
| No credential changes | ✅ |
| No guardrail changes | ✅ |
| No runner start logic changes | ✅ |
| No issue selection changes | ✅ |
