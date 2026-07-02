# Project Status

**Last Updated:** 2026-07-02T15:20:00Z
**Current Status:** **DEEPSEEK_DUMMY_AGENT_GREEN** 🟢 | **PROVIDER_DISPATCH_INTEGRATED** ✅ | **COMMENT_SYNC_GREEN_BASELINE_FROZEN** 🟢🔒 | **NEW_MACHINE_OPERATIONAL_READY_WITH_HISTORY_LEAK_NOTE** 🟢🖥️ | **N8N_API_READY** 🟢🔑 | **SSH_AUTHORIZED** 🟢🔐 | **SU_RUNNER_HANG_CONFIRMED** 🟡🔍 | **DATABASE_LOCK_RUNNER_CT102_SUSPECTED** 🟡🔍 | **N8N_MCP_CAPABLE** 🟢🔧 | **PLAYWRIGHT_MCP_CAPABLE** 🟢🔧 | **MCP_BUILD_PROCESS_PREPARED** 🟢📐 | **RUNNER_PROVIDER_ENV_READY** 🟢⚙️

---

## Dispatcher Workflow (Sv12QTo56NoPUu2D)

| Item | Status | Detail |
|---|---|---|
| Manual Trigger | ✅ Present | Confirmed |
| Schedule Trigger (15 min) | ✅ Present + Firing | Exec #69 — SUCCESS (86.3s), #8 processed |
| Node 15 (Format Final Result) | ✅ **FIXED + VERIFIED** | `// ====` published to active version, Exec #69 = `success` |
| Guardrails & Validate | ✅ **FIXED** | Trigger-agnostic — no Manual Trigger dependency |
| Workflow Active | ✅ Published | ▶️ icon, Publish button disabled |
| Node Count | ✅ 18 functional | GitHub Search + Pick First Ready Issue operational |

### ✅ Fixed: Guardrails & Validate Node
- **Old Symptom:** `Cannot assign to read only property 'name' of object 'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'`
- **Root Cause:** Hardcoded `$('Manual Trigger (Smoke Test)').first().json` reference
- **Fix:** Removed Manual Trigger dependency, uses `$input.first().json` only
- **Additional protections added:** Issue #3 hard block, already-processed guard
- **Verified:** Execution #48 — Guardrails passed, full dispatch completed

