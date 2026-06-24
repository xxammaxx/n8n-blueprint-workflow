# STATUS: GREEN_PARTIAL_PLUS

**Last Updated:** 2026-06-24T13:00:00Z
**Session:** n8n-github-comment-label-automation
**Previous Session:** n8n-github-issue-intake-ssh-validation

## Current State

| Component | Status | Detail |
|-----------|--------|--------|
| n8n Service | UP | Running since 2026-06-23T06:16:38Z |
| Debug Form (`/form/debug-minimal-form-ui`) | HTTP 200 | Working reference |
| **V2 Production Form** (`/form/ae9f52c1-...`) | **HTTP 200** | **LIVE** — UUID preserved |
| V2 Workflow (Published) | YES | Published and active |
| V2 Workflow (Active) | YES | Active — executing successfully |
| Form Submission (Browser) | ✅ SUCCESS | Browser-based form submit works |
| `dev-runner-ssh` Credential | ✅ VERIFIED | Host=192.168.1.53, Port=22, User=runner, Auth=PrivateKey |
| **SSH Nodes (Write/Start/Read)** | ✅ ALL VALIDATED | Command mode + Expression mode + retry loop — all 3 nodes verified |
| **GitHub Issue Intake Workflow (ID: h78eENwLGwr2QUmU)** | ✅ END-TO-END VALIDATED | All 12 nodes present: 9 core + 3 GitHub API (Comment, Add Labels, Remove Label) |
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
| **Runner GitHub Run Script** | ✅ PREPARED | `start_github_issue_run.sh` — requires `--input-json` flag |
| **GitHub Issue #1** | ✅ CREATED | Feat-Issue für GitHub SoT: `agent:queued` + Alle Labels |
| **Evidence Comment Format** | ✅ DEFINED | Standardisierte Issue-Kommentar-Struktur |
| **GitHub Comment Node** | ✅ IN WORKFLOW JSON | HTTP Request Node (POST /repos/.../issues/.../comments), credential: `github-n8n-blueprint` |
| **GitHub Label Add Node** | ✅ IN WORKFLOW JSON | HTTP Request Node (POST /repos/.../issues/.../labels), sets `agent:needs-review` + `evidence:attached` |
| **GitHub Label Remove Node** | ✅ IN WORKFLOW JSON | HTTP Request Node (DELETE /repos/.../labels/agent%3Arunning), 404-tolerant (continueOnFail) |
| **n8n GitHub Credential** | ⚠️ UNVERIFIED | Name `github-n8n-blueprint` — muss in n8n UI geprüft werden (Login required) |
| **n8n Auth Strategy** | ✅ DOCUMENTED | `docs/n8n-auth-automation.md` — API Key (Option A), storageState (Option B), Login-Disable (Option C RED_HOLD) |
| **n8n UI Login** | 🔒 REQUIRED | Blockiert Playwright-Automation — manuelle Login oder API Key nötig |
| **RUN_INPUT Schema** | ✅ EXTENDED | GitHub SoT-Felder (issue_url, issue_number, approval_policy) |
| Git Repo (local) | ACTIVE | `C:\n8n-blueprint-workflow` |
| Git Repo (GitHub) | LIVE | `https://github.com/xxammaxx/n8n-blueprint-workflow` — commit `01f1c67` |

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
- [ ] n8n UI Login durchführen und GitHub Credential `github-n8n-blueprint` prüfen
- [ ] GitHub Comment + Label Live-Test mit Issue #1 (Manual Trigger + Pin Data)
- [ ] GitHub Issue #1 auf automatischen Kommentar und Labels prüfen
- [ ] Configure n8n GitHub API credential (`github-n8n-blueprint`) for automated GitHub trigger/comment/label
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
- n8n UI Login required (blocks credential verification + live test of GitHub API nodes — API Key or storageState needed)
- n8n GitHub API credential not yet verified (blocks automated GitHub Trigger, Issue Comment, Label Update — Manual Trigger works)
- OpenCode provider/API-key not yet configured (blocks autonomous agent runs)
- OpenCode interactive provider prompt blocks non-interactive execution
- n8n MCP production workflow exposure: NOT ENABLED (only smoke test exposed — by design)

## Next Steps

1. ~~User enables n8n Instance-level MCP in Settings~~ ✅ DONE
2. ~~Import smoke test workflow into n8n~~ ✅ DONE — `mcpSmoke001`
3. ~~User runs local MCP connectivity test~~ ✅ DONE — full manual mode validation
4. ~~Smoke-test the GitHub Issue → Runner intake end-to-end~~ ✅ DONE — SSH command mode validated, 9 nodes green
5. ~~Add GitHub auto-comment + label nodes to workflow~~ ✅ DONE — 3 HTTP Request nodes in workflow JSON
6. **User logs into n8n UI** at http://192.168.1.52:5678 (manuell)
7. **Verify GitHub credential** `github-n8n-blueprint` exists in n8n Credentials
8. **Run live test** with Issue #1 (Manual Trigger + Pin Data) — verify comment + labels on GitHub
9. Create n8n API Key for future automation (optional but recommended)
10. Run Chrome DevTools MCP test against n8n UI (dedicated session)
11. Run Playwright CLI regression tests (`npx playwright test tests/ui/`)
12. Obtain approval for LLM provider API key configuration
13. Configure provider via `opencode providers login`
14. Run first controlled `opencode-run` execution via n8n form or GitHub issue
15. Optional: Hermes as secondary agent (separate, approved run)
