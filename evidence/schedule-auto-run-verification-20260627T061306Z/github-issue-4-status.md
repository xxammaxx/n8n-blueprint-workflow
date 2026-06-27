# GitHub Issue #4 Status

**Session:** schedule-auto-run-verification-20260627T061306Z
**Checked:** 2026-06-27T06:13:30Z

---

## Issue #4: [Schedule Test] Dispatcher auto-run canary

| Field | Value |
|---|---|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4 |
| State | **OPEN** |
| Created | 2026-06-27T05:20:35Z |
| Last Updated | 2026-06-27T06:03:08Z |
| Comments | 1 |

---

## Labels

| Label | Present | Expected |
|---|---|---|
| `agent:ready` | ✅ Yes | Should be removed |
| `agent:running` | ❌ No | Should have been set |
| `agent:needs-review` | ❌ No | Should have been set |
| `evidence:attached` | ❌ No | Should have been set |
| `agent:blocked` | ❌ No | Should NOT be set |
| `mode:manual-terminal` | ✅ Yes | Expected |
| `risk:low` | ✅ Yes | Expected |

---

## Comments

### Comment #1 — Schedule Test Ready
- **Author:** xxammaxx
- **Posted:** 2026-06-27T06:03:08Z
- **Content:** Status AWAITING SCHEDULE TRIGGER. Documents live fixes (Node 15, Schedule Trigger, GitHub Search/Pick nodes). Manual fallback noted.
- **Evidence Link:** ❌ None
- **Runner Comment:** ❌ None

### No Additional Comments
- No evidence comment posted
- No runner result comment posted
- No label transition comments

---

## Assessment

| Check | Result |
|---|---|
| `agent:ready` entfernt | ❌ Still present |
| `agent:needs-review` gesetzt | ❌ Not set |
| `evidence:attached` gesetzt | ❌ Not set |
| Runner-Evidence-Pfad referenziert | ❌ None |
| Issue verarbeitet | ❌ **NOT processed** |

---

## Root Cause (from n8n Execution Analysis)

The Schedule Trigger fired twice (#45 at 06:00 UTC, #46 at 06:15 UTC), but both executions failed in the `Guardrails & Validate` node with:

```
Cannot assign to read only property 'name' of object 
'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'
```

The Guardrails node crashes before it can even fetch/validate the issue data. Issue #4 was never reached.

---

## Expected vs Actual

| Expected | Actual |
|---|---|
| Schedule fires → Guardrails validates → Issue processed | Schedule fires → Guardrails crashes → Issue untouched |
| Labels transition: agent:ready → agent:running → agent:needs-review | Labels unchanged: agent:ready still present |
| Evidence posted | No evidence |
| Runner started | Runner never reached |

---

## Next Step

Fix the `Guardrails & Validate` node to handle the Schedule Trigger path where Manual Trigger has no output data. The node should read issue data from the Schedule Trigger path (via GitHub Search → Pick → Fetch) instead of the Manual Trigger node.
