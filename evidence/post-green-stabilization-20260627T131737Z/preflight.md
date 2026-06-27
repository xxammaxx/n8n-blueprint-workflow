# Preflight Check — Post-Green Stabilization

**Date/Time UTC:** `2026-06-27T13:17:37Z`
**Evidence Dir:** `evidence/post-green-stabilization-20260627T131737Z/`

---

## System

| Item | Value |
|------|-------|
| Hostname | `AQcer` |
| OS | Microsoft Windows 10 Pro Education |
| CPU | 11th Gen Intel(R) Core(TM) i3-1115G4 @ 3.00GHz |
| Shell | PowerShell 5.1 |
| Platform | win32 |
| Git repo | `C:\Spec-kit_n8n` |
| Is git repo | Yes |

---

## Git Status

| Item | Value |
|------|-------|
| Branch | `master` |
| Remote status | Up to date with `origin/master` |
| Last commit | `869fa69e8c33562bb58af74c333f67b4c09fc305` |
| Commit message | `test(n8n): confirm dispatcher execution success canary` |
| Commit author | xxammaxx <0xxammaxx0@gmail.com> |
| Commit date | Sat Jun 27 12:37:42 2026 +0200 |
| Modified files | `n8n-signin-page.png` (binary change, 27493 -> 18361 bytes) |
| Untracked files | `.playwright-mcp/` logs + pages, `n8n-workflow-page.png`, evidence dirs |

---

## n8n Live Instance

| Item | Value |
|------|-------|
| URL | `http://192.168.1.52:5678` |
| CT | 101 |
| Reachable | ✅ **YES** — HTTP 200, 18893 bytes |
| n8n signature in HTML | ✅ **found** |
| Public API v1 | ✅ Working (JWT Bearer token) |
| REST API | ❌ 401 (email auth required) |

---

## Dispatcher Workflow

| Item | Value |
|------|-------|
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow Name | `GitHub Ready Issue → Runner Agent Dispatch` |
| Active / Published | ✅ Yes (▶️ icon, Publish button disabled) |
| Node Count | 18 functional |
| Schedule Trigger | ✅ Present (15-minute interval) |
| Schedule Interval | 15 minutes |
| Manual Trigger | ✅ Present (Manual Trigger (Smoke Test)) |
| Guardrails Fix | ✅ Active (trigger-agnostic) |
| Format Final Result Fix | ✅ Active (comment already correct) |

---

## Issue Status (via GitHub API)

| Issue | Title | Labels | State |
|-------|-------|--------|-------|
| #3 | [smoke] Scheduler-Dispatcher Dauerbetrieb | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` | OPEN |
| #4 | [Schedule Test] Dispatcher auto-run canary | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` | OPEN |
| #5 | [Canary] Dispatcher E2E schedule test after guardrails fix | `agent:needs-review`, `evidence:attached`, `test:canary`, `dispatcher:e2e` | OPEN |
| #6 | [Canary] Final GREEN dispatcher schedule E2E test | `agent:needs-review`, `evidence:attached`, `test:canary`, `dispatcher:e2e` | OPEN |
| #7 | [Canary] Final execution-success dispatcher schedule test | `agent:needs-review`, `evidence:attached`, `test:canary` | OPEN |

### Key Observations
- **None** of Issues #3-#7 have `agent:ready` — all are in `agent:needs-review` + `evidence:attached`
- **No** re-processing of Issues #3-#6 — guardrails confirmed active
- **Issue #7** was last updated at `2026-06-27T10:01:54Z` — Runner comment posted

---

## Last Successful Canary

| Field | Value |
|-------|-------|
| Issue | #7 |
| Run ID | `gh-issue-7-20260627T100030Z` |
| Trigger | Schedule Trigger (15-min) |
| Window | :00 minutes |
| Status | ✅ SUCCESS |
| Timestamp | ~2026-06-27T10:00:30Z |
| Runner comment posted | 2026-06-27T10:01:52Z |

---

## Runner

| Field | Value |
|-------|-------|
| Host | lxc-dev-runner |
| IP | 192.168.1.53 |
| Evidence path | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-7/gh-issue-7-20260627T100030Z` |
| OpenCode version | v1.17.9 |
| Provider configured | ❌ (expected in canary mode) |
| Evidence files | 49 in final evidence dir |

---

## Proxmox Host Zombie n8n

| Item | Value |
|------|-------|
| Status | ⚠️ **DOCUMENTED — NOT MODIFIED** |
| Symptom | systemd restart-loop on Proxmox host |
| Action taken | None — explicitly NOT touched per constraints |
| Note | CT 101 (192.168.1.52) is the correct working instance — this zombie is the wrong one |

---

## Known Tooling Insights

1. **Playwright Canvas Interaction** — Fragile due to Vue-Flow CSS transforms in n8n UI
2. **Network Response Intercept** — Robust workaround: intercept SPA-XHR → extract workflow JSON → parse code
3. **n8n API v1** — Read-only for workflows (no node editing)
4. **n8n REST API** — Requires email auth (not configured), separate from Public API v1

---

## Safety Status

| Check | Status |
|-------|--------|
| No secrets exposed | ✅ |
| No credential values read | ✅ |
| No Proxmox modified | ✅ |
| No containers/volumes deleted | ✅ |
| No GitHub Actions started | ✅ |
| No auto-merge | ✅ |
| No production issues touched | ✅ |
| No existing canaries re-triggered | ✅ |
