# Schedule Not Fired — Diagnosis

**Session:** schedule-auto-run-verification-20260627T061306Z
**Status:** **FIRED_BUT_FAILED** — Schedule Trigger works, execution fails in Guardrails node

---

## Correction to Original Hypothesis

| Hypothesis | Verdict |
|---|---|
| "Schedule Trigger did not fire (API-only update issue)" | ❌ **Wrong** — Schedule Trigger DID fire |
| "UI Publish/Active Toggle needed" | ❌ **Not needed** — Workflow is already Published + Active |
| "n8n v2.26.8 API-only registration issue" | ❌ **Not applicable** — Schedule registered and firing |

---

## What Actually Happened

1. **Schedule Trigger fired twice** within the expected windows:
   - Execution #45: 2026-06-27T06:00:28Z (08:00 CEST)
   - Execution #46: 2026-06-27T06:15:28Z (08:15 CEST)

2. **Both executions failed immediately** (< 1 second) in the `Guardrails & Validate` node

3. **Root cause:** The Guardrails node code references `$('Manual Trigger (Smoke Test)').first().json` — this reference fails when the workflow is triggered by the Schedule Trigger because the Manual Trigger node has no output data

4. **Impact:** The workflow never reaches:
   - Fetch Issue
   - Guardrails validation
   - Label updates
   - Runner execution
   - Evidence generation

---

## Workflow Active Check

| Check | Result |
|---|---|
| Workflow Published | ✅ Yes |
| Active Indicator (▶️) | ✅ Present |
| Publish Button | Disabled (already published) |
| Execute Workflow Button | Enabled |
| Schedule Trigger Node | Visible on canvas |
| Schedule Interval | 15 minutes |

**UI Publish/Active Toggle NOT needed.** The workflow is already Published and Active.

---

## Execution Error Detail

```
Error: Cannot assign to read only property 'name' of object 
'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'

Stack: at Object.execute (Guardrails & Validate:line:col)
```

The Guardrails & Validate node's JavaScript attempts to reference data from the Manual Trigger node, which only exists when triggered manually. When Schedule Trigger fires, the data flow is:

```
Schedule Trigger → GitHub Search Issues → Pick First Ready Issue → ??? → Guardrails
```

The Guardrails node should read from the Schedule Trigger path (via `Fetch Issue from GitHub`), not the Manual Trigger node.

---

## Diagnosis Summary

| Item | Status |
|---|---|
| Schedule Trigger fired | ✅ Yes (2 times, 06:00 and 06:15 UTC) |
| Interval correct | ✅ 15 minutes |
| Workflow active | ✅ Published + Active |
| UI Publish needed | ❌ No |
| Code bug in Guardrails | 🔴 Yes — hard dependency on Manual Trigger node |
| Fix needed | Guardrails must work with Schedule Trigger path |

---

## Recommended Fix

Modify the `Guardrails & Validate` node to handle both execution paths:

1. **Manual Trigger path:** Read input from `$('Manual Trigger (Smoke Test)').first().json`
2. **Schedule Trigger path:** Read input from `$('Fetch Issue from GitHub').first().json`

Or, more elegantly: merge both trigger paths into the Fetch Issue node so Guardrails always reads from the same upstream node regardless of trigger source.

---

## What Is NOT Needed

- ❌ UI Publish/Active Toggle
- ❌ Workflow Reactivation
- ❌ n8n Restart
- ❌ Proxmox Changes
- ❌ Credential Updates
