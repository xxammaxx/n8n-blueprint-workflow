# Test Issue Created — Schedule Auto-Run Canary

**Created:** 2026-06-27T05:02:00Z
**Issue:** [#4](https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4)

## Issue Details

| Property | Value |
|---|---|
| Number | 4 |
| Title | `[Schedule Test] Dispatcher auto-run canary` |
| State | OPEN |
| Labels | `agent:ready`, `mode:manual-terminal`, `risk:low` |
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4 |

## Initial State

| Requirement | Status |
|---|---|
| `agent:ready` present | ✅ Set |
| `agent:running` absent | ✅ |
| `agent:needs-review` absent | ✅ (will be set after processing) |
| `evidence:attached` absent | ✅ (will be set after processing) |
| Issue is OPEN | ✅ |
| Not Issue #3 | ✅ (Issue #3 untouched) |

## Expected Processing

1. Schedule Trigger fires → GitHub Search finds this issue
2. Guardrails validate → PASS (open + agent:ready + no running/blocked/done)
3. `agent:ready` removed → `agent:running` set
4. Runner executes → evidence produced
5. GitHub comment posted
6. Labels updated: `agent:running` removed, `agent:needs-review` + `evidence:attached` set

## Constraints Verified

| Constraint | Status |
|---|---|
| Issue #3 not reused | ✅ Confirmed — #3 labels unchanged |
| `agent:ready` only on new issue | ✅ Only on #4 |
| No duplicate starts possible | ✅ Guardrails block if `agent:running` present |
| No production data | ✅ Canary/test only |
| No secrets in body | ✅ Verified |

## Monitoring Instructions

To verify the Schedule Auto-Run, monitor this issue:
1. Watch for label changes (agent:ready → agent:running → agent:needs-review + evidence:attached)
2. Check for automated GitHub comment with evidence path
3. Verify only one execution (no duplicate runs)
4. Check Issue #3 remains untouched