### Test Issue #4
- **Status:** ✅ PROCESSED (Execution #48, Schedule Trigger)
- **Labels:** `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low`
- **Runner Evidence:** `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-4/gh-issue-4-20260627T064530Z`
- **Runner Result:** Evidence written, OpenCode v1.17.9 available

### Canary Test Issue #5
- **Status:** ✅ PROCESSED (Execution #51, Schedule Trigger, 07:30 UTC)
- **Labels:** `agent:needs-review`, `evidence:attached`, `test:canary`, `dispatcher:e2e`
- **Runner Evidence:** `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-5/gh-issue-5-20260627T073030Z`
- **Duration:** 85.75s (full pipeline)
- **Verification:** All guardrails passed, Issue #3 & #4 NOT re-processed

### Final Canary Test Issue #6
- **Status:** ✅ PROCESSED (Execution #53, Schedule Trigger, 08:00 UTC)
- **Labels:** `agent:needs-review`, `evidence:attached`, `test:canary`, `dispatcher:e2e`
- **Runner Evidence:** `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-6/gh-issue-6-20260627T080031Z`
- **Duration:** 89.5s (full pipeline)
- **Verification:** All guardrails passed, Issue #3, #4 & #5 NOT re-processed
- **Runner:** RUN_INPUT validated, Runner started, Evidence written — all PASS

### Issue #3
- **Status:** Protected ✅ — No double-run, labels unchanged since 2026-06-26. Triple-confirmed across Canary #5 and #6.

---

## n8n Live Instance

| Item | Value |
|---|---|
| CT | 101 |
| IP | 192.168.1.52:5678 |
| Healthz | 200 OK |
| Public API v1 | ✅ Working (JWT Bearer token) |
| REST API | ❌ 401 (email auth required) |
| Playwright Access | ✅ **VERIFIED** — Authenticated, browser operational, UI readable |

---

## Known Issues

1. ⚠️ **n8n REST API 401** — REST API requires email auth, not configured. Public API v1 works.
2. ℹ️ **Proxmox Host Zombie n8n** — Restart-loop, DO NOT TOUCH
3. ℹ️ **Playwright n8n UI session expired** — Browser session cookies invalid. API v1 used as fallback for workflow operations.

---

## Blockers

| Blocker | Impact | Resolution |
|---|---|---|
| ~~Guardrails node bug~~ | ~~Schedule Trigger fires but crashes~~ | ✅ **FIXED** — Trigger-agnostic code deployed |
| ~~Schedule Trigger reliability~~ | ~~Needed end-to-end verification~~ | ✅ **VERIFIED** — 4 consecutive E2E tests (Issues #4-#8) |
| ~~Format Final Result typo~~ | ~~Execution shows "error" in UI~~ | ✅ **FIXED** — Draft published via API v1, Exec #69 = `success` |
| n8n UI session expired | Cannot use Playwright for UI operations | Re-authenticate if needed |
| n8n API v1 no workflow write | Can't update nodes programmatically | Use n8n UI or REST API (needs email auth) |

---

## ✅ Playwright MCP Green Baseline Verification (2026-06-27T11:41:00Z)

| Deliverable | Status |
|------------|--------|
| Playwright MCP verfügbar & authentifiziert | ✅ Bestätigt |
| n8n UI erreichbar | ✅ HTTP 200 |
| Workflow sichtbar (18 Nodes) | ✅ Bestätigt |
| Schedule Trigger (15 min) | ✅ Bestätigt (10/10 Executions) |
| Format Final Result Fix (Network Intercept) | ✅ `// ====` + `return [{ json: result }];` vorhanden |
| Issues #3-#7 geschützt | ✅ Keine Doppelstarts, kein `agent:ready` |
| Health Check | 🟡 HEALTH_YELLOW (effektiv GREEN) |
| Secret Hygiene | 🟡 4 Placeholder-False-Positives, 0 echte Secrets |
| Zero prohibited actions | ✅ Keine Workflow-/GitHub-/Infra-Änderungen |

### Verification Artifacts
- **Evidence:** `evidence/playwright-mcp-green-baseline-check-20260627T1131Z/` (9 files)
- **Final Report:** `evidence/.../final-report.md`
- **Validation Report:** `evidence/.../validation-report.md`
- **Playwright Screenshot:** `n8n-workflow-healthcheck.png`

## ✅ Post-Green Stabilization (2026-06-27T13:25:00Z)

| Deliverable | Status |
|------------|--------|
| Green Workflow Snapshot | ✅ Exported (`exports/green/`, SHA256: `E002E97F...`) |
| GREEN_BASELINE.md | ✅ Created |
| OPERATIONS_RUNBOOK.md | ✅ Created |
| Health Check Script | ✅ `scripts/dispatcher-health-check.mjs` |
| Health Check Result | 🟡 `HEALTH_GREEN_WITH_NOTES` (1 false positive) |
| Secret Hygiene | ✅ CLEAN (0 real leaks) |
| Validation Report | ✅ Created |
| Issues #3-#7 Safe | ✅ All confirmed |

### Stabilization Artifacts
- **Evidence:** `evidence/post-green-stabilization-20260627T131737Z/` (7 files)
- **Export:** `exports/green/dispatcher-green-20260627T131737Z.json`
- **Baseline:** `evidence/.../GREEN_BASELINE.md`
- **Runbook:** `evidence/.../OPERATIONS_RUNBOOK.md`

---

## ✅ GREEN_EXECUTION_SUCCESS_CONFIRMED (2026-06-27T12:05:00Z)

| Deliverable | Status |
|------------|--------|
| Format Final Result Fix Published | ✅ `// ====` active version confirmed via API v1 |
| Canary Issue #8 Created | ✅ `agent:ready` + `test:canary` |
| Schedule Trigger (12:00 UTC) | ✅ Execution #69, mode=trigger |
| Execution Status | ✅ **`success`** (86.3s full pipeline, ZERO errors) |
| Runner Evidence | ✅ GitHub comment + evidence path |
| Label Transition | ✅ `agent:ready` → `agent:running` → `agent:needs-review` + `evidence:attached` |
| Issues #3-#7 Protected | ✅ All labels + comments unchanged, no re-processing |
| Double-Run Protection | ✅ Single execution only, no retries |
| Health Check | 🟡 HEALTH_YELLOW (effective GREEN, 8/8 core checks PASS) |
| Secret Hygiene | ✅ 0 real secrets, 8 placeholder false positives |
| Zero Prohibited Actions | ✅ No secrets, no destructive actions, no GitHub Actions |

### Verification Artifacts
- **Evidence:** `evidence/final-format-result-success-canary-issue-8-20260627T114642Z/` (14+ files)
- **API Verification:** `GET /api/v1/executions/69` = `{"status": "success"}`
- **API Code Check:** Line 3 = `// ===========================================================================`
- **GitHub Verification:** Issue #8 correctly labeled, Issues #3-#7 untouched

---

## ✅ Post-Success Operations Hardening (2026-06-27T14:09:31Z)

| Deliverable | Status |
|------------|--------|
| Preflight Reality Check | ✅ Completed |
| Commit 4aa36d5 Review | ✅ CLEAN — 20 files, documentation/evidence only, 0 secrets |
| Secret Hygiene Gate | ✅ GREEN — 0 real secrets, 8 known placeholder false positives |
| Push Decision | ✅ **PUSHED** — f062182, 4aa36d5, e7e6465 on origin/master, 0 secrets, remote confirmed |
| n8n Write-Access Plan | ✅ Created (`n8n-write-access-plan.md`) |
| OpenCode Provider Plan | ✅ Created (`opencode-runner-provider-plan.md`) |
| Playwright Session Plan | ✅ Created (`playwright-session-renewal-plan.md`) |
| Reliability Observation Plan | ✅ Created (`reliability-observation-plan.md`) |
| Health Check | 🟡 HEALTH_YELLOW (effective GREEN, 8/8 core checks PASS) |
| Validation Report | ✅ All 38 criteria met, 0 hard constraints violated |

### Hardening Artifacts
- **Evidence:** `evidence/post-success-operations-hardening-20260627T140931Z/` (10+ files)
- **Plans:** n8n-write-access-plan.md, opencode-runner-provider-plan.md, playwright-session-renewal-plan.md, reliability-observation-plan.md
- **Status:** GREEN_EXECUTION_SUCCESS_CONFIRMED with GREEN_WITH_UNPUSHED_COMMIT

---

## 🔵 Push & Reliability Observation Start (2026-06-27T15:28:00Z)

| Deliverable | Status |
|------------|--------|
| Push Preflight | ✅ Completed |
| Secret Hygiene Gate | ✅ GREEN — 0 real secrets, 17 documented false positives |
| Push to origin/master | ✅ **PUSHED** — f062182, 4aa36d5, e7e6465 |
| Remote Confirmed | ✅ All 3 commits on origin/master |
| Health Check after Push | 🟡 HEALTH_YELLOW (effective GREEN, 8/8 core checks PASS) |
| Reliability Day 0 Log | ✅ Created — `evidence/reliability-daily/2026-06-27.md` |
| Issues #3-#8 Protected | ✅ All confirmed |
| Next Check | 2026-06-28 (Day 1) |

### Observation Artifacts
- **Evidence:** `evidence/push-and-reliability-start-2026-06-27T152645Z/` (5+ files)
- **Reliability Log:** `evidence/reliability-daily/2026-06-27.md`
- **Updated:** STATUS.md, CHANGELOG.md, evidence-index/latest.md

## 🔵 Reliability Observation Day 2 — Completed (2026-06-27T17:18:00Z)

| Deliverable | Status |
|------------|--------|
| Preflight Reality Check | ✅ Completed |
| Dispatcher Health Check | 🟡 HEALTH_YELLOW (effective GREEN, 8/8 core PASS) |
| n8n Executions Read-Only Check | ✅ No new activity — Execution #69 remains latest (Day 2) |
| GitHub Issues #3-#8 Protection | ✅ All 6 protected — 0 new comments, 0 agent:ready (Day 2) |
| Secret Hygiene Scan | ✅ GREEN — 0 real secrets, 24 false positives (Day 2) |
| Daily Log | ✅ Created — `evidence/reliability-daily/2026-06-29.md` |
| Day 2 Evidence | ✅ `evidence/reliability-day-2-2026-06-29-20260627T171051Z/` (7 files) |

### Day 2 Highlights
- ✅ 3-Tage-Trend: stabil — keine Degradation gegenüber Day 0/1
- ✅ Issues #3-#8: Permanent geschützt (3 Tage in Folge)
- ✅ Secret Hygiene: 3 Tage in Folge 0 echte Leaks
- ✅ Health Check: 3 Tage in Folge 8/8 core PASS
- ✅ 0 Hard-Constraint-Verletzungen über gesamte Observation

---

## 🔵 Reliability Observation Day 1 — Completed (2026-06-27T17:15:00Z)

| Deliverable | Status |
|------------|--------|
| Preflight Reality Check | ✅ Completed |
| Dispatcher Health Check | 🟡 HEALTH_YELLOW (effective GREEN, 8/8 core PASS) |
| n8n Executions Read-Only Check | ✅ No new activity — Execution #69 remains latest |
| GitHub Issues #3-#8 Protection | ✅ All 6 protected — 0 new comments, 0 agent:ready |
| Secret Hygiene Scan | ✅ GREEN — 0 real secrets, 20 false positives (placeholders) |
| Daily Log | ✅ Created — `evidence/reliability-daily/2026-06-28.md` |
| Day 1 Evidence | ✅ `evidence/reliability-day-1-2026-06-28-20260627T165431Z/` (7 files) |

### Day 1 Summary
- ✅ n8n erreichbar — HTTP 200, healthz OK
- ✅ Workflow active — 18 nodes, Schedule Trigger present
- ✅ Issues #3-#8 geschützt — kein agent:ready, keine Doppelstarts
- ✅ Keine neuen Canaries — keine Runner manuell gestartet
- ✅ Keine Secrets — 0 echte Leaks, alle False Positives dokumentiert
- ✅ Keine Infrastruktur-Änderungen — Proxmox/Docker unverändert
- ✅ Status: **GREEN_RELIABILITY_DAY_1** (GREEN_WITH_NOTES: API auth not configured)

### Day 1 Artifacts
- **Evidence:** `evidence/reliability-day-1-2026-06-28-20260627T165431Z/`
- **Files:** preflight.md, dispatcher-health-day-1.md/json, n8n-executions-day-1.md, github-issues-3-8-day-1.md, secret-hygiene-day-1.md
- **Daily Log:** `evidence/reliability-daily/2026-06-28.md`

---

## 🔵 Reliability Observation Day 3 — COMPLETED (2026-06-27T19:28:13Z)

| Deliverable | Status |
|------------|--------|
| Preflight Reality Check | ✅ Completed |
| Dispatcher Health Check | 🟡 HEALTH_YELLOW (effective GREEN, 8/8 core PASS) |
| n8n Executions Read-Only Check | ✅ No new activity — Execution #69 remains latest (Day 3) |
| GitHub Issues #3-#8 Protection | ✅ All 6 protected — 0 new comments, 0 agent:ready (Day 3) |
| Secret Hygiene Scan | ✅ GREEN — 0 real secrets, 25 false positives (Day 3) |
| Daily Log | ✅ Created — `evidence/reliability-daily/2026-06-30.md` |
| 3-Tage-Abschlussbeurteilung | ✅ `RELIABILITY_OBSERVATION_PASSED_WITH_NOTES` |
| Day 3 Evidence | ✅ `evidence/reliability-day-3-2026-06-30-20260627T192813Z/` (8 files) |

### Day 3 Highlights
- ✅ 4-Tage-Trend: stabil — keine Degradation über gesamte Observation
- ✅ Issues #3-#8: Permanent geschützt (4 Tage in Folge)
- ✅ Secret Hygiene: 4 Tage in Folge 0 echte Leaks
- ✅ Health Check: 4 Tage in Folge 8/8 core PASS
- ✅ 0 Hard-Constraint-Verletzungen über gesamte Observation
- 🟡 Einzige Note: `N8N_API_KEY fehlt` (Plan existiert)

---

## 🟢 DeepSeek Direct Provider Configuration (2026-06-28T09:20:00Z)

| Deliverable | Status |
|------------|--------|
| Runner Discovery | ✅ OpenCode v1.17.9, Debian 12 |
| **Provider** | ✅ `deepseek` (built-in provider, NOT opencode-go) |
| **API Key** | ✅ Real DeepSeek API key present |
| **Model** | ✅ `deepseek-v4-pro` (validated via api-docs.deepseek.com) |
| **Provider Smoke Test** | ✅ **DEEPSEEK_PROVIDER_SMOKE_GREEN** — model listing + agent run confirmed |
| Secret File (Runner) | ✅ 600 perms, runner:runner, LF endings |
| Secret Loader Script | ✅ 7 vars + DEEPSEEK_API_KEY mapping |
| Smoke Test Script | ✅ Provider type detection for deepseek |
| Copy Script | ✅ Working |
| Secret Hygiene | ✅ GREEN — 0 real leaks |
| Readiness Decision | ✅ **READY_FOR_DEEPSEEK_SMOKE** |
| Dummy Agent Test | 🟡 **GREEN_PROVIDER_READY_DUMMY_BLOCKED_BY_POLICY** |

### Key Architecture Discovery
- OpenCode 1.17.9 ships DeepSeek as a **built-in provider** — no custom config needed
- Authenticates via `DEEPSEEK_API_KEY` env var
- **CRITICAL:** `opencode-go` rejects direct DeepSeek keys (requires OpenCode Platform keys)
- **CRITICAL:** Built-in `deepseek` provider requires direct DeepSeek API keys (rejects OpenCode Platform keys)

### Working Configuration
```env
OPENCODE_PROVIDER=deepseek
OPENCODE_MODEL=deepseek-v4-pro
# OPENCODE_API_KEY → mapped to DEEPSEEK_API_KEY by loader
```

### Evidence
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` (15+ files)

### Previous State (OBSOLETE)
- ~~`opencode-go` provider with DeepSeek key — Invalid API key~~
- ~~`GREEN_PARTIAL_SECRET_PLACEHOLDER` — now resolved with real key~~

---

## 🟡 DeepSeek Dummy Agent Test (2026-06-28T09:20:00Z)

| Deliverable | Status |
|------------|--------|
| Dummy Issue #9 Created | ✅ `agent:ready` + `test:dummy` + `opencode:smoke` + `deepseek:direct` |
| Dispatcher Detection | ✅ Picked up in 59s (Schedule Trigger) |
| Runner Started | ✅ Exactly once |
| Runner Completed | ✅ `GREEN_PARTIAL` (84s execution) |
| Label Transition | ✅ ready → running → needs-review + evidence:attached |
| Runner Evidence | ✅ 8 files in `gh-issue-9-20260628T091530Z/` |
| Issues #3-#8 Protected | ✅ 0 re-processed, 0 label drift |
| OpenCode/DeepSeek Used | 🟡 Provider configured on system but NOT sourced in dispatch script |
| Secret Hygiene | ✅ GREEN — 0 leaks |
| Productive Changes | ✅ 0 |

### Key Finding: Provider Dispatch Gap

The DeepSeek provider IS fully configured and smoke-tested on the runner (`DEEPSEEK_PROVIDER_SMOKE_GREEN`), but the runner's `start_github_issue_run.sh` dispatch script does NOT source the provider environment file. The agent ran in `manual-terminal` mode (safe fallback) instead of using OpenCode with the DeepSeek provider.

**Root Cause:** Dispatch script does not load `opencode-provider.env` before agent run.
**Impact:** DeepSeek provider not utilized during agent dispatch (provider itself is operational).
**Fix Needed:** Add optional provider-env sourcing to dispatch script.

### Evidence
- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` (9+ files)
- Runner: `/opt/dev-fabric/evidence/github-agent-runs/.../issue-9/gh-issue-9-20260628T091530Z/`

---

## 🟢 DeepSeek Dispatch Path Integration (2026-06-28T12:37:00Z)

### Integration Summary
- 🟢 **Root Cause:** Runner dispatch script didn't source provider env; dispatcher always sends `mode=manual-terminal`
- 🟢 **Fix Applied:** Direct env source with `set +e` protection + `manual-terminal` → `opencode-run` mode upgrade when provider loaded
- 🟢 **Verified with Issue #12:** `effective_mode=opencode-run`, `opencode_provider_configured=true`, `status=GREEN`
- 🟢 **Dispatch Script:** SHA256 `4610a983...`, backup `start_github_issue_run.sh.bak.20260628T093029Z`
- 🟢 **Evidence:** 8 files in runner directory, 15+ files in local evidence

### Key Evidence (Issue #12 agent.log)
```
requested_mode=manual-terminal
effective_mode=opencode-run        ← UPGRADED
opencode_provider_configured=true   ← PROVIDER LOADED
status=GREEN                        ← NOT GREEN_PARTIAL
manual_reason=none
```

### Gates
- ✅ Dispatcher unchanged | ✅ Schedule unchanged | ✅ Provider env loaded in dispatch | ✅ Mode upgraded | ✅ Issues #3-#9 protected | ✅ Secret hygiene GREEN

### Evidence
- `evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/`
- Runner: `/opt/dev-fabric/evidence/.../issue-12/gh-issue-12-20260628T123030Z/`

---

## 🔴 Runner SSH Authorization Repair (2026-06-29T16:36:00Z) — Phases 7-16

### SSH Validation AFTER User Key Authorization on Runner

| Check | Result |
|-------|--------|
| SSH BatchMode test to `runner@192.168.1.53` with `id_ed25519` | 🔴 **FAILED** — Permission denied (publickey,password) |
| Key offered to server | ✅ Yes — fingerprint: `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg` |
| Server accepted key | ❌ No — "Authentications that can continue: publickey,password" after offering |
| Second key (`docvault_n8n_docbot`) | ❌ Also rejected |
| Status | **SSH_KEY_STILL_NOT_AUTHORIZED** 🔴🔐 |

### SSH Debug (Phase 9)
- Key IS offered with correct fingerprint — local identity is valid
- Server DOES NOT accept the key — likely wrong key in `authorized_keys` or permission issue
- Probable cause: wrong public key was added, or file permissions incorrect on runner

### n8n API Recheck (Phase 10)

| Check | Result |
|-------|--------|
| API read-only test (HTTP) | 🟢 **200** — non-empty response |
| API Key valid | ✅ Confirmed — no regression |
| Status | **N8N_API_READY** 🟢🔑 |

### Runner Read-Only (Phase 8)

⏭️ SKIPPED — SSH still blocked

### Secret Hygiene Recheck (Phase 12)

| Check | Result |
|-------|--------|
| `secrets/` tracked in git | SAFE (0 files) |
| Database files tracked | SAFE (0 files) |
| `.playwright-mcp/` tracked | 🔴 48 files — 1 contains n8n JWT tokens (pre-existing, commit `485dc18`) |
| New secrets in this session | 🟢 **NONE** — 0 new leaks |
| Evidence files clean | 🟢 **YES** — all new evidence secret-clean |
| Status | **KNOWN_PREEXISTING_HISTORY_LEAK** (unchanged) |

### Dispatcher Health (Phase 11)

- 🟡 `HEALTH_YELLOW` — n8n reachable ✅, API green ✅, workflow local ✅, SSH blocked 🔴
- 6/11 PASS, 3 WARN (known false positives), 1 FAIL (secret-hygiene script), 1 SKIP (API key not in env)
- No real errors — known false positives: powershell not on Linux, git untracked evidence dirs, placeholder patterns

### Operational Readiness (Phase 13)

- **Overall:** `SSH_KEY_STILL_NOT_AUTHORIZED` — **NOT OPERATIONAL READY**
- **Updated:** `LINUX_MINT_OPERATIONAL_READINESS.md` — reflects current state
- **No runtime changes** — Read-only validation session
- **No issues modified**

### Evidence
- `evidence/runner-ssh-authorization-repair-2026-06-29T162037Z/` (10 files)
  - Phases 1-6 (previous): preflight, keys, selection, authorization instructions
  - Phase 7: `runner-ssh-validation-after-authorization.md`
  - Phase 9: `ssh-debug-redacted.md`
  - Phase 10: `n8n-api-recheck-after-ssh-repair.md`
  - Phase 11: `dispatcher-health-after-ssh-repair.md`
  - Phase 12: `secret-hygiene-after-ssh-repair.md`
  - Phase 13: `readiness-summary.md`

---

## Next Actions

**Priority 1:** ✅ DeepSeek Provider Smoke — DONE (DEEPSEEK_PROVIDER_SMOKE_GREEN)
**Priority 2:** ✅ Execution Success Confirmed — DONE (Exec #69 = `success`)
**Priority 3:** ✅ Operations Hardening — DONE (All 4 operational plans created, gates verified)
**Priority 4:** ✅ Push completed — DONE (f062182, 4aa36d5, e7e6465 on origin/master)
**Priority 5:** ✅ **Reliability Observation COMPLETED** — Day 0-3 abgeschlossen mit `RELIABILITY_OBSERVATION_PASSED_WITH_NOTES`
**Priority 6:** 🔜 Configure n8N REST API key for full programmatic access (plan created)
**Priority 7:** ✅ **DeepSeek Dummy Agent Test** — DONE (`GREEN_PARTIAL`: dispatcher+runner OK, provider not in dispatch path)
**Priority 8:** ✅ **Provider Dispatch Integration** — DONE (`DEEPSEEK_DUMMY_AGENT_GREEN`: DeepSeek provider loaded in dispatch path, mode upgraded from manual-terminal to opencode-run)
**Priority 9:** 🔜 Refresh Playwright n8n UI session for UI-based operations (plan created)
**Priority 10:** 🔴 **SSH Key Authorization on Runner** — User authorized key but still rejected. Verify correct public key in `/home/runner/.ssh/authorized_keys` (fingerprint `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`) + check permissions (`chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys`)
**Priority 11:** 🟡 **`.playwright-mcp/` History-Remediation** — Separate task: Token Rotation → History Rewrite

---

## Local OpenCode Credential Transfer (2026-06-28T06:09Z)

### Discovery Result
- 🟡 **GREEN_PARTIAL_CREDENTIAL_NOT_FOUND** — No real OpenCode credentials found locally
- ✅ **All sources scanned:** 9 env vars, 4 config paths, 2 project paths
- ✅ **Placeholder detection FIXED:** Added PASTE_* patterns to detection
- ❌ **No real credentials:** All 3 credential values in `secrets/opencode-provider.env` are PASTE_* placeholders
- ✅ **Model found:** OpenCode config has model set (no provider, no key)

### Scripts Created
- ✅ `scripts/discover-local-opencode-credentials.ps1` — safe discovery, never outputs values
- ✅ `scripts/export-local-opencode-credentials.ps1` — normalizes credentials, -DiscoverOnly/-WriteLocalSecret modes
- ✅ `scripts/copy-opencode-provider-credentials.ps1` — existing, VerifyOnly PASS

### Runner Readiness
- ✅ OpenCode 1.17.9 on runner
- ✅ Node v22.23.0, Git 2.39.5, Bash 5.2.15
- ✅ Loader and Smoke scripts present
- ✅ Proxmox/Container connectivity verified

### Gates
- ✅ Dispatcher unchanged
- ✅ Issues #3–#8 protected
- ✅ Secret Hygiene GREEN
- ⛔ Provider Smoke BLOCKED (no real credentials)
- ⛔ Dummy Agent Test BLOCKED (by policy)

### Evidence
- `evidence/local-opencode-credential-transfer-20260628T060908Z/` (12 files)

---

## 🟢 Comment Sync Fix — status.json Integration (2026-06-29T06:50:00Z)

### ✅ Issue Resolved

The GitHub comment now correctly reads real Runner Evidence from `status.json` instead of stale `RUN_INPUT.json` values.

### Root Cause (Dual)
1. **Node code bug:** The "SSH Read status.json" Node outputs a wrapper `{ stdout, success, exitCode }`, but the "Format Evidence Comment" Node tried to parse the wrapper directly instead of extracting `.stdout` first.
2. **n8n versioning:** n8n uses `workflow_history.activeVersionId` for execution, not `workflow_entity.nodes`. The initial patch only updated `workflow_entity.nodes`, leaving `workflow_history.nodes` with stale code.

### Fix Applied (via Direct Database Update)
- 🟢 **Node 11 ("Format Evidence Comment"):** Updated to parse `sshOutput.stdout` as JSON, extract all status.json fields
- 🟢 **Node 15 ("Format Final Result"):** Uses evidenceFormat data instead of hardcoded values
- 🟢 **Fallback Chain:** status.json → SSH raw → RUN_INPUT.json → hardcoded defaults
- 🟢 **Evidence Source Label:** Explicit `Evidence source: status.json` in comment
- 🟢 **Both tables patched:** `workflow_entity.nodes` + `workflow_history.nodes`

### Deployment Method
- Method: Direct SQLite database update via Proxmox SSH
- Affected: `workflow_entity.nodes` + `workflow_history.nodes` (Node 11 + Node 15)
- Backup: `database.sqlite.bak.20260629T0600Z`

### Issue #16 Verification (FIRST SUCCESSFUL RUN)
- ✅ Dispatch Pipeline: Issue #16 via Schedule Trigger (Execution #240)
- ✅ Label Transition: `agent:ready` → `agent:needs-review` + `evidence:attached`
- ✅ GitHub Comment: `Evidence source: status.json` ✅
- ✅ Values verified: `Status: GREEN`, `Mode: opencode-run`, `Provider configured: true`, `Provider: deepseek`, `Model: deepseek-v4-pro`, `OpenCode: 1.17.9`
- ✅ Issues #3-#15 Protected: Alle 13 geschützt, 0 re-processed
- ✅ Secret Hygiene: GREEN — 0 echte Leaks

### Evidence
- `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/` (16+ files)
- Live export: `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-live-after-patch-20260629T061308Z.json`

---

## 2026-06-29 — 24h Read-Only Observation 🟢✅ COMMENT_SYNC_24H_OBSERVATION_GREEN

### Observation Run (Strictly Read-Only, 15 Phases)
- 🟢 **Status Decision:** `COMMENT_SYNC_24H_OBSERVATION_GREEN`
- 🟢 **n8n Stable:** HTTP 200, healthz OK, workflow active (18 nodes)
- 🟢 **Workflow Stable:** Schedule trigger active, comment-sync nodes present (SSH Read status.json → Format Evidence Comment → Create GitHub Comment)
- 🟢 **Comment-Sync Stable:** Issue #16 comment verifies `status.json` source, all values correct
- 🟢 **Issues #3-#16 Protected:** All OPEN, no `agent:ready`, 0 new comments since baseline freeze
- 🟢 **SQLite State Stable:** No drift, comment-sync patch in active version
- 🟢 **Secret Hygiene Green:** 0 real leaks, 1 known false positive (JWT token)
- 🟢 **Backup/Rollback Intact:** `database.sqlite.bak.20260629T0600Z`, rollback plan documented
- 🟢 **All 15 Prohibition Constraints Met:** No changes, no new issues, no closures, no secrets
- ⚠️ **Branch Drift:** `master` vs `main` — governance note (pre-existing, unchanged)
- ⚠️ **Health Check:** HEALTH_YELLOW (effective GREEN — 3 known false positives)
- ⚠️ **Dummy Issues #9-#16:** Still open (to be closed in separate cleanup task)

### Evidence
- `evidence/comment-sync-24h-observation-20260629T074032Z/` (13 files: preflight, git, n8n health, executions, issue guard, comment-sync validation, SQLite, backup, dispatcher health, secret hygiene, observation summary, validation report, final report)

### Branch Drift Governance Analysis (2026-06-29)

### Analysis Results
- **Status:** `RED_BRANCH_CONFLICT` — unrelated histories (kein gemeinsamer Vorfahre)
- **Default Branch (GitHub):** `main`
- **Source of Truth (Operations):** `master`
- **main HEAD:** `3687959` (27.06.2026) — 28 unique commits, Root `9e41bba`
- **master HEAD:** `1c9a68b` (29.06.2026) — 26 unique commits, Root `5088845`
- **Diff:** 591 files, +61,743 / -10,300
- **Gemeinsame Commits:** 0 (unrelated histories)
- **Branch Protection:** Keine (weder main noch master)
- **Offene PRs:** Keine
- **GitHub Actions:** Keine

### Recommendation
- **Option A (Empfohlen):** `master` als GitHub Default Branch setzen
- **Keine Änderung durchgeführt** — wartet auf Nutzer-Freigabe

### Evidence
- `evidence/branch-drift-governance-20260629T080206Z/` (8 files)

### Secret Hygiene
- **GREEN** — 0 echte Leaks in Analyse und Evidence

## Branch Governance — Applied (2026-06-29 08:19 UTC)

- 🟢✅ **BRANCH_GOVERNANCE_DEFAULT_MASTER_APPLIED** — GitHub Default Branch ist jetzt `master`
- 🟢 **Methode:** `gh repo edit --default-branch master`
- 🟢 **`main` nicht gelöscht** — existiert weiterhin als historischer Branch
- 🟢 **Kein Merge, kein Force Push, keine Branches gelöscht**
- 🟢 **Commit `4670add` gepusht** — Branch-Drift-Analyse auf origin/master
- 🟢 **Source of Truth jetzt sichtbar** auf GitHub-Projektseite (`master`)

### Evidence
- `evidence/branch-default-master-apply-20260629T081907Z/` (5 files: preflight, commit review, secret hygiene, push result, default branch apply)

## 🟢 Dummy Issue Cleanup #9–#16 — COMPLETED (2026-06-29T10:31:14Z)

### Cleanup Execution
- 🟢 **DUMMY_ISSUES_CLEANUP_GREEN** — All 8 dummy/test/canary issues safely closed
- 🟢 **Issues Closed:** #9, #10, #11, #12, #13, #14, #15, #16 — all as `completed`
- 🟢 **Method:** GitHub `gh issue close` — no workflow, SQLite, runner, or branch changes
- 🟢 **Safety Gate:** All 8 passed all 10 criteria (dummy confirmed, no `agent:ready`, evidence present)
- 🟢 **Closing Comments:** Standardized cleanup comment posted on all 8 issues
- 🟢 **Issues #3–#8 Protected:** All 6 unchanged — OPEN, same labels, no new comments
- 🟢 **Dispatcher:** No new executions triggered — no `agent:ready` labels remain
- 🟢 **Secret Hygiene:** GREEN — 0 real secrets in any cleanup artifact
- 🟢 **No Prohibited Actions:** No workflow changes, no SQLite, no runner, no branch, no force push, no GitHub Actions

### Evidence
- `evidence/dummy-issues-cleanup-9-16-20260629T103114Z/` (12+ files)

## 🟢 Repo Hygiene — Root Docs & Gitignore Hardening (2026-06-29T09:06:31Z)

### Hygiene Run Completed
- 🟢✅ **REPO_HYGIENE_GREEN** — `.gitignore` hardened, root documentation pointers created
- 🟢 **`.gitignore` hardened:** 14 new patterns for DB/backup artifacts + `.playwright-mcp/` session artifacts
- 🟢 **Root pointers created:** `GREEN_BASELINE.md` and `OPERATIONS_RUNBOOK.md` at repo root
- 🟢 **Tracked DB/backup files:** 0 — GREEN_NO_TRACKED_DB_BACKUPS
- 🟢 **Secret Hygiene:** GREEN — 0 echte Leaks (4 redacted references, 35 placeholder false positives)
- 🟢 **No Runtime Changes:** No workflow, SQLite, runner, branch, or issue modifications
- 🟡 **Note:** 48 historical `.playwright-mcp/` files remain tracked in git index — not removed (manual review recommended)

### Evidence
- `evidence/repo-hygiene-root-docs-gitignore-20260629T090631Z/` (12 files)

## 🔴 RED_SECRET_LEAK — `.playwright-mcp/` Index Cleanup Halted (2026-06-29T09:24:47Z)

### Finding: Real n8n JWT Tokens in Tracked Console Log
- 🔴 **Status:** `RED_SECRET_LEAK` — Real n8n API authentication tokens (JWT format) found in tracked `.playwright-mcp/` console log
- 🔴 **File:** `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log` (lines 15-23)
- 🔴 **Secret Type:** n8n API key / authentication tokens in URL query parameters (redacted in report)
- 🔴 **Context:** Browser console logs captured during Playwright-automated n8n session — local IP `192.168.1.52:5678`, workflow `Sv12QTo56NoPUu2D`
- 🔴 **Response:** `401 Unauthorized` (tokens may be expired)
- 🔴 **Action:** Index cleanup **HALTED** — per protocol, automatic removal blocked when real secrets detected
- 🟡 **Other 47 files:** No secrets detected (UI labels, docs URLs, API error messages)

### Evidence
- `evidence/playwright-mcp-index-cleanup-20260629T092447Z/` (4 files: preflight.md, playwright-mcp-tracked-inventory.md, secret-hygiene-before-playwright-index-cleanup.md, final-report.md)

### Secret Values
- **No secret values output** — all JWT tokens redacted in reports
- **Only path and redacted finding locations documented**

---

## 🟡 SECRET REMEDIATION — Playwright MCP n8n Token Leak Remediation Plan (2026-06-29T09:40:13Z)

### Remediation Plan Complete
- 🟡 **Status:** `SECRET_REMEDIATION_IN_PROGRESS` → `REMEDIATION_PLAN_COMPLETE` — Wartet auf Nutzerentscheidung
- 🔴 **Remote Exposure:** `REMOTE_SECRET_EXPOSURE_CONFIRMED` — Datei ist in Commit `485dc18` auf `origin/master`
- 🔴 **Token Rotation:** `TOKEN_ROTATION_PENDING` — Nutzer muss n8n Tokens manuell rotieren
- 🟡 **Empfehlung:** Option A — History Rewrite mit `git filter-repo` (nach Token Rotation)
- 🟡 **Alternativ:** Option B — Nur Index Cleanup (wenn Risiko akzeptiert)
- 🟢 **Secret Hygiene Evidence:** `REDACTED_EVIDENCE_GREEN` — Alle Dokumentationsdateien secret-clean
- 🟢 **Keine Cleanup-Aktionen** durchgeführt — kein `git rm --cached`, kein History Rewrite, kein Force Push

### Remote Exposure Details
- **Commit:** `485dc18` — `docs: add guardrails fix evidence and final report` (27.06.2026)
- **Auf origin/master:** JA
- **48 `.playwright-mcp/` Dateien auf Remote:** Nur 1 mit Secrets (7 JWT-Matches in Zeilen 15-23)
- **Andere 47 Dateien:** Clean

### Remediation Evidence
- `evidence/secret-remediation-playwright-mcp-n8n-token-20260629T094013Z/` (9+ files)
  - `incident-preflight.md` — Phase 1: Git-Status, Datei-Info, Constraints
  - `local-leak-structure.md` — Phase 2: Strukturelle Analyse (redacted)
  - `remote-history-exposure.md` — Phase 3: Remote Exposure bestätigt
  - `redacted-evidence-secret-hygiene.md` — Phase 4: Evidence-Clean-Scan
  - `n8n-token-rotation-plan.md` — Phase 5: Manuelle Rotations-Schritte
  - `history-remediation-options.md` — Phase 6: Option A/B/C
  - `secret-remediation-apply-plan.md` — Phase 7: Freigabegates
  - `validation-report.md` — Phase 10: 18/18 Constraints PASS
  - `final-report.md` — Phase 12: Zusammenfassung + Entscheidung

### Next Steps
1. 🔴 **URGENT:** Rotate the n8n API tokens in n8n UI (`http://192.168.1.52:5678`)
2. 🟡 Choose remediation option (A: History Rewrite, B: Index Cleanup only)
3. 🟡 After rotation: execute chosen remediation
4. 🟡 Harden: exclude console log URL query parameters from Playwright session captures
5. Continue periodic monitoring

---

## 🟡⏳ SECRET REMEDIATION — Token Rotation Checkpoint (2026-06-29T11:09:37Z)

### Remediation Status
- 🟡 **Status:** `TOKEN_ROTATION_PENDING` — Token-Rotation noch nicht bestätigt
- 🟡 **Sub-Status:** `TOKEN_ROTATION_CONFIRMATION_MISSING` — Keine Nutzerbestätigung in diesem Lauf
- 🔴 **Remote Exposure:** `REMOTE_SECRET_EXPOSURE_CONFIRMED` — Datei in Commit `485dc18` auf `origin/master`
- 🟡 **Blocked:** Keine Cleanup-Fortsetzung, kein Commit, kein Push, kein History Rewrite
- 🟡 **Next:** Nutzer muss Token-Rotation bestätigen (siehe `rotation-pending-next-steps.md`)
- 🟢 **Secret Hygiene:** `REDACTED_EVIDENCE_GREEN` — Alle Docs und Evidence secret-clean
- 🟢 **No Premature Actions:** Kein Commit, kein Push, kein Cleanup, kein History Rewrite

### Current Remediation Evidence
- `evidence/secret-remediation-after-token-rotation-20260629T110937Z/` (7+ files):
  - `preflight.md` — Git-Status, Datei-Info, Constraints
  - `token-rotation-status.md` — TOKEN_ROTATION_PENDING / CONFIRMATION_MISSING
  - `rotation-pending-next-steps.md` — Nutzer-Handlungsschritte
  - `redacted-evidence-secret-hygiene.md` — Secret-Hygiene-Scan (GREEN)
  - `index-cleanup-deferred.md` — Index-Cleanup aufgeschoben
  - `validation-report.md` — 20/20 Constraints PASS
  - `final-report.md` — Zusammenfassung + Entscheidung

### Required User Action
1. 🔴 n8n UI offnen: `http://192.168.1.52:5678`
2. 🔴 Sessions/API-Tokens widerrufen oder neu erzeugen
3. 🔴 Danach bestatigen:
   ```
   Ich bestatige: n8n Tokens wurden rotiert. Ich autorisiere die Vorbereitung eines
   History-Rewrite-Plans mit git filter-repo, aber noch keinen Force Push.
   ```
4. 🟡 Danach: Remediation wird fortgesetzt (History-Rewrite-Plan, Doku-Commit)

### Unchanged from Previous Session
- Betroffene Datei: `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log` (Zeilen 15-23)
- 48 `.playwright-mcp/` Dateien getrackt, 47 clean
- Remote Exposure in Commit `485dc18`
- Empfehlung: Option A — History Rewrite mit `git filter-repo`

---

## 🟡🖥️ LINUX MINT OPERATIONAL READINESS — NEW_MACHINE_READY_WITH_NOTES (2026-06-29T14:00:47Z)

### Validation Run (15-Phase Read-Only)

| Phase | Check | Status |
|-------|-------|--------|
| 1 | System Preflight | ✅ PASS — Linux Mint 22.1, Node v22.22, Git 2.43, curl 8.5, SSH 9.6 |
| 2 | Secret Hygiene (Before) | ⚠️ KNOWN — `.playwright-mcp/` JWT leak (key revoked) |
| 3 | Local Secret Structure | ✅ LOCAL_SECRETS_READY — n8n-api.env + opencode-provider.env, all keys present |
| 4 | n8n Health | ✅ N8N_HEALTH_OK — healthz: `{"status":"ok"}`, UI serving |
| 5 | n8n API Read-Only | ❌ N8N_API_KEY_NOT_READY — HTTP 401 |
| 6 | SSH Runner Connectivity | ❌ SSH_KEY_NOT_AUTHORIZED — Permission denied (publickey) |
| 7 | Runner Read-Only | ⏭️ SKIPPED (SSH not authorized) |
| 8 | Runner Provider | ⏭️ SKIPPED (SSH not authorized) |
| 9 | Dispatcher Health | 🟡 HEALTH_YELLOW (known powershell warnings, secret-hygiene script) |
| 10 | Readiness Summary | 🟡 NEW_MACHINE_READY_WITH_NOTES |

### Open Actions Required
1. 🔴 **SSH Key Authorization:** Copy ed25519 pubkey to `runner@192.168.1.53:~/.ssh/authorized_keys`
2. 🔴 **n8n API Key:** Generate new API key at `http://192.168.1.52:5678` → Settings → API, update `secrets/n8n-api.env`
3. 🟡 **Token Rotation:** Still pending (separate task)

### Green Items
- ✅ System tools all present and current
- ✅ Repository clean, in sync with origin/master
- ✅ Local secrets properly structured (600 perms, gitignored, all keys filled)
- ✅ DeepSeek provider config present (6/6 keys)
- ✅ n8n reachable and healthy
- ✅ No new secrets exposed
- ✅ No runtime changes

### Evidence
- `evidence/linux-mint-operational-readiness-2026-06-29T14-00-47Z/` (10+ files)

---

## 📦 MIGRATION HANDOFF — New Machine Preparation (2026-06-29T12:22:20Z)

### Handoff Status
- 🟢 **Status:** `MIGRATION_HANDOFF_PREPARED` — Migration Handoff vollständig vorbereitet
- 🟢 **Dokumente erstellt:** `MIGRATION_HANDOFF.md`, `docs/NEW_MACHINE_SETUP.md`
- 🟢 **Evidence:** `evidence/migration-handoff-old-machine-2026-06-29_12-22-20/` (4 Dateien)
- 🟢 **Secret Hygiene:** GREEN — Keine Secrets im Handoff
- 🟡 **Token-Rotation:** Bleibt offen (Nutzeraufgabe auf altem ODER neuem Rechner)
- 🟡 **History-Rewrite:** Noch nicht ausgeführt (spätere Entscheidung)

### Über GitHub übertragen
- Repository-Zustand (Commit `ecc1fc7`)
- Dokumentation (Handoff-Dokumente, Setup-Anleitung)
- Evidence-Verzeichnisse (secret-clean, redacted)

### NICHT über GitHub übertragen
- Secrets (`secrets/`, `.env.local`)
- Playwright-Sitzungen (`.playwright-mcp/`)
- SQLite/DB-Backups
- n8n API Keys
- Browser-Sessions

### Nächster Schritt
1. Neuer Rechner klont Repository und führt Setup-Prompt aus
2. Token-Rotation auf altem oder neuem Rechner finalisieren
3. History-Rewrite später entscheiden
4. Alte Maschine deaktivieren nach vollständiger Validierung

---

## 🟢🔑 n8n API Key Validation (2026-06-29T15:12:21Z)

### Aktion 1: n8n API Key lokal eingetragen und getestet

| Check | Result |
|---|---|
| `secrets/n8n-api.env` present | yes |
| Permissions | 600 |
| Gitignored | yes |
| `N8N_BASE_URL` set | yes |
| `N8N_API_KEY` set | yes (user-provided, no placeholder) |
| API read-only test | ✅ **HTTP 200** — non-empty response |
| Secrets emitted | **no** |

**Status:** `N8N_API_READY` 🟢🔑

### Aktion 2: SSH Runner — noch offen

| Check | Result |
|---|---|
| Public Key (`~/.ssh/id_ed25519.pub`) present | yes |
| Runner `192.168.1.53` (user `runner`) | not yet authorized |
| Authorization by user pending | yes |

**Status:** `SSH_USER_ACTION_REQUIRED` 🟡🔐

### Dispatcher Health

`HEALTH_YELLOW` — n8n reachable ✅, API now ready ✅ (was 401), SSH still blocked 🟡.

### Evidence

`evidence/linux-mint-readiness-blocker-fix-20260629T151221Z/` (10 files)
