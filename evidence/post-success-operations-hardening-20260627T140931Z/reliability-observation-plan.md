# Reliability Observation Plan

**Timestamp:** 2026-06-27T14:09:31Z
**Session:** post-success-operations-hardening-20260627T140931Z
**Duration:** Multi-day observation (minimum 3 days recommended)

---

## 1. Purpose

Observe the dispatcher system's long-term reliability over multiple days without making any production changes. Collect data to confirm the GREEN_EXECUTION_SUCCESS_CONFIRMED status endures under real schedule conditions.

---

## 2. Observation Rules (HARD)

| Rule | Rationale |
|------|-----------|
| **NO automatic repairs** | If something breaks, document — don't fix |
| **NO new canary issues** | Without explicit user authorization |
| **NO workflow changes** | This is observation, not development |
| **NO schedule interval changes** | Keep 15-min cadence |
| **NO credential changes** | Risk of breaking working system |
| **NO runner restarts** | Unless explicitly authorized |
| **NO issue re-triggering** | Issues #3-#8 remain protected |

---

## 3. Daily Read-Only Health Check

Execute once per day (or more frequently if desired):

```powershell
cd C:\Spec-kit_n8n
node scripts/dispatcher-health-check.mjs
```

### What to Record

| Metric | Source | Expected |
|--------|--------|----------|
| n8n reachable | `/healthz` | HTTP 200 |
| Workflow active | API v1 GET | `active: true` |
| Schedule Trigger present | Local export | 15-min interval |
| Last schedule execution | API v1 executions | Within last 15 min |
| Last execution status | API v1 executions | `success` |
| Errors in last 24h | API v1 executions list | 0 real errors |
| Issues #3-#8 not `agent:ready` | GitHub CLI | All protected |
| No double-run executions | Executions list | 1 execution per fire |
| Runner evidence present* | GitHub comments | When canary runs |
| Secret hygiene | validate script | No new violations |

*Only when a canary issue was intentionally created and processed.

---

## 4. Observation Log Format

Create daily log at: `evidence/reliability-daily/YYYY-MM-DD.md`

### Template

```markdown
# Reliability Daily — YYYY-MM-DD

**Observer:** read-only health check
**Timestamp:** YYYY-MM-DDTHH:MM:SSZ

## Health Check Summary

| Metric | Value | Status |
|--------|-------|--------|
| n8n reachable | HTTP 200 | ✅ |
| Workflow active | true | ✅ |
| Schedule Trigger | Present | ✅ |
| Last execution | #XX (HH:MM) | ✅ |
| Last execution status | success/error | ✅/❌ |
| Errors in 24h | N | - |
| Protected issues safe | Yes/No | ✅/❌ |
| Double-runs detected | 0/N | ✅/❌ |
| Runner evidence (if canary) | Present/Absent | ✅/❌ |
| Secret hygiene | Clean/Violations | ✅/❌ |

## Execution History (Last 24h)

| Exec # | Time UTC | Status | Duration | Notes |
|--------|----------|--------|----------|-------|
| ... | ... | ... | ... | ... |

## Issues Status

| Issue | Labels unchanged? | Re-processed? |
|-------|------------------|---------------|
| #3 | ✅/❌ | ❌ |
| #4 | ✅/❌ | ❌ |
| #5 | ✅/❌ | ❌ |
| #6 | ✅/❌ | ❌ |
| #7 | ✅/❌ | ❌ |
| #8 | ✅/❌ | ❌ |

## Notes

- Any anomalies observed
- Any false positives in health check
- Any operational concerns

## Status: OBSERVATION_GREEN / OBSERVATION_YELLOW / OBSERVATION_RED
```

---

## 5. Abort Criteria (Stop Observation, Escalate)

| Trigger | Action |
|---------|--------|
| **Double-run detected** | Two executions process same issue → STOP, escalate YELLOW |
| **Secret leak** | Any real secret found → STOP, escalate RED |
| **Workflow inactive** | `active: false` → STOP, escalate YELLOW |
| **n8n unreachable** | `/healthz` fails → STOP, escalate RED |
| **Schedule missing** | Schedule Trigger not in workflow → STOP, escalate RED |
| **Runner starts multiple times** | Multiple runner processes → STOP, escalate YELLOW |
| **Issue #3-#8 re-processed** | Labels change on protected issues → STOP, escalate RED |
| **Consecutive execution errors** | 3+ errors in a row → STOP, escalate YELLOW |

---

## 6. Escalation Protocol

### YELLOW Escalation
- Document exact trigger and evidence
- Post to issue thread if related
- Do NOT auto-repair
- Await user decision

### RED Escalation
- Document exact trigger and evidence
- Consider deactivating workflow (only if user-authorized)
- Do NOT auto-repair
- Immediate user notification

---

## 7. Metrics to Track

### Schedule Cadence
```
Expected: Every 15 minutes (XX:XX:28)
Track: Actual fire times vs expected
Deviation tolerance: ± 30 seconds
```

### Execution Duration Patterns
```
Idle (no issues):    0.3 - 0.5s
Processing issue:   80 - 90s
Error (early exit):  0.5 - 5s
```

### Success Rate
```
success executions / total executions × 100
Target: > 95% (idle fires count as success)
```

---

## 8. Observation Timeline

| Day | Date | Focus |
|-----|------|-------|
| Day 1 | 2026-06-28 | First 24h — verify schedule fires reliably overnight |
| Day 2 | 2026-06-29 | Verify no degradation, check secret hygiene |
| Day 3 | 2026-06-30 | Extended observation, check for drifting issues |
| Day 4+ | (optional) | Continue if no issues found |

---

## 9. Post-Observation Decision Tree

After the observation period:

```
Observation Complete
    │
    ├── All GREEN for 3+ days
    │   └── Status: GREEN_EXECUTION_STABLE
    │       → Consider enabling provider for runner
    │       → Consider operational canary (user-authorized)
    │
    ├── Mostly GREEN, minor YELLOW notes
    │   └── Status: GREEN_EXECUTION_CONFIRMED with notes
    │       → Address notes before proceeding
    │
    └── RED trigger fired
        └── Status: DEGRADED
            → Full investigation required
            → Do NOT proceed with any changes
```

---

## 10. Summary

| Question | Answer |
|----------|--------|
| How long to observe? | Minimum 3 days recommended |
| What changes during observation? | NOTHING — pure read-only |
| What if something breaks? | Document, escalate, do NOT fix |
| Can I create new canaries? | Only with explicit user authorization |
| What's the end goal? | Confirm stability → elevate to GREEN_EXECUTION_STABLE |
