# n8n Executions Read-Only Check

**Date/Time UTC:** `2026-06-27T11:31Z`
**Method:** Playwright MCP (UI + network API intercept)

---

## 1. Execution Summary

| Metric | Value |
|--------|-------|
| Total executions in n8n | 27 |
| Visible in UI (last 10) | 10 |
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Observation window | 11:15–13:30 CEST (09:15–11:30 UTC) |

---

## 2. Recent Execution History (Last 10)

| ID | Timestamp (CEST) | Timestamp (UTC) | Status | Mode | Duration | Details |
|----|------------------|-----------------|--------|------|----------|---------|
| #67 | 13:30:28 | 11:30:28 | ✅ Success | trigger | 353ms | No `agent:ready` issues |
| #66 | 13:15:28 | 11:15:28 | ✅ Success | trigger | 410ms | No `agent:ready` issues |
| #65 | 13:00:28 | 11:00:28 | ✅ Success | trigger | 465ms | No `agent:ready` issues |
| #64 | 12:45:28 | 10:45:28 | ✅ Success | trigger | 392ms | No `agent:ready` issues |
| #63 | 12:30:28 | 10:30:28 | ✅ Success | trigger | 408ms | No `agent:ready` issues |
| #62 | 12:15:28 | 10:15:28 | ✅ Success | trigger | 455ms | No `agent:ready` issues |
| **#61** | **12:00:28** | **10:00:28** | **❌ Error** | **trigger** | **86.5s** | **Found issue #7, processed pipeline → failed at Format Final Result** |
| #60 | 11:45:28 | 09:45:28 | ✅ Success | trigger | 463ms | No `agent:ready` issues |
| #59 | 11:30:28 | 09:30:28 | ✅ Success | trigger | 463ms | No `agent:ready` issues |
| #58 | 11:15:28 | 09:15:28 | ✅ Success | trigger | 405ms | No `agent:ready` issues |

---

## 3. Execution #61 Error Details

| Field | Value |
|-------|-------|
| Failed Node | `Format Final Result` |
| Error Type | `SyntaxError` |
| Error Message | `Unexpected token '==='` |
| Node Execution Time | 26ms |
| Autosave Version | `bb201347-cb81-4085-a2ae-89192692e0d1` (active version) |

### All 14 Preceding Nodes: ✅ SUCCESS
1. Manual Trigger (Smoke Test)
2. Fetch Issue from GitHub
3. Guardrails & Validate
4. Remove `agent:ready` Label
5. Add `agent:running` Label
6. Prepare RUN_INPUT.json
7. SSH Write RUN_INPUT to Runner
8. SSH Start Runner Script
9. Wait (5s)
10. SSH Read status.json
11. Format Evidence Comment (12 items output)
12. Create GitHub Comment on Issue
13. Add Labels (agent:needs-review, evidence:attached)
14. Remove agent:running Label (404-tolerant)

### Assessment
- Issue #7 was **fully processed** — all pipeline steps completed
- Runner evidence created, GitHub comment posted, labels correctly set
- Error isolated to the final formatting/output node
- Issue remains properly guarded (`agent:needs-review` + `evidence:attached`)
- **Not a regression** — this is the execution that the GREEN_BASELINE refers to as "Last confirmed fire"

---

## 4. Schedule Cadence Check

| Metric | Value |
|--------|-------|
| All executions mode | `trigger` (Schedule) |
| Interval pattern | Exactly every 15 minutes at :00, :15, :30, :45 |
| Missed ticks | ❌ None |
| Overlapping executions | ❌ None |
| Double-runs | ❌ None detected |

---

## 5. Execution Pattern Analysis

| Pattern | Count | Meaning |
|---------|-------|---------|
| Fast executions (~350-465ms) | 9 of 10 | No `agent:ready` issues found — short-circuited at GitHub Search |
| Full pipeline (86.5s) | 1 of 10 | Execution #61 found issue #7 and processed it |

**This is the expected pattern** when no new `agent:ready` issues are created. The dispatcher checks every 15 minutes, finds nothing, and completes quickly.

---

## 6. Older Executions

| Metric | Value |
|--------|-------|
| Total historic executions | 27 |
| Executions paginated beyond limit=10 | 17 |
| Older failed executions | Unknown (not visible in current window) |

---

## 7. Assessment

**Status:** `GREEN_WITH_NOTES` ⚠️

The schedule is running perfectly — 15-minute cadence, no missed ticks, no duplicates. The lone error (#61) is the exact execution referenced by the GREEN_BASELINE as "Last confirmed fire" — it fully processed issue #7 (all 14 pipeline steps succeeded) and only the final formatting step failed. This is a **cosmetic, non-blocking error** in the Format Final Result code. The issue was properly guarded and will not be re-processed.

### Rationale for GREEN_WITH_NOTES:
- Schedule: ✅ Perfect cadence
- Processing: ✅ Issue #7 fully processed, labels correct
- Error: ⚠️ Execution #61 has `Unexpected token '==='` in Format Final Result (cosmetic, post-processing)
- Protection: ✅ All guardrails worked, issue properly labeled `agent:needs-review` + `evidence:attached`
