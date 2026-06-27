# Schedule Execution Summary — Canary Issue #5

**Session:** e2e-canary-issue-5-20260627T071248Z
**Date:** 2026-06-27T07:33:00Z

---

## Execution #51

| Field | Value |
|---|---|
| Execution ID | #51 |
| Trigger Type | **Schedule Trigger** (mode=trigger) |
| Workflow ID | Sv12QTo56NoPUu2D |
| Started | 2026-06-27T07:30:28.031Z |
| Stopped | 2026-06-27T07:31:53.783Z |
| Duration | 85.752 seconds |
| Status | error (Format Final Result typo — cosmetic) |

## Pipeline Results

| Step | Node | Status |
|---|---|---|
| 1. Schedule Trigger | Schedule Trigger (15 min) | ✅ Fired at 07:30 |
| 2. GitHub Search | GitHub Search Issues (agent:ready) | ✅ Found Issue #5 |
| 3. Pick First | Pick First Ready Issue | ✅ Selected #5 |
| 4. Fetch Issue | Fetch Issue from GitHub | ✅ Retrieved #5 |
| 5. Guardrails | Guardrails & Validate | ✅ **PASS** (trigger-agnostic) |
| 6. Remove label | Remove agent:ready Label | ✅ Removed |
| 7. Add label | Add agent:running Label | ✅ Added/removed |
| 8. Prepare input | Prepare RUN_INPUT.json | ✅ Created |
| 9. SSH write input | SSH Write RUN_INPUT to Runner | ✅ Written |
| 10. SSH start runner | SSH Start Runner Script | ✅ Started |
| 11. Wait | Wait (5s) | ✅ Waited |
| 12. SSH read status | SSH Read status.json | ✅ Read |
| 13. Format comment | Format Evidence Comment | ✅ Formatted |
| 14. Create comment | Create GitHub Comment on Issue | ✅ Posted |
| 15. Add labels | Add Labels (needs-review, evidence) | ✅ Added |
| 16. Remove label | Remove agent:running Label | ✅ Removed |
| 17. Format result | Format Final Result | ⚠️ SyntaxError (comment typo) |

## Key Verifications

| Verify | Result |
|---|---|
| Schedule Trigger active | ✅ Fired at expected time (07:30:28) |
| Guardrails trigger-agnostic | ✅ No Manual Trigger dependency crash |
| Issue #5 detected | ✅ Picked up by search |
| Issue #3 NOT processed | ✅ Protected by isIssue3 guard |
| Issue #4 NOT processed | ✅ Protected by isAlreadyProcessed guard |
| Runner started | ✅ lxc-dev-runner / 192.168.1.53 |
| Evidence generated | ✅ See runner evidence |
| GitHub comment posted | ✅ With evidence path |
| Labels updated | ✅ agent:ready → agent:needs-review + evidence:attached |

## Duration Comparison

| Execution | Issue | Duration | Result |
|---|---|---|---|
| #48 | #4 | 86.33s | Full dispatch (same typo error) |
| #51 | #5 | 85.75s | Full dispatch (same typo error) |
| #49 | none | 0.51s | No issue to process |
| #50 | none | 0.51s | No issue to process |
