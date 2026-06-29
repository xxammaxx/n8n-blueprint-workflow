# GREEN EXECUTION SUCCESS — Baseline Manifest

**Date/Time UTC:** `2026-06-27T13:17:37Z`
**Baseline Status:** `GREEN_BASELINE_FROZEN`
**Session:** post-green-stabilization

---

## 1. Status

**`GREEN_EXECUTION_SUCCESS`** — Der Schedule Dispatcher läuft zuverlässig, alle Schutzmechanismen sind aktiv, Issues #3-#7 sind geschützt.

---

## 2. Date/Time

| Field | Value |
|-------|-------|
| Baseline erstellt | `2026-06-27T13:17:37Z` |
| Lokale Zeit | `2026-06-27T15:17:37 CEST` |
| Session ID | post-green-stabilization-20260627T131737Z |

---

## 3. Commit

| Field | Value |
|-------|-------|
| Commit Hash | `869fa69e8c33562bb58af74c333f67b4c09fc305` |
| Commit Message | `test(n8n): confirm dispatcher execution success canary` |
| Author | xxammaxx <0xxammaxx0@gmail.com> |
| Date | Sat Jun 27 12:37:42 2026 +0200 |
| Branch | `master` |
| Remote | `origin/master` (up to date) |

---

## 4. n8n Live Instance

| Field | Value |
|-------|-------|
| Container | CT 101 |
| IP:Port | `192.168.1.52:5678` |
| Reachable | ✅ HTTP 200 |
| n8n Version | v2.26.8 (estimated, not re-verified this session) |
| Public API v1 | ✅ Working (JWT Bearer token) |
| REST API | ❌ 401 (email auth required) |

---

## 5. Dispatcher Workflow

| Field | Value |
|-------|-------|
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow Name | `GitHub Ready Issue → Runner Agent Dispatch` |
| Active / Published | ✅ Yes |
| Node Count | 18 functional |
| Green Snapshot | `exports/green/dispatcher-green-20260627T131737Z.json` |
| Snapshot SHA256 | `E002E97F1C24F3BC679DB0993194E254FFBF0895FFDEB188843663AC91949E9A` |

---

## 6. Schedule

| Field | Value |
|-------|-------|
| Trigger Type | Schedule Trigger (Cron) |
| Interval | 15 minutes |
| First confirmed fire | Execution #45 (06:00 UTC, 2026-06-27) |
| Trigger-agnostic | ✅ Yes (works with Manual + Schedule) |
| Last confirmed fire | Execution with Issue #7 (10:00 UTC, 2026-06-27) |

---

## 7. Runner

