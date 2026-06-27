# Preflight -- Guardrails Trigger-Agnostic Fix

**Session:** guardrails-trigger-agnostic-fix-20260627T062657Z
**Date:** 2026-06-27T08:26:57Z
**Agent:** issue-orchestrator

---

## System Information

| Item | Value |
|---|---|
| Hostname | AQCER |
| OS | Microsoft Windows 10 Pro Education |
| Shell | PowerShell 5.1.19041.6456 |
| Date/Time UTC | 2026-06-27T08:26:57Z |
| Working Directory | C:\Spec-kit_n8n |

---

## Git Status

| Item | Value |
|---|---|
| Is Git Repo | ❌ Was broken (.git/HEAD missing) → ✅ Re-initialized (`git init`) |
| Branch | master (new) |
| Last Commit | N/A (fresh init) |
| Untracked | All files staged (evidence, workflows, scripts) |
| Remote | Not configured yet |

---

## n8n Live Instance

| Item | Value |
|---|---|
| Base URL | http://192.168.1.52:5678 |
| Health Check | ✅ Reachable (HTTP 200 OK) |
| CT | 101 |
| Version | 2.26.8 (from prior evidence) |
| REST API (X-N8N-API-KEY) | ❌ 401 Unauthorized |
| Public API v1 | ❌ 401 Unauthorized |
| Auth Method | email (requires UI login) |
| Playwright Access | ⚠️ Not tested in this session yet |

---

## Workflow Status: Sv12QTo56NoPUu2D

| Item | Expected | From Prior Evidence | Status |
|---|---|---|---|
| Workflow Name | GitHub Ready Issue -> Runner Agent Dispatch | ✅ Confirmed via Playwright | ✅ |
| Active | True | ✅ Published, ▶️ icon visible | ✅ |
| Manual Trigger | Present | ✅ Present | ✅ |
| Schedule Trigger | Present (15 min) | ✅ Present, **FIRING** | ✅ |
| Node Count | 19 (18 functional + 1 no-op) | ✅ Confirmed | ✅ |
| Last Executions | #45 (06:00 UTC), #46 (06:15 UTC) | Both Error | 🔴 |
| Execution Failure Rate | 84.6% (11/13) | Guardrails crash | 🔴 |

### Execution #45/#46 Details
| Item | #45 | #46 |
|---|---|---|
| Time | 2026-06-27T06:00:28Z | 2026-06-27T06:15:28Z |
| Duration | 1.052s | 888ms |
| Status | Error | Error |
| Failing Node | Guardrails & Validate | Guardrails & Validate |
| Error | `Cannot assign to read only property 'name' of object 'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'` | Same error |
| Issue Reached | ❌ No | ❌ No |

---

## Workflow Node List (from GitHub Export + Live Evidence)

```
 1. Manual Trigger (Smoke Test)          [manualTrigger]
 2. Fetch Issue from GitHub              [httpRequest]
 3. Guardrails & Validate                [code] ← 🔴 BROKEN (hard Manual Trigger ref)
 4. Remove agent:ready Label             [httpRequest]
 5. Add agent:running Label              [httpRequest]
 6. Prepare RUN_INPUT.json               [code]
 7. SSH Write RUN_INPUT to Runner        [ssh]
 8. SSH Start Runner Script              [ssh]
 9. Wait (5s)                            [wait]
10. SSH Read status.json                 [ssh]
11. Format Evidence Comment              [code]
12. Create GitHub Comment on Issue       [httpRequest]
13. Add Labels (needs-review, evidence)  [httpRequest]
14. Remove agent:running (404-tolerant)  [httpRequest]
15. Format Final Result                  [code] ← FIXED (return [{ json: result }])
16. Schedule Trigger (15 min)            [scheduleTrigger] ← FIRING ✅
17. GitHub Search Issues (agent:ready)   [httpRequest]
18. Pick First Ready Issue               [code]
```

### Data Flow: Manual Trigger Path
```
Manual Trigger (Smoke Test) → Fetch Issue from GitHub → Guardrails & Validate → [dispatch]
```

### Data Flow: Schedule Trigger Path
```
Schedule Trigger → GitHub Search Issues → Pick First Ready Issue → Fetch Issue from GitHub → Guardrails & Validate → [dispatch]
```

**Convergence Point:** Both paths converge at `Fetch Issue from GitHub` (node 2), then flow through `Guardrails & Validate` (node 3).

---

## GitHub Issues

### Issue #4 (Canary Test)
| Item | Value |
|---|---|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4 |
| State | OPEN |
| Labels | `agent:ready`, `mode:manual-terminal`, `risk:low` |
| Last Updated | 2026-06-27T06:03:08Z |
| Comments | 1 (Schedule Test Ready by xxammaxx) |
| `agent:ready` | ✅ Present (should trigger dispatch) |
| Processed | ❌ No — Guardrails crash in both schedule runs |
| Evidence | ❌ None |

### Issue #3 (Smoke Test -- Protected)
| Item | Value |
|---|---|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/3 |
| State | OPEN |
| Labels | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| Last Updated | 2026-06-26T07:56:33Z |
| `agent:ready` | ❌ Not present (correct -- protection active) |
| `agent:running` | ❌ Not present (correct) |
| Reprocessed | ❌ No ✅ (double-run guard intact) |

---

## Proxmox-Host-Zombie

| Item | Status |
|---|---|
| Located | 192.168.1.136 |
| Service | Defective n8n.service (restart loop) |
| Action Taken | **None** ✅ (not touched, not to be touched) |

---

## Quick Assessment

| Check | Status |
|---|---|
| n8n reachable | ✅ |
| Workflow active | ✅ (Published) |
| Schedule Trigger firing | ✅ (verified #45, #46) |
| Manual Trigger present | ✅ |
| Guardrails node bug | 🔴 Hard reference to Manual Trigger |
| Node 15 fix applied | ✅ (GitHub JSON has fix, live unknown via API) |
| Issue #4 ready | ✅ `agent:ready` present |
| Issue #3 protected | ✅ No `agent:ready` |
| n8n API access | ❌ 401 (token expired/revoked) |
| Git repo | ✅ Re-initialized |
| Secrets exposed | ✅ None (line redactions active) |
