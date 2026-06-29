# Preflight — Dispatcher Comment Sync Deployment (Run 2)

**Timestamp (UTC):** 2026-06-29T05:57:49Z
**Evidence Directory:** `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/`
**Hostname:** AQcer
**OS:** Microsoft Windows 10 Pro Education (NT 10.0.19045.0)
**Shell:** Windows PowerShell 5.1
**Working Directory:** `C:\Spec-kit_n8n`

## Git Status

| Item | Value |
|------|-------|
| Current branch | `master` |
| Last commit (local) | `88b1e81` — `fix(n8n): prepare status.json based github comment sync` |
| origin/master HEAD | `8b10fbd` — `fix(runner): integrate opencode provider env loading into issue dispatch script` |
| origin/main HEAD | `3687959` — `docs: add verification session results` |
| GitHub default branch | `main` |
| Branch drift | ✅ **BRANCH_DRIFT_NOTE:** `main` is GitHub default, `master` contains current DeepSeek dispatch state |
| Unpushed commits | 1 (`88b1e81` — evidence + exports from previous comment sync run) |
| Working tree | Modified: `n8n-signin-page.png` (pre-existing). Untracked: `evidence/*`, `.playwright-mcp/*` |

### Branch Divergence Confirmed
- `origin/master` and `origin/main` have diverged (neither is ancestor of the other)
- Current DeepSeek dispatch state lives on `master` (commit `8b10fbd` on origin/master)
- **NO branch change performed** — documented as `BRANCH_DRIFT_NOTE`

## n8n Status

| Item | Value |
|------|-------|
| n8n reachable | ✅ YES — HTTP 200 (`http://192.168.1.52:5678`) |
| Healthz | ✅ `{"status":"ok"}` |
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow name | "GitHub Ready Issue → Runner Agent Dispatch" |
| Workflow active | ✅ Published (confirmed via STATUS.md baseline) |
| Schedule Trigger | ✅ Present (15 min interval) |
| Manual Trigger | ✅ Present (`Manual Trigger (Smoke Test)`) |
| Node Count | 18 nodes |
| Public API v1 | ❌ 401 (JWT auth required) |
| REST API | ❌ 401 (email auth required) |
| Playwright MCP logs | ✅ Present (most recent: 2026-06-29T05:35) |

## Previous Run Summary

| Item | Value |
|------|-------|
| Previous evidence dir | `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/` |
| Root cause identified | ✅ SSH output wrapper `{stdout, success, exitCode}` not parsed correctly |
| Fix designed | ✅ Node 11 + Node 15 patched |
| Patch JSON validated | ✅ Static validation 17/17 PASS |
| Patch deployed to live n8n | ❌ BLOCKED — no API/UI auth |
| Issue #13 created | ✅ Processed by Schedule Trigger |
| Issue #13 comment | 🟡 Stale (expected — patch not deployed) |
| Issues #3-#12 protected | ✅ YES |

## This Run's Objective

Deploy the already-prepared patch to the live n8n workflow and verify with a new dummy issue.

## Secret Hygiene

| Check | Value |
|------|-------|
| API-Key ausgegeben | ❌ NO |
| Secrets sichtbar | ❌ NO |
| Status | ✅ GREEN |

## Constraints

| Constraint | Status |
|------------|--------|
| No trigger changes | ✅ |
| No schedule changes | ✅ |
| No credential changes | ✅ |
| No guardrail changes | ✅ |
| No runner start logic changes | ✅ |
| No issue selection changes | ✅ |
| No secrets emitted | ✅ |
| Issues #3-#13 not re-started | ✅ |