| Field | Value |
|-------|-------|
| Hostname | `lxc-dev-runner` |
| IP | `192.168.1.53` |
| Container | n8n-runners |
| OpenCode Version | v1.17.9 |
| Evidence Path (latest) | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-7/gh-issue-7-20260627T100030Z` |
| Provider configured | ❌ (expected in canary mode) |

---

## 8. Successful Canary History

| Issue | Title | Label After | Status |
|-------|-------|------------|--------|
| #4 | [Schedule Test] Dispatcher auto-run canary | `agent:needs-review`, `evidence:attached` | ✅ PROCESSED |
| #5 | [Canary] Dispatcher E2E schedule test after guardrails fix | `agent:needs-review`, `evidence:attached` | ✅ PROCESSED |
| #6 | [Canary] Final GREEN dispatcher schedule E2E test | `agent:needs-review`, `evidence:attached` | ✅ PROCESSED |
| #7 | [Canary] Final execution-success dispatcher schedule test | `agent:needs-review`, `evidence:attached` | ✅ PROCESSED |

---

## 9. Double-Run Protection — Quadruple Confirmed

| Issue | `agent:ready` | Re-processed | Status |
|-------|-------------|--------------|--------|
| #3 | ❌ | ❌ | ✅ GUARDED |
| #4 | ❌ | ❌ | ✅ GUARDED |
| #5 | ❌ | ❌ | ✅ GUARDED |
| #6 | ❌ | ❌ | ✅ GUARDED |
| #7 | ❌ | ❌ | ✅ GUARDED |

**Protection layers:**
1. `isIssue3` hard block (Issue #3)
2. `isAlreadyProcessed` check (any issue with `agent:needs-review` or `evidence:attached`)
3. `agent:ready` requirement (only processes issues with this label)
4. State check (only processes open issues)
5. Guardrails Validate node (trigger-agnostic)

---

## 10. Known Tooling Insights

### 10.1 Playwright Canvas Interaction
- **Problem:** n8n UI uses Vue-Flow with CSS `transform` properties on canvas elements
- **Impact:** Direct Playwright `click()`, `fill()`, and `drag()` operations on canvas nodes are unreliable
- **Workaround:** Network Response Intercept — intercept SPA-XHR calls → extract workflow JSON → parse code
- **Status:** Documented. Robust workaround available.

### 10.2 Network Response Intercept
- **Method:** `page.route()` or `page.waitForResponse()` to capture `/rest/workflows/` API responses
- **Result:** Full workflow JSON including node parameters and code
- **Reliability:** High — bypasses UI rendering entirely
- **Limitation:** Requires authenticated n8n session for the REST API endpoint

### 10.3 n8n API v1 Limitations
- **Public API v1:** Read-only for workflows — no node editing
- **REST API:** Requires email-based authentication (not configured)
- **Impact:** Programmatic workflow node edits not possible via current APIs
- **Workaround:** Manual n8n UI edits or email-auth REST API configuration

---

## 11. DO NOT TOUCH — Prohibited Actions

### 11.1 Proxmox Host Zombie n8n
- **Symptom:** systemd `n8n.service` restart-loop on Proxmox host
- **Location:** Proxmox host (not CT 101)
- **Status:** ⚠️ KNOWN BUG — DO NOT TOUCH
- **Why:** Unrelated to working n8n instance. Any modification risks destabilizing Proxmox.
- **Note:** CT 101 (192.168.1.52) is the correct working instance. Do not confuse them.

### 11.2 systemd n8n.service Restart-Loop
- **Status:** Known issue on Proxmox host
- **Action:** Explicitly NO action — documented only

### 11.3 CT-101-n8n-Instance
- **Status:** Working correctly — DO NOT modify
- **Why:** This is the production dispatcher

---

## 12. Safe Operations (Read-Only)

| Operation | Allowed | Notes |
|-----------|---------|-------|
| Readiness Scan | ✅ | `node scripts/run-trusted-readiness-scan.mjs` |
| Workflow Export | ✅ | Via API or Network Intercept |
| Evidence Scan | ✅ | Read existing evidence files |
| Label Read | ✅ | `gh issue view` |
| Issue Read | ✅ | `gh issue view` (no write) |
| Health Check | ✅ | Read-only health script |
| Secret Hygiene | ✅ | `node scripts/validate-secret-hygiene.mjs` |

---

## 13. Risk Operations (Require Human Approval)

| Operation | Risk | Constraint |
|-----------|------|------------|
| Workflow Logic Change | 🔴 HIGH | Requires new Speckit spec + canary |
| Trigger Frequency Change | 🟡 MEDIUM | May disrupt processing windows |
| Credential Re-assignment | 🔴 HIGH | May break GitHub/Runner auth |
| Runner Script Change | 🟡 MEDIUM | May break dispatch pipeline |
| Issue Label Manual Change | 🟡 MEDIUM | May cause double-run |
| n8n UI Edit | 🟡 MEDIUM | Requires identity verification |

---

## 14. Rollback References

| Item | Path / Reference |
|------|-----------------|
| Last Green Workflow Export | `exports/green/dispatcher-green-20260627T131737Z.json` |
| Last Green Commit | `869fa69` |
| Last Green Evidence Path | `evidence/final-execution-success-canary-issue-7-20260627T123611Z/` |
| Last Stable Evidence (49 files) | `evidence/final-execution-success-canary-issue-7-20260627T085436Z/` |
| Guardrails Fix Evidence | `evidence/guardrails-trigger-agnostic-fix-20260627T062657Z/` |

---

## 15. Evidence Index

| Session | Path | Status |
|---------|------|--------|
| Post-Green Stabilization (current) | `evidence/post-green-stabilization-20260627T131737Z/` | 🟢 in progress |
| Final Canary #7 Report | `evidence/final-execution-success-canary-issue-7-20260627T123611Z/` | 🟢 complete |
| Final Canary #7 Evidence (49 files) | `evidence/final-execution-success-canary-issue-7-20260627T085436Z/` | 🟢 complete |
| Playwright UI Fix | `evidence/playwright-ui-fix-20260627T112116Z/` | 🟢 complete |
| Canary #6 Final Green | `evidence/final-green-canary-issue-6-20260627T073906Z/` | 🟢 complete |
| Canary #5 E2E | `evidence/e2e-canary-issue-5-20260627T071248Z/` | 🟢 complete |
| Guardrails Fix | `evidence/guardrails-trigger-agnostic-fix-20260627T062657Z/` | 🟢 complete |
| Schedule Auto-Run | `evidence/schedule-auto-run-verification-20260627T061306Z/` | 🟢 complete |
| Node 15 Fix | `evidence/schedule-trigger-node15-fix-20260627T050006Z/` | 🟢 complete |

---

## 16. Comment-Sync Update (2026-06-29)

### Status
🔒🟢 **COMMENT_SYNC_GREEN_BASELINE_FROZEN**

### What Changed
- **Node 11 (Format Evidence Comment):** Parses SSH stdout as `JSON.parse(sshOutput.stdout)` → extracts real values from `status.json`
- **Node 15 (Format Final Result):** Synced from `evidenceFormat.status` instead of hardcoded `GREEN_PARTIAL_PLUS`

### GitHub Comment Now Shows
| Field | Source | Example |
|-------|--------|---------|
| Status | `status.json.status` | `GREEN` |
| Mode | `status.json.mode.effective` | `opencode-run` |
| Provider configured | `status.json.agent_runtime.opencode_provider_configured` | `true` |
| Provider | `status.json.provider` | `deepseek` |
| Model | `status.json.model` | `deepseek-v4-pro` |
| OpenCode Version | `status.json.agent_runtime.opencode_version` | `1.17.9` |
| Evidence Source | Label | `status.json` |

### SQLite Dual-Table Knowledge
- n8n uses `workflow_history.activeVersionId` for execution, NOT `workflow_entity.nodes`
- Both `workflow_entity.nodes` AND `workflow_history.nodes` must be patched for changes to take effect
- After DB patch, n8n restart is required to clear in-memory workflow cache

### Backup
- `database.sqlite.bak.20260629T0600Z` on CT 101 (`/opt/dev-fabric/n8n/data/.n8n/`)
- Rollback plan: `evidence/post-comment-sync-stabilization-20260629T065737Z/rollback-plan.md`

### Protection
- Issues #3-#16: ALL protected (no `agent:ready`, no `agent:running`, all `agent:needs-review` + `evidence:attached`)
- Guardrails block: isAlreadyProcessed detection, HARD BLOCK for Issue #3

### Next Observation
- 24h Read-only Check empfohlen (keine Änderungen am Workflow nötig)
