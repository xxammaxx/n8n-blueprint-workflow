# STATUS: GREEN_PARTIAL_PLUS

**Last Updated:** 2026-06-24T13:00:00Z
**Session:** n8n-mcp-activated-and-verified
**Previous Session:** browser-automation-strategy

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
| **SSH Nodes (Write/Start/Read)** | ✅ ALL SUCCESS | All 3 SSH nodes execute and return data |
| **End-to-End Execution** | ✅ SUCCESS | Executions #10 and #14: all 8 nodes ✅ |
| **Runner Permissions** | ✅ FIXED | `chown runner:runner` on operational subdirs |
| **Runner Evidence** | ✅ PRODUCED | Full evidence chain operational |
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
| **n8n GitHub Intake Workflow** | ✅ PREPARED | `github-issue-intake.export.json` (Manual Trigger Fallback) |
| **Runner GitHub Run Script** | ✅ PREPARED | `start_github_issue_run.sh` validiert source_of_truth=github |
| **GitHub Issue #1** | ✅ CREATED | Feat-Issue für GitHub SoT: `agent:queued` + Alle Labels |
| **Evidence Comment Format** | ✅ DEFINED | Standardisierte Issue-Kommentar-Struktur |
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

## SSH Node Mode Fix (2026-06-24)

| Issue | Root Cause | Fix Applied |
|---|---|---|
| SSH Start & Read nodes not executing commands | Missing `"mode": "command"` parameter in exported workflow JSON | Added `"mode": "command"` to both nodes |
| SSH Start using `--input-json` flag | Flag not supported by runner script | Removed `--input-json`, script takes positional arg |
| SSH Write not creating parent dirs | SFTP mode doesn't create parent directories | Already in command mode with `mkdir -p` + `base64 -d` |

**Export file patched:** `workflows/github-issue-intake.export.json`
- SSH Start: mode=command, command simplified
- SSH Read: mode=command, retry loop preserved

**Verification pending:** n8n live database must be checked via Playwright (n8n login required).
**Runner evidence check pending:** No SSH access from Windows host to LXC 102.

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
- **Auth Methods:** OAuth (default) + Access Token (Bearer)
- **Test Workflow:** ✅ IMPORTED — `mcpSmoke001` (MCP Smoke Test)
- **MCP-Enabled Workflows:** ONLY `MCP Smoke Test` (1 workflow)
- **Production Workflows Exposed:** NONE (verified)
- **Connected Clients:** 0
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
- [ ] MCP client connectivity test (requires local token — user to execute)
- [ ] Configure n8n GitHub API credential (`github-n8n-blueprint`) for automated trigger
- [ ] Configure LLM provider for OpenCode (needs separate API-key approval)
- [ ] First real `opencode-run` execution with provider configured
- [ ] Smoke-test the GitHub Issue → Runner intake end-to-end
- [ ] Chrome DevTools MCP live test against n8n UI
- [ ] Run Playwright CLI regression tests
- [ ] Optional: Hermes as secondary reviewer/agent (future run)
- [ ] Optional: Investigate `field-N` form field naming for curl compatibility

## Blockers

- ~~n8n MCP disabled~~ ✅ RESOLVED — user activated
- MCP client connectivity test pending (user's local token test)
- n8n GitHub API credential not yet configured (blocks automated GitHub Trigger — Manual Trigger works)
- OpenCode provider/API-key not yet configured (blocks autonomous agent runs)
- OpenCode interactive provider prompt blocks non-interactive execution

## Next Steps

1. ~~User enables n8n Instance-level MCP in Settings~~ ✅ DONE
2. ~~Import smoke test workflow into n8n~~ ✅ DONE — `mcpSmoke001`
3. User runs local MCP connectivity test (command provided below)
4. Configure n8n GitHub API credential for automated Issue→Runner trigger
3. Run Chrome DevTools MCP test against n8n UI (dedicated session)
4. Run Playwright CLI regression tests (`npx playwright test tests/ui/`)
5. Obtain approval for LLM provider API key configuration
6. Configure provider via `opencode providers login`
7. Run first controlled `opencode-run` execution via n8n form or GitHub issue
8. Optional: Hermes as secondary agent (separate, approved run)
