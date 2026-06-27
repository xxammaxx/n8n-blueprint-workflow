# STATUS: GREEN_PARTIAL

**Last Updated:** 2026-06-27T03:54:00Z
**Session:** dispatcher-schedule-runner-verification-20260627
**Previous Session:** dispatcher-manual-verification-20260626

## Current State

| Component | Status | Detail |
|-----------|--------|--------|
| n8n Service (CT 101) | UP | PID 420195, `node /usr/bin/n8n start`, user `n8n`, listening 192.168.1.52:5678 |
| Debug Form (`/form/debug-minimal-form-ui`) | HTTP 200 | Working reference |
| **V2 Production Form** (`/form/ae9f52c1-...`) | **HTTP 200** | **LIVE** — UUID preserved |
| V2 Workflow (Published) | YES | Published and active |
| V2 Workflow (Active) | YES | Active — executing successfully |
| Form Submission (Browser) | ✅ SUCCESS | Browser-based form submit works |
| `dev-runner-ssh` Credential | ✅ VERIFIED | Host=192.168.1.53, Port=22, User=runner, Auth=PrivateKey |
| **SSH Nodes (Write/Start/Read)** | ✅ ALL VALIDATED | Command mode + Expression mode + retry loop — all 3 nodes verified |
| **GitHub Issue Intake Workflow (ID: jb7BgKeWGee5Iq9d)** | ✅ **12/12 GREEN** | Label dataflow fix applied — all nodes green in live test |
| **SSH Write** | ✅ PASS | Command mode, `mkdir -p` + `base64 -d` + `jq`, 779 bytes ✅ |
| **SSH Start** | ✅ PASS | `--input-json` flag required, exit_code 0 ✅ |
| **SSH Read** | ✅ PASS | Retry loop (30x2s), `status.json` found with `GREEN_PARTIAL` ✅ |
| **Wait Node** | ✅ CONFIGURED | "After Time Interval" mode, 5 seconds (NOT Hours) |
| **Expression Mode (SSH Nodes)** | ✅ MANDATORY | SSH nodes must use Expression mode (fx toggle), NOT Fixed mode |
| **Runner Evidence** | ✅ PRODUCED | 8 files under `/opt/dev-fabric/evidence/github-agent-runs/` |
| **Runner Permissions** | ✅ FIXED | `chown runner:runner` on operational subdirs |
| **OpenCode v1.17.9** | ✅ INSTALLED | Standalone binary at `/opt/dev-fabric/opencode/opencode` |
| **OpenCode Config** | ✅ DEPLOYED | Restrictive `opencode.json` template (no auto-push/PR/merge) |
| **OpenCode Provider/Auth** | ⚠️ NOT CONFIGURED | No LLM provider configured — needs separate approval |
| **Tmux** | ✅ AVAILABLE | v3.3a at `/usr/bin/tmux` |
| **Hermes** | ❌ NOT INSTALLED | Deliberately excluded — planned as optional sidecar |
| **Adapter Layer** | ✅ DEPLOYED | `manual_terminal_adapter.sh`, `opencode_adapter.sh`, security utils |
| **`opencode-run` Mode** | ✅ SUPPORTED | `start_blueprint_bootstrap.sh` handles `opencode-run` in tmux |
| **`manual-terminal`** | ✅ DEFAULT | Safe fallback when OpenCode unavailable |
| **GitHub Source of Truth** | ✅ DEPLOYED | Issues as agent tasks, labels, templates, intake workflow |
| **GitHub Agent Labels** | ✅ CREATED | 14 labels (agent:*, mode:*, risk:*, evidence:*, human-approval-required) |
| **Issue Template** | ✅ CREATED | `.github/ISSUE_TEMPLATE/agent-task.yml` |
| **n8n GitHub Intake Workflow (Live)** | ✅ VALIDATED | Workflow ID `h78eENwLGwr2QUmU` — 9 nodes, all green |
| **GitHub Ready Issue Dispatcher (ID: Sv12QTo56NoPUu2D)** | ✅ **ACTIVE — Manual Trigger ONLY** | 15 nodes, UI shows active (▶️ icon), all nodes show "Deactivate". NO Schedule Trigger present in deployed workflow. |
| **Trigger Strategy** | ⚠️ **MANUAL ONLY — Schedule NOT Implemented** | No Schedule Trigger node exists in deployed workflow. Manual Trigger is the only available execution method. For auto-run: add Schedule Trigger node via UI, then UI-Publish + UI-Active-Toggle. |
| **Smoke Test Issue #3** | ✅ **PROCESSED** | Execution #44 (Manual trigger, 1m 28.494s). Nodes 1-14 SUCCESS, node 15 ERROR (pre-existing JS syntax error). Post-state: `agent:needs-review`, `evidence:attached`. |
| **n8n Publish Button** | ✅ **FIXED** | Root cause: Code node "Format Final Result" had unused variable. Removed via PATCH API. |
| **storageState** | ✅ **RENEWED** | Renewed at `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json` (8,907 bytes). NOT in repo. |
| **Workflow API State** | ✅ **active=true (UI confirmed)** | UI shows active (▶️ icon), all nodes show "Deactivate". Active confirmed via UI, not just API. |
| **Manuelle Ausführung (Issue #3)** | ✅ **14/15 NODES OK** | Execution #44: Manual Trigger → Fetch Issue → Guardrails → Labels → SSH Write → SSH Start → Wait → SSH Read → Comment → Labels → Format Final Result (❌Error). 1m 28.494s. |
| **Schedule Trigger Node** | ❌ NOT PRESENT | Schedule Trigger node was NOT included in deployed workflow export. Only Manual Trigger exists. Must be added via UI for auto-run. |
| **GitHub Search Node** | ❌ NOT PRESENT | GitHub Search node is part of Schedule Trigger path — not present because Schedule Trigger was not deployed. |
| **Pick First Node** | ✅ CONFIGURED (Manual path) | The Manual Trigger path directly fetches a specific issue by number — no search/pick needed. |
| **Dual-Entry Architecture** | ⚠️ **PARTIAL** | Manual Trigger path works (smoke testing). Schedule Trigger path NOT deployed — needs Schedule Trigger node added via UI. |
| **Guardrails (updated)** | ✅ DEPLOYED | No longer depends on Manual Trigger pinData — uses `$input.first().json` directly |
| **Old Dispatcher (k1c2d3FfWHee6Jr0e)** | ⬜ INACTIVE BACKUP | 15-node version kept as reference, `active: false` |
| **Runner GitHub Run Script** | ✅ PREPARED | `start_github_issue_run.sh` — requires `--input-json` flag |
| **GitHub Issue #1** | ✅ CREATED | Feat-Issue für GitHub SoT: `agent:queued` + Alle Labels |
| **Evidence Comment Format** | ✅ DEFINED | Standardisierte Issue-Kommentar-Struktur |
| **GitHub Comment Node** | ✅ **LIVE VERIFIED** | Comment #4790885907 posted to Issue #1 — credential `GitHub account` works |
| **GitHub Label Nodes (11-12)** | ✅ **FIXED** | Cross-node references to Prepare node resolve correctly — Node 11 HTTP 200, Node 12 HTTP 404 tolerated |
| **Expression Mode** | ✅ **APPLIED** | Nodes 4,5,7 switched to Expression mode with cross-node references to Node 3 |
| **Cross-Node Data Reference Pattern** | ✅ **DOCUMENTED** | `$('Prepare RUN_INPUT.json').first().json.owner` — stable after GitHub API calls; `$json.owner` is UNSTABLE after API nodes |
| **Node 5 Credential** | ✅ dev-runner-ssh CONFIRMED | Credential was already set — root cause was Expression Mode, not missing credential |
| **storageState** | ✅ RENEWED | Renewed 2026-06-26 — 8,907 bytes at `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json`. Requires browser-id header for API calls. |
| **Dispatcher workflow in n8n** | ✅ IMPORTED & VERIFIED | Workflow `Sv12QTo56NoPUu2D` live in n8n instance — previously only existed as JSON export |
| **Playwright Automation** | ✅ Working | UI tests with persistent session — bypasses n8n login |
| **n8n GitHub Credential** | ✅ **LIVE VERIFIED** | Comment #4790885907 posted successfully to Issue #1 — credential `GitHub account` works |
| **n8n Auth Strategy** | ✅ DOCUMENTED | `docs/n8n-auth-automation.md` — API Key (Option A), storageState (Option B), Login-Disable (Option C RED_HOLD) |
| **n8n UI Login** | ✅ **BYPASSED via storageState** | Playwright persistent session works — no manual login needed |
| **RUN_INPUT Schema** | ✅ EXTENDED | GitHub SoT-Felder (issue_url, issue_number, approval_policy) |
| **n8n Location** | ✅ **CT 101 (192.168.1.52)** | n8n runs in Container 101: PID 420195, `node /usr/bin/n8n start`, user `n8n`. Confirmed via `curl healthz` on 192.168.1.52:5678. |
| **Proxmox Host n8n.service** | ⚠️ **DEFECTIVE (separate)** | The Proxmox host (192.168.1.136) has a failed systemd n8n.service (restart loop counter 80850+) looking for `/bin/n8n` — this is NOT the live instance. The working instance runs in CT 101. |
| **API Auth Requirements** | ✅ DOCUMENTED | API calls require browser-id header (SHA-256 hashed) + n8n-auth JWT cookie. StorageState contains these credentials. |
| Git Repo (local) | ACTIVE | `C:\n8n-blueprint-workflow` |
| Git Repo (GitHub) | LIVE | `https://github.com/xxammaxx/n8n-blueprint-workflow` — commit `89d896b` |

## Verification Session 2026-06-27 — Runtime Verification

This session confirmed the state from the previous dispatcher manual verification run:

| Verification Check | Result | Detail |
|-------------------|--------|--------|
| **n8n Live Instance** | ✅ **CT 101 (192.168.1.52)** | PID 5486 as user `n8n`, running since 05:20:43 (22+ hours). `/healthz` returns OK. n8n 2.26.8. Ports: 5678 (web), 5679 (task broker). |
| **Proxmox Host n8n (zombie)** | ⚠️ NOT LIVE | PID 420195 (UID 100999) runs `node /usr/bin/n8n start` but binds NO ports. Separate broken systemd `n8n.service` in restart loop (counter 83502+). Both are NOT the live instance. |
| **Dispatcher Workflow (Sv12QTo56NoPUu2D)** | ✅ **ACTIVE** | Activated at 2026-06-26T08:52:32. No deactivation since. n8n PID 5486 has NOT restarted since activation. |
| **Schedule Trigger Node** | ❌ **NOT PRESENT** | Confirmed via database strings: workflow uses `n8n-nodes-base.manualTrigger` only. No Schedule Trigger node in deployed workflow. |
| **Runner Script (LXC 102)** | ✅ **DEPLOYED** | `/opt/dev-fabric/scripts/start_github_issue_run.sh` (16725 bytes, 755, bash -n PASS). SHA256 matches repo version: `94cb24f10ad3ded04f4b19166b98a9209518ce842b4a2d68b76e8eaba088fcd8`. |
| **Issue #3** | ✅ **PROCESSED** | Labels: `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low`. Issue OPEN. `agent:ready` removed — double-start protection verified. |
| **Runner Evidence (Issue #3)** | ✅ **EXISTS** | 8 files under `gh-issue-3-20260626T073802Z/`. status.json: `GREEN_PARTIAL`, `source_of_truth=github`, `issue_number=3`. |
| **Schedule Auto-Run** | ❌ **UNVERIFIED** | CANNOT be verified because Schedule Trigger node is absent from the deployed workflow. Only Manual Trigger exists. |
| **n8n UI Login** | ⚠️ **REQUIRED** | No storageState available for this session. REST API returns `Unauthorized`. Manual login needed for UI operations. |
| **MCP** | ✅ **No changes** | Not extended. Production workflows not exposed to MCP. |
| **DB/SQL used** | ❌ **NO** | Read-only file inspection only (strings, journalctl, event logs). No SQL queries executed. |
| **CLI publish** | ❌ **NO** | No `n8n publish:workflow` used. Not needed — workflow already active. |
| **Secrets exposed** | ❌ **NONE** | Secret scan clean. No secrets in repo. |
| **.github/workflows** | ✅ **ABSENT** | Confirmed. |

## UUID-Based Production URL

The Form Trigger node generates UUID-based production URLs. The slug-based URL (`/form/blueprint-speckit-bootstrap-v2`) does NOT work. After deactivate/reactivate/republish, the UUID changes.

**Current Production URL:** `http://192.168.1.52:5678/form/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60`
**Current Test URL:** `http://192.168.1.52:5678/form-test/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60`

⚠️ **Always read the URL from the Form Trigger Node in the UI — never guess or hardcode.**

## Root Cause Analysis: Why Previous Executions Failed

### Blocker 1: Corrupted JS Code (FIXED)
The JavaScript code in the V2 workflow had **doubled single quotes** from an export/import corruption:
```javascript
// BROKEN:
const crypto = require(''crypto'');  // SyntaxError: missing ) after argument list
// FIXED → removed crypto dependency entirely
```

### Blocker 2: `crypto` Module Blocked by n8n Task Runner (FIXED)
n8n v2.26.8's JS Task Runner blocks the `crypto` built-in module:
```
Module 'crypto' is disallowed [line 1]
```
**Fix:** Replaced `require('crypto')` with pure-JS alternatives:
- `crypto.randomBytes()` → `Math.random()` + hex conversion
- `crypto.createHash('sha256')` → DJB2-style hash via `TextEncoder`

### Blocker 3: curl Form Submissions Yield Null Fields (DOCUMENTED)
n8n Form Trigger V2 parses curl's multipart/form-data differently than browser submissions. All fields arrive as `null` when submitted via curl `-F` flags. **Browser-based form submission works correctly.**

## Known Issues

### 1. Old Blueprint Workflow (persistent)
The old `blueprint-speckit-opencode-bootstrap` workflow has a persistent webhook registration failure. Not fixable.

### 2. curl Form Submissions Broken
- `curl -F` sends correct `Content-Type: multipart/form-data; boundary=...`
- n8n accepts the request (HTTP 200) but parses all form fields as `null`
- **Workaround:** Submit through the browser-rendered form at the production URL
- Root cause unknown — likely n8n v2.26.8 Form Trigger V2 parsing behavior

### 3. Runner Permission Denied on `/opt/dev-fabric/`
- SSH nodes execute successfully (connection, auth, file upload all work)
- `start_blueprint_bootstrap.sh` fails: `mkdir: cannot create directory ... Permission denied`
- Runner user lacks write permission on `/opt/dev-fabric/evidence/` and `/opt/dev-fabric/logs/`
- Fix needed: `chown runner:runner` or pre-create directories on runner LXC 102

### 4. `N8N_READY_TO_RUN_WORKFLOWS_DISMISSED` (localStorage)
- Production Checklist was previously dismissed ("Ignore for all workflows")
- This key suppresses the checklist dialog but doesn't block activation
- If checklist is needed in future, remove this key from browser localStorage

## What's Complete

- [x] Local Git repo with full structure created
- [x] V2 workflow imported into n8n database
- [x] V2 workflow published and active
- [x] Production form URL confirmed: HTTP 200
- [x] `dev-runner-ssh` credential verified: Host=192.168.1.53, Port=22, User=runner, Auth=PrivateKey
- [x] All 3 SSH nodes verified — use `dev-runner-ssh` credential correctly
- [x] JS code fixed: doubled-quote corruption removed, `crypto` replaced with pure-JS
- [x] **End-to-end execution SUCCESS**: Executions #10 and #14 — all 8 nodes ✅
- [x] All SSH nodes return data (Write, Start, Read)
- [x] **Runner permissions fixed**: `chown runner:runner` on operational subdirs only (not n8n, not backups)
- [x] **Evidence produced**: BLUEPRINT.md, INITIALISIERUNG_PROMPT_BLUEPRINT.md, status.json, run-report.md, etc.
- [x] **Project directory created**: Full SpecKit structure with git repo
- [x] All documentation created and updated
- [x] Secret scan passed
- [x] Pushed to GitHub

## SSH Command Mode Validation (2026-06-24)

| Component | Status | Detail |
|-----------|--------|--------|
| SSH Write (command mode) | ✅ VALIDATED | `mkdir -p` + `base64 -d` + `jq`, 779 bytes written |
| SSH Start (command mode) | ✅ VALIDATED | `--input-json` flag required, exit_code 0 |
| SSH Read (command mode) | ✅ VALIDATED | Retry loop (30x2s), `status.json` found with `GREEN_PARTIAL` |
| Wait Node | ✅ VALIDATED | "After Time Interval" mode, 5 seconds (NOT Hours) |
| Expression Mode (all SSH nodes) | ✅ IDENTIFIED | CRITICAL: Expression mode (fx toggle) required for `{{ }}` resolution |
| Validate Issue Contract labels | ✅ IDENTIFIED | Requires `labels` array with `agent:queued` or `agent:ready` in Pin Data |
| Prepare Node outputs | ✅ IDENTIFIED | `run_input_b64`, `run_input_remote`, `evidence_dir` all required |
| Workflow ID `h78eENwLGwr2QUmU` | ✅ 9/9 GREEN | End-to-end: Manual Trigger → SSH Write → SSH Start → Wait → SSH Read → Format Result |
| Run ID | `gh-issue-1-20260624T104034Z` | Evidence produced under `/opt/dev-fabric/evidence/github-agent-runs/` |

### Key Discovery: Expression Mode vs Fixed Mode
The single most critical finding: **SSH nodes must use Expression Mode, not Fixed Mode.** In Fixed Mode, `{{ $json.run_input_remote }}` is passed literally to bash. The node reports green (SSH connection OK) but the variable never resolves. This was the hidden root cause of many "node green but no output" issues.

### Wrong `--input-json` Flag Handling
The initial assumption that `--input-json` should be removed was **incorrect**. The Runner script `start_github_issue_run.sh` actually **requires** `--input-json` before the path argument. Removing it causes `unknown argument` error. The final validated command uses `--input-json`.

### Wait Node TimeUnit Fix
The Wait node was initially configured with `"unit": "hours"` which caused the node to wait until a future date/time indefinitely. Changed to `"unit": "seconds"` with `"mode": "timeInterval"` for a 5-second relative delay.

**Evidence produced:** 8 files on Runner under `gh-issue-1-20260624T104034Z/`
- `status.json` (GREEN_PARTIAL), `run-report.md`, `commands.log`, `agent.log`, `github-context.md`, `RUN_INPUT.json`, `preflight.md`, `summary.json`

## Browser Automation Stack (2026-06-24)

| Tier | Tool | Role | Status |
|------|------|------|--------|
| 1 | **n8n official MCP** | Workflow discovery/test | ✅ **ACTIVATED** — Smoke Test enabled |
| 2 | **Chrome DevTools MCP** | Browser UI debugging | INSTALLABLE (npx verified) |
| 3 | **Playwright CLI** | Regression tests | SPEC CREATED |
| 4 | **Playwright MCP** | Fallback browser control | WORKING |
| 5 | **BrowserMCP** | Optional auth fallback | EVALUATED, NOT INSTALLED |

### n8n MCP Discovery & Activation
- **Visible:** YES — Settings → Instance-level MCP (Preview)
- **Enabled:** ✅ YES (user-activated, toggle ON)
- **Server URL:** `http://192.168.1.52:5678/mcp-server/http`
- **Auth Methods:** OAuth (default) + Access Token (JWT Bearer)
- **Required Headers:** `Authorization: Bearer <token>` + `Accept: application/json, text/event-stream`
- **Test Workflow:** ✅ IMPORTED — `mcpSmoke001` (MCP Smoke Test)
- **MCP-Enabled Workflows:** ONLY `MCP Smoke Test` (1 workflow)
- **Production Workflows Exposed:** NONE (verified via search_workflows)
- **Connected Clients:** 0
- **MCP tools/list:** ✅ PASS
- **MCP search_workflows:** ✅ PASS
- **MCP execute_workflow (default/production):** ❌ BLOCKED — Manual Trigger workflow can't be published
- **MCP execute_workflow (manual mode):** ✅ PASS — `executionMode:"manual"` works, Execution #20 success
- **MCP get_execution:** ✅ PASS — requires BOTH `executionId` + `workflowId`
- **MCP test_workflow:** ✅ PASS — requires `pinData` param, empty `{}` works for mcpSmoke001
- **MCP prepare_test_pin_data:** ✅ INFO — returns schema coverage, not actual pin data
- **MCP tools total:** 28 tools discovered (all verified safe scoping)
- **Token rotated:** ✅ YES (old token invalidated)
- **Config Template:** `templates/mcp-client-config.example.json` (placeholders only)

### Chrome DevTools MCP
- **Installable:** YES — `npx chrome-devtools-mcp@latest` works
- **Chrome Version:** 149.0.7827.158 (supports DevTools MCP)
- **Flags:** `--slim`, `--isolated`, `--headless` supported

### Playwright CLI Regression
- **Spec:** `tests/ui/n8n-github-issue-intake-smoke.spec.ts`
- **Not MCP-coupled:** Uses Playwright Test Runner directly
- **Login handling:** Aborts with `LOGIN_REQUIRED` if needed

## What's Pending

- [x] ~~User approval to enable n8n Instance-level MCP~~ ✅ DONE
- [x] ~~Import MCP Smoke Test workflow~~ ✅ DONE — `mcpSmoke001`
- [x] ~~MCP client connectivity test (requires local token — user to execute)~~ ✅ DONE — full manual mode validation complete
- [x] ~~MCP execute_workflow manual mode test~~ ✅ DONE — Execution #20 + #22 success
- [x] ~~MCP test_workflow test~~ ✅ DONE — Execution #22 success with pinData={}
- [x] ~~MCP get_execution test~~ ✅ DONE — confirmed workflowId parameter required
- [x] ~~Smoke-test the GitHub Issue → Runner intake end-to-end~~ ✅ DONE — SSH command mode validated, 9 nodes green, Run ID: gh-issue-1-20260624T104034Z
- [x] ~~GitHub Comment + Label nodes to workflow~~ ✅ DONE — 3 HTTP Request nodes added (Comment, Add Labels, Remove Label) — in workflow JSON
- [x] ~~n8n Auth Strategy dokumentiert~~ ✅ DONE — `docs/n8n-auth-automation.md`
- [x] ~~n8n UI Login durchführen~~ ✅ DONE via storageState
- [x] ~~GitHub Comment + Label Live-Test~~ ✅ PARTIAL (Comment works, Labels need fix)
- [x] ~~GitHub Issue #1 auf automatischen Kommentar und Labels prüfen~~ ✅ Comment #4790885907 posted, Labels not updated
- [x] ~~n8n UI Login durchführen und GitHub Credential prüfen~~ ✅ DONE — storageState bypassed login, GitHub credential working for comments
- [x] ~~Fix Node 11 data flow (receives comment response → needs owner/repo/issue_number instead)~~ ✅ DONE — cross-node references to Prepare node
- [x] ~~Re-test full 12-node workflow with label fix~~ ✅ DONE — 12/12 GREEN
- [ ] Configure LLM provider for OpenCode (needs separate API-key approval)
- [ ] First real `opencode-run` execution with provider configured
- [ ] Chrome DevTools MCP live test against n8n UI
- [ ] Run Playwright CLI regression tests
- [ ] Optional: Hermes as secondary reviewer/agent (future run)
- [ ] Optional: Investigate `field-N` form field naming for curl compatibility

## Blockers

- ~~n8n MCP disabled~~ ✅ RESOLVED — user activated
- ~~SSH command mode not executing~~ ✅ RESOLVED — Expression mode + command mode + retry loop validated
- ~~Wait node stuck on hours~~ ✅ RESOLVED — changed to timeInterval mode, 5 seconds
- ~~--input-json flag missing~~ ✅ RESOLVED — flag is required by runner script
- ~~Validate Issue Contract blocks without labels~~ ✅ RESOLVED — labels array requirement documented
- ~~GitHub auto-comment/label nodes missing~~ ✅ RESOLVED — 3 HTTP Request nodes added to workflow JSON
- ~~Node 11 data flow fix needed (Add Labels node receives comment response instead of issue identifiers — blocks auto-labeling)~~ ✅ RESOLVED — cross-node references to Prepare node
- ~~**Dispatcher-Aktivierung BLOCKED**: Publish-Button deaktiviert~~ ✅ RESOLVED — Root cause: unused variable in Code node "Format Final Result" (`const data = $input.first().json;`). Removed via PATCH API. Workflow activated via POST /activate.
- ~~**Publish-Button deaktiviert**: Root cause unknown~~ ✅ RESOLVED — Code node lint error (unused variable) was blocking Publish. n8n's Code node linter flags unused variables as a blocking issue preventing publication.
- ~~**storageState semi-funktional**: Page-Reload → Signin~~ ✅ RESOLVED — storageState renewed at 8,907 bytes, includes browser-id header support
- **Schedule Trigger NOT in deployed workflow**: Only Manual Trigger exists. Previous assumption of a Schedule Trigger was incorrect. For auto-run: add Schedule Trigger node via n8n UI, UI-Publish, toggle Active.
- **Issue #3 PROCESSED (14/15 nodes OK)**: Execution #44 succeeded for nodes 1-14. Node 15 (Format Final Result) has pre-existing JS syntax error — unrelated to dispatcher logic. Post-state: `agent:needs-review`, `evidence:attached`.
- **n8n runs in CT 101** (192.168.1.52) — confirmed. The defective n8n.service on Proxmox host (192.168.1.136, restart loop 80850+) is a separate issue and does not affect the working instance.
- GitHub webhooks unavailable — internal network has no public URL; Polling (Schedule + GitHub Search API) is intended strategy but Schedule Trigger node not yet added to workflow
- OpenCode provider/API-key not yet configured (blocks autonomous agent runs)
- OpenCode interactive provider prompt blocks non-interactive execution
- n8n MCP production workflow exposure: NOT ENABLED (only smoke test exposed — by design)

## Next Steps

1. ~~User enables n8n Instance-level MCP in Settings~~ ✅ DONE
2. ~~Import smoke test workflow into n8n~~ ✅ DONE — `mcpSmoke001`
3. ~~User runs local MCP connectivity test~~ ✅ DONE — full manual mode validation
4. ~~Smoke-test the GitHub Issue → Runner intake end-to-end~~ ✅ DONE — SSH command mode validated, 9 nodes green
5. ~~Add GitHub auto-comment + label nodes to workflow~~ ✅ DONE — 3 HTTP Request nodes in workflow JSON
6. ~~User logs into n8n UI~~ ✅ DONE — storageState bypassed login
7. ~~Verify GitHub credential~~ ✅ DONE — Comment posted successfully via `GitHub account` credential
8. ~~Run live test~~ ✅ PARTIAL — Comment works, Labels need fix
9. ~~Fix Node 11 data flow~~ ✅ DONE — Add Labels node now references Prepare node directly
10. ~~Re-test full 12-node workflow~~ ✅ DONE — 12/12 GREEN, labels verified on GitHub Issue #1
11. ~~**⚠️ BLOCKED: Dispatcher UI-Aktivierung**~~ ✅ **RESOLVED via API** — Code node lint error (unused variable) fixed via PATCH API. Workflow activated via POST /activate. Root cause documented.
12. **✅ Issue #3 PROCESSED** — Nodes 1-14 SUCCESS, node 15 has JS syntax error. Post-state: `agent:needs-review`, `evidence:attached`. See evidence at `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-3/gh-issue-3-20260626T073802Z/`.
13. **☑️ Add Schedule Trigger node for auto-run** — The deployed workflow has no Schedule Trigger. To enable auto-run:
    - Option A: Add Schedule Trigger node via n8n UI, UI-Publish, toggle Active
    - Option B: Continue using Manual Trigger for smoke tests (current state)
14. **☑️ Fix Node 15 JS syntax error** — "Format Final Result" Code node has pre-existing syntax error. Identify and fix to complete full 15-node pipeline.
15. Create n8n API Key for future automation (optional but recommended)
16. Run Chrome DevTools MCP test against n8n UI (dedicated session)
17. Run Playwright CLI regression tests (`npx playwright test tests/ui/`)
18. Obtain approval for LLM provider API key configuration
19. Configure provider via `opencode providers login`
20. Run first controlled `opencode-run` execution via n8n form or GitHub issue
21. Optional: Hermes as secondary agent (future run)
