# Guardrails Fix Summary

**Session:** guardrails-trigger-agnostic-fix-20260627T062657Z
**Date:** 2026-06-27T08:32:00Z

---

## Problem

The `Guardrails & Validate` node in workflow `Sv12QTo56NoPUu2D` had a hard dependency on the Manual Trigger node:

```javascript
const prepRef = $('Manual Trigger (Smoke Test)').first().json;
```

When the Schedule Trigger fired, the Manual Trigger had not been executed, causing:
```
Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed
```
which cascaded into:
```
Cannot assign to read only property 'name' of object 'Error: ...'
```

**Impact:** All schedule-triggered executions (#45, #46) failed in < 1 second. Issue #4 with `agent:ready` was never reached.

---

## Fix

1. **Removed** `const prepRef = $('Manual Trigger (Smoke Test)').first().json;`
2. **Replaced** with static values for owner/repo and `issueData.number` for issue_number
3. **Added** Issue #3 hard block (`isIssue3`)
4. **Added** already-processed detection (`isAlreadyProcessed = needsReview && evidenceAttached`)
5. **Ensured** no Error object mutation (new Error() constructor)

---

## Before → After Comparison

| Line | Before | After |
|---|---|---|
| Data source | `prepRef = $('Manual Trigger...')` + `issueData = $input.first().json` | `issueData = $input.first().json` only |
| owner | `prepRef.owner \|\| 'xxammaxx'` | `'xxammaxx'` (static) |
| repo | `prepRef.repo \|\| 'n8n-blueprint-workflow'` | `'n8n-blueprint-workflow'` (static) |
| issue_number | `prepRef.issue_number \|\| issueData.number \|\| 0` | `issueData.number \|\| 0` |
| Issue #3 block | Missing | ✅ `isIssue3` hard block |
| Already-processed | Missing | ✅ `isAlreadyProcessed` guard |
| Error creation | `throw new Error(...)` | `const blockError = new Error(...); throw blockError;` |
| guardrail_reason cases | 5 | 7 (added issue3 + already-processed) |

---

## Trigger Compatibility

| Trigger Path | Before | After |
|---|---|---|
| Manual Trigger (Smoke Test) | ✅ Works (Manual Trigger has pinData) | ✅ Works (uses $input, no Manual Trigger needed) |
| Schedule Trigger | 🔴 CRASHES (Manual Trigger not executed) | ✅ Works (uses $input only) |
| Any future trigger | 🔴 Would crash | ✅ Works (fully trigger-agnostic) |

---

## Protections Maintained

- ✅ `agent:ready` required (hasReady check)
- ✅ `agent:running` blocks duplicate (hasRunning check)
- ✅ `agent:blocked` blocks (hasBlocked check)
- ✅ `agent:done` blocks (hasDone check)
- ✅ Issue #3 hard block (isIssue3 check)
- ✅ Already-processed blocks (isAlreadyProcessed check)
- ✅ Mode detection (manual-terminal/opencode-run/hermes-review)
- ✅ Risk detection (low/medium/high)
- ✅ Output format: `return [{ json: result }];`
