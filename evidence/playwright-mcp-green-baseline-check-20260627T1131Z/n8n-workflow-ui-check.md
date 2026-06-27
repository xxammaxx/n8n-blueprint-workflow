# n8n Workflow UI Check — Green Baseline

**Date/Time UTC:** `2026-06-27T11:31Z`
**Tool:** Playwright MCP (via `playwright-agent` subagent)

---

## 1. Page Load

| Field | Value |
|-------|-------|
| URL navigated | `http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D` |
| Final URL | `http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D` |
| Redirect occurred | ❌ No (already authenticated) |
| Page title | `▶️ GitHub Ready Issue -> Runner Agent Dispatch - n8n[DEV]` |
| Load status | ✅ Success |

---

## 2. Login Status

| Field | Value |
|-------|-------|
| Login required | ❌ No |
| Already authenticated | ✅ Yes |
| Signin page detected | ❌ No |

---

## 3. Workflow Identity

| Field | Value |
|-------|-------|
| Workflow name visible | ✅ Yes |
| Displayed name | `GitHub Ready Issue -> Runner Agent Dispatch` |
| Name matches expected | ✅ Yes |
| Workflow ID in URL | ✅ `Sv12QTo56NoPUu2D` |
| Tags visible | `source-of-truth`, `dispatcher`, `github` (+3 more) |

---

## 4. Workflow State

| Field | Value |
|-------|-------|
| Active indicator | ✅ Yes (▶️ in page title) |
| Published indicator | ✅ Yes |
| Deactivate button present | ✅ Yes |
| Publish button present | ⚠️ Yes (suggests unpublished draft changes exist) |
| Last updated | `2026-06-27T09:28:11.391Z` |
| activeVersionId ≠ versionId | ⚠️ Yes (draft vs. active versions differ) |

---

## 5. Node Canvas

| Field | Value |
|-------|-------|
| Nodes visible | ✅ Yes |
| Node count (visual) | 18 |
| All nodes collapsed | ✅ Yes (safe — no code/credentials exposed) |
| Edges/Connections visible | ✅ Yes |

### Node List (visible in canvas)
1. Manual Trigger (Smoke Test)
2. Fetch Issue from GitHub
3. Guardrails & Validate
4. Remove agent:ready Label
5. Add agent:running Label
6. Prepare RUN_INPUT.json
7. SSH Write RUN_INPUT to Runner
8. SSH Start Runner Script
9. Wait (5s)
10. SSH Read status.json
11. Format Evidence Comment
12. Create GitHub Comment on Issue
13. Add Labels (agent:needs-review, evidence:attached)
14. Remove agent:running Label (404-tolerant)
15. Format Final Result
16. Schedule Trigger (15 min)
17. GitHub Search Issues (agent:ready)
18. Pick First Ready Issue

---

## 6. Errors / Warnings

| Type | Message | Severity |
|------|---------|----------|
| Console | COOP policy header warning (HTTP vs HTTPS) | ℹ️ Cosmetic |
| UI | No visible error messages | ✅ None |
| Blocking | No blocking errors | ✅ None |

---

## 7. Screenshot

| Field | Value |
|-------|-------|
| Taken | ✅ Yes |
| File | `C:\Spec-kit_n8n\n8n-workflow-healthcheck.png` |
| Secrets visible | ❌ No (all nodes collapsed) |

---

## 8. Assessment

**Status:** `AUTHENTICATED_WORKFLOW_VISIBLE` ✅

The workflow page loaded successfully in an authenticated Playwright session. All 18 nodes are visible, the workflow is active/published, and no blocking errors or secrets are visible.
