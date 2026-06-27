# Project Status

**Last Updated:** 2026-06-27T06:20:00Z
**Current Status:** **YELLOW** (Schedule fires, Guardrails node crashes before issue processing)

---

## Dispatcher Workflow (Sv12QTo56NoPUu2D)

| Item | Status | Detail |
|---|---|---|
| Manual Trigger | ✅ Present | Confirmed |
| Schedule Trigger (15 min) | ✅ Present + Firing | Exec #45 (06:00 UTC), #46 (06:15 UTC) |
| Node 15 (Format Final Result) | ✅ Fix applied | `return [{ json: result }];` — API-updated |
| Guardrails (Double-Start) | 🔴 **BUG** | Crashes on Schedule path (Manual Trigger ref) |
| Workflow Active | ✅ Published | ▶️ icon, Publish button disabled |
| Node Count | ✅ 19 (18 functional + 1 no-op) | GitHub Search + Pick First Ready Issue added |

### 🔴 Active Bug: Guardrails & Validate Node
- **Symptom:** `Cannot assign to read only property 'name' of object 'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'`
- **Root Cause:** Hardcoded reference to Manual Trigger node output. When Schedule Trigger fires, Manual Trigger has no data.
- **Impact:** ALL schedule-triggered executions fail (2/2 so far). Issue #4 never reached.
- **Fix:** Guardrails must read from Schedule Trigger path (`Fetch Issue from GitHub`), not Manual Trigger.

### Test Issue #4
- **Status:** NOT processed (Schedule fired but Guardrails crashed)
- **Labels:** `agent:ready`, `mode:manual-terminal`, `risk:low` — unchanged
- **Next:** Fix Guardrails node, then re-test

### Issue #3
- **Status:** Protected ✅ — No double-run, labels unchanged (`agent:needs-review`, `evidence:attached`)

---

## n8n Live Instance

| Item | Value |
|---|---|
| CT | 101 |
| IP | 192.168.1.52:5678 |
| Healthz | 200 OK |
| Playwright Access | ✅ Working (UI verified) |
| API Access | ❌ 401 (email auth required) |
| Execution Failure Rate | ⚠️ 84.6% (11/13) — Guardrails bug |

---

## Key Discovery

**Schedule Trigger works in n8n v2.26.8!** Previous concern about "API-only updates not registering" was incorrect for this instance. The trigger registered and fires at correct 15-minute intervals. The blocker is a code bug in the Guardrails node, not an n8n platform issue.

---

## Known Issues

1. 🔴 **Guardrails node bug** — Hard dependency on Manual Trigger node prevents Schedule-Triggered runs
2. ⚠️ **n8n API 401** — REST API requires email auth, no API key configured
3. ⚠️ **Git repo broken** — `.git` missing, cannot commit/push
4. ℹ️ **Proxmox Host Zombie n8n** — Restart-loop, DO NOT TOUCH

---

## Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| Guardrails node bug | Schedule Trigger fires but crashes | Fix Guardrails JS: read from `Fetch Issue` node, not Manual Trigger |
| n8n API 401 | Cannot query executions programmatically | Configure API key or use Playwright |
| Git repo defekt | Cannot commit/push changes | Run `git init` or restore `.git` |

---

## Next Action

**Priority 1:** Fix Guardrails & Validate node code to support Schedule Trigger path
**Priority 2:** Re-test with Issue #4 (or create new canary issue)
**Priority 3:** Verify end-to-end: Schedule → Guardrails → Runner → Evidence
**Priority 4:** Commit evidence, update status to GREEN
