# Preflight — Schedule Auto-Run Verification

**Session:** schedule-auto-run-verification-20260627T061306Z
**Date:** 2026-06-27T06:13:06Z
**Agent:** issue-orchestrator

---

## System Information

| Item | Value |
|---|---|
| Hostname | AQCER |
| OS | Microsoft Windows 10 Pro Education |
| Shell | PowerShell 5.1.19041.6456 |
| Date/Time UTC | 2026-06-27T06:13:06Z |
| Working Directory | C:\Spec-kit_n8n |

---

## Git Status

| Item | Value |
|---|---|
| Is Git Repo | ❌ No — `.git` directory missing |
| Branch | N/A |
| Last Commit | N/A |
| Action Needed | `git init` or `git clone` required |

---

## n8n Live Instance

| Item | Value |
|---|---|
| Base URL | http://192.168.1.52:5678 |
| Health Check | ✅ Reachable (HTTP 200) |
| API Access | ❌ REST API: 401 Unauthorized (requires email auth) |
| Public Settings | ✅ Reachable |
| Auth Method | email |
| Preview Mode | false |
| CT | 101 |
| Version | 2.26.8 (from previous evidence) |

---

## Workflow Status: Sv12QTo56NoPUu2D

| Item | Expected | Actual | Status |
|---|---|---|---|
| Workflow Name | GitHub Ready Issue -> Runner Agent Dispatch | ✅ Confirmed (Playwright) | ✅ |
| Active | True | ✅ Published, ▶️ icon visible | ✅ |
| Manual Trigger | Present | ✅ Present | ✅ |
| Schedule Trigger | Present (15 min) | ✅ Present, visible on canvas | ✅ |
| Node Count | 18 (+ no-op) | 19 total (18 functional + 1 connector) | ✅ |
| UI Publish Needed | No | Published button disabled | ✅ |
| Node 15 Fix | `return [{ json: result }];` | ⚠️ Cannot verify via API | ⚠️ |

---

## Execution Summary (from n8n UI)

| Metric | Value |
|---|---|
| Prod. Executions | 13 |
| Failed Executions | 11 |
| Failure Rate | 84.6% |
| Avg. Runtime | 13.27 s |

⚠️ **CRITICAL:** High failure rate — executions are failing, likely preventing Issue #4 processing.

---

## GitHub Issues

### Issue #4 (Canary Test)
| Item | Value |
|---|---|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4 |
| State | OPEN |
| Labels | `agent:ready`, `mode:manual-terminal`, `risk:low` |
| Last Updated | 2026-06-27T06:03:08Z |
| Comments | 1 (Schedule Test Ready) |
| Processed | ❌ No — `agent:ready` still present |
| Expected Processing | By ~06:12 UTC |
| Actual Status | NOT processed |

### Issue #3 (Smoke Test — Protected)
| Item | Value |
|---|---|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/3 |
| State | OPEN |
| Labels | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| `agent:ready` | ❌ Not present (correct) |
| `agent:running` | ❌ Not present (correct) |
| Last Updated | 2026-06-26T07:56:33Z |
| Reprocessed | ❌ No ✅ |

---

## Proxmox-Host-Zombie

| Item | Status |
|---|---|
| Located | 192.168.1.136 |
| Service | Defective n8n.service (restart loop) |
| Action Taken | **None** ✅ (not touched) |

---

## Quick Assessment

| Check | Status |
|---|---|
| n8n reachable | ✅ |
| Workflow active | ✅ (Published) |
| Schedule Trigger visible | ✅ |
| Issue #4 processed | ❌ NOT processed |
| Issue #3 protected | ✅ Not reprocessed |
| Executions failing | ⚠️ 84.6% failure rate |
| API access | ❌ 401 — no API key |
| Git repo | ❌ .git missing |

**Preliminary Status:** YELLOW — Schedule Trigger exists and workflow is active, but executions are failing. Root cause analysis needed.
