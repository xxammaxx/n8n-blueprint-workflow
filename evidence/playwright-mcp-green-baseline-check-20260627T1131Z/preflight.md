# Preflight — Playwright MCP Green Baseline Check

**Date/Time UTC:** `2026-06-27T11:31Z`
**Session:** `playwright-mcp-green-baseline-check-20260627T1131Z`
**Check Mode:** `READ_ONLY_PLAYWRIGHT_MCP`

---

## 1. Environment

| Field | Value |
|-------|-------|
| Hostname | `AQcer` |
| OS | Windows 10 Pro Education (Build 19045) |
| Shell | PowerShell 5.1 |
| Working Directory | `C:\Spec-kit_n8n` |

---

## 2. Git Status

| Field | Value |
|-------|-------|
| Branch | `master` |
| Remote | `origin/master` (up to date) |
| Current Commit | `020018e39195ebb3f89cab5302a056396254f62e` |
| Commit Message | `docs(n8n): freeze dispatcher green baseline` |
| Green Baseline Commit (from GREEN_BASELINE.md) | `869fa69e8c33562bb58af74c333f67b4c09fc305` |

### Dirty Files
- `n8n-signin-page.png` (modified) — from previous Playwright sessions
- `.playwright-mcp/` (untracked) — console logs from previous sessions
- `n8n-workflow-page.png` (untracked) — from previous sessions

No workflow, code, or operational changes.

---

## 3. Baseline Artifact Inventory

| Artifact | Path | Exists |
|----------|------|--------|
| GREEN_BASELINE.md | `evidence/post-green-stabilization-20260627T131737Z/GREEN_BASELINE.md` | ✅ Yes |
| OPERATIONS_RUNBOOK.md | `evidence/post-green-stabilization-20260627T131737Z/OPERATIONS_RUNBOOK.md` | ✅ Yes |
| dispatcher-health-check.mjs | `scripts/dispatcher-health-check.mjs` | ✅ Yes |
| validate-secret-hygiene.mjs | `scripts/validate-secret-hygiene.mjs` | ✅ Yes |
| Green Workflow Export (snapshot) | `exports/green/dispatcher-green-20260627T131737Z.json` (131KB) | ✅ Yes |
| Green Workflow Export (named) | `exports/green/dispatcher-Sv12QTo56NoPUu2D-green-20260627T131737Z.json` (131KB) | ✅ Yes |

---

## 4. n8n Target

| Field | Value |
|-------|-------|
| URL | `http://192.168.1.52:5678` |
| Reachable | ✅ HTTP 200 |
| Healthz | To be verified |
| Container | CT 101 |
| Instance | CORRECT (not Proxmox zombie) |

---

## 5. Dispatcher Workflow

| Field | Value |
|-------|-------|
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow Name | `GitHub Ready Issue → Runner Agent Dispatch` |
| Expected Node Count | 18 functional |
| Expected State | Active / Published |
| Expected Schedule | 15-minute interval |

---

## 6. Guarded Issues (DO NOT TOUCH)

| Issue | Status |
|-------|--------|
| #3 | 🔒 Hard-blocked, never re-process |
| #4 | 🔒 Processed (canary) |
| #5 | 🔒 Processed (canary) |
| #6 | 🔒 Processed (canary) |
| #7 | 🔒 Processed (canary - last confirmed E2E success) |

---

## 7. Planned Check Sequence

| Phase | Description |
|-------|-------------|
| 1 | REALITY REFRESH — this document |
| 2 | PLAYWRIGHT MCP DISCOVERY — tool/browser availability |
| 3 | N8N UI OPEN — workflow page load |
| 4 | WORKFLOW STRUCTURE — via UI or Network Intercept |
| 5 | EXECUTIONS READ-ONLY — execution history |
| 6 | GITHUB ISSUES READ-ONLY — #3–#7 label check |
| 7 | HEALTH CHECK SCRIPT — dispatcher-health-check.mjs |
| 8 | SECRET HYGIENE CHECK — validate-secret-hygiene.mjs |
| 9 | VALIDATION — cross-reference all findings |
| 10 | DOCUMENTATION — final report |

---

## 8. Hard Constraints (Re-Confirmed)

- ❌ No n8n credential values read or displayed
- ❌ No workflow edits, saves, publishes
- ❌ No manual trigger execution
- ❌ No new GitHub issues
- ❌ No label changes
- ❌ No Proxmox/Docker/Runner modifications
- ❌ No secrets in output
- ❌ No touching Proxmox host zombie n8n
