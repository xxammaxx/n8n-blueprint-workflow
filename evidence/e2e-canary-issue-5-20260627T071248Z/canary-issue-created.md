# Canary Issue #5 — Created

**Timestamp:** 2026-06-27T07:25:47Z
**Created by:** issue-orchestrator

---

## Issue Details

| Field | Value |
|---|---|
| Issue Number | #5 |
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/5 |
| Title | [Canary] Dispatcher E2E schedule test after guardrails fix |
| State | OPEN |
| Repository | xxammaxx/n8n-blueprint-workflow |

## Initial Labels

| Label | Color | Description |
|---|---|---|
| `agent:ready` | #FEF2C0 | — |
| `test:canary` | #C5DEF5 | Canary test issue |
| `dispatcher:e2e` | #D4C5F9 | End-to-end dispatcher test |

## Expected Next Schedule Window

| Item | Value |
|---|---|
| Last execution | #50 at 07:15:28 UTC (success, no issue to process) |
| Next expected | ~07:30 UTC |
| Expected trigger | Schedule Trigger (15 min interval) |

## Pre-conditions (verified)

- ✅ `agent:ready` label present — dispatcher should detect this issue
- ✅ Issue #3 has NO `agent:ready` — should NOT be picked up
- ✅ Issue #4 has NO `agent:ready` — should NOT be picked up
- ✅ Guardrails trigger-agnostic fix is live
- ✅ Schedule Trigger is active and firing
- ✅ Workflow is published and active
