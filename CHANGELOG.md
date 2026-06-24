# CHANGELOG

## 2026-06-24 — n8n MCP Manual Execution Mode Validated

### Completed
- **MCP execute_workflow (manual mode):** ✅ PASS — `executionMode:"manual"` successfully executes `mcpSmoke001` even though workflow is not published. Execution #20: `status:success` (106ms).
- **MCP get_execution:** ✅ PASS — confirmed requires BOTH `executionId` + `workflowId` parameters.
- **MCP test_workflow:** ✅ PASS — works with `pinData: {}` (empty object). Execution #22: `status:success` (11ms).
- **MCP prepare_test_pin_data:** ✅ PASS — returns schema coverage info, not actual pin data values.
- **28 MCP tools** discovered via `tools/list` — all tools confirmed available.
- **Security scoping re-verified:** Only `mcpSmoke001` exposed via MCP. All 5 other workflows remain `availableInMCP: false`.
- **Token security:** Token rotated after test (old token invalidated). Token appeared in chat during test setup (documented), never in files/logs/repo/evidence.

### Key Findings
- `execute_workflow` with `executionMode:"manual"` bypasses the publish requirement — major breakthrough vs. previous session where default `production` mode was blocked.
- `get_execution` requires `workflowId` in addition to `executionId` (undocumented n8n requirement).
- `test_workflow` requires `pinData` parameter (even if empty `{}`).
- `prepare_test_pin_data` does NOT return actual pin data — it returns schema coverage analysis.
- n8n MCP is fully functional for smoke testing with correct mode and parameters.

### What This Enables
- MCP-based workflow execution testing from any MCP client (Claude Code, Cursor, etc.)
- Automated smoke tests via MCP without needing webhook triggers
- Production-safe testing: only dedicated test workflow exposed

### Documentation Updated:
- `STATUS.md`, `CHANGELOG.md`, `evidence-index/latest.md`
- `docs/n8n-mcp-integration.md` — updated execute_workflow section with manual mode
- `docs/troubleshooting.md` — updated execute_workflow diagnosis with manual mode solution

### Status
**GREEN_PARTIAL_PLUS** — MCP fully validated: tools/list, search_workflows, execute_workflow (manual), get_execution, test_workflow all PASS. Production workflows remain locked. Token rotated.

## 2026-06-24 — n8n MCP Client Smoke Test

### Completed
- **MCP tools/list:** ✅ PASS — JWT Bearer auth accepted with proper headers
- **MCP search_workflows:** ✅ PASS — `mcpSmoke001` found; only workflow with `availableInMCP: true`
- **Security verification:** 5 other workflows confirmed `availableInMCP: false`
- **MCP execute_workflow:** ⚠️ BLOCKED — n8n requires workflow to be published; Manual Trigger workflows cannot be published. Workaround: use Webhook trigger node.
- **Auth header discovery:** MCP server requires `Accept: application/json, text/event-stream` header (SSE support). Without it: HTTP 406 "Not Acceptable".
- **Token security:** Token rotated after test (old token invalidated)
- **MCP Client Config Template updated** with correct headers

### Key Findings
- n8n MCP uses JWT Bearer tokens (not opaque tokens)
- `aud: "mcp-server-api"` claim — tokens are MCP-specific, not valid for REST API
- `Accept` header must include `text/event-stream` for SSE protocol
- `execute_workflow` requires published workflows with active triggers
- Manual Trigger is not publishable → use Webhook trigger for MCP-executable smoke tests

### Documentation Updated:
- `STATUS.md`, `CHANGELOG.md`, `evidence-index/latest.md`
- `docs/n8n-mcp-integration.md` — added header requirements + execute limitation
- `docs/troubleshooting.md` — added MCP 406/401 diagnosis
- `templates/mcp-client-config.example.json` — added Accept header note

### Status
**GREEN_PARTIAL_PLUS** — MCP auth, discovery, and security scoping fully validated. execute_workflow blocked by n8n trigger type limitation (documented with workaround). Token rotated.

## 2026-06-24 — n8n MCP Activated & Smoke Test Imported

### Completed
- **n8n Instance-level MCP activated:**
  - User enabled MCP in Settings → Instance-level MCP
  - Server running at `http://192.168.1.52:5678/mcp-server/http`
  - Two auth methods available: OAuth (default) + Access Token (Bearer)
  - Token partially masked in UI (`******bz5Q`), never extracted or logged
- **MCP Smoke Test workflow imported:**
  - Imported via `n8n import:workflow --projectId=fLfBCnB9rifW9Cu2`
  - Workflow ID: `mcpSmoke001`, name: "MCP Smoke Test"
  - Returns only static metadata: `{ok, system, runner_expected, no_secrets}`
  - No credentials, no SSH, no GitHub API access
- **MCP workflow scoping verified:**
  - ONLY "MCP Smoke Test" enabled for MCP (1 workflow)
  - ZERO production workflows exposed (Blueprint, GitHub Issue Intake, etc.)
  - Connected clients: 0 (no external MCP client has connected)
- **All security boundaries intact:**
  - Token never read, extracted, logged, or stored
  - No production workflows inadvertently exposed
  - `.github/workflows` confirmed absent
  - Access Token tab confirmed to exist (masked display)

### Documentation Updated:
- `STATUS.md` — MCP status: DISABLED → ACTIVATED, workflow imported
- `CHANGELOG.md` — this entry
- `evidence-index/latest.md` — updated with verification results
- `workflows/mcp-smoke-test-v4.import.json` — final import format

### Status
**GREEN_PARTIAL_PLUS** — n8n MCP aktiviert, Smoke Test importiert und als einziger Workflow für MCP freigegeben. Keine Produktivworkflows exponiert. MCP-Client-Konnektivitätstest wartet auf lokalen Token-Test durch den Nutzer.

## 2026-06-24 — Browser Automation Strategy (Tiered MCP Stack)

### Completed
- **n8n official MCP Discovery:**
  - Instance-level MCP found in n8n v2.26.8 Settings UI (Preview feature)
  - Currently DISABLED — toggle off, no tokens exposed
  - Enable button available, not clicked (requires user approval)
- **Chrome DevTools MCP verified installable:**
  - `npx chrome-devtools-mcp@latest` succeeds on Windows host
  - Chrome 149.0.7827.158 supports DevTools MCP protocol
  - All required flags documented: `--slim`, `--isolated`, `--headless`
- **Playwright CLI Regression test spec created:**
  - `tests/ui/n8n-github-issue-intake-smoke.spec.ts`
  - Tests: workflow navigation, node verification, secret pattern scan
  - Not MCP-coupled — uses Playwright Test Runner directly
  - `LOGIN_REQUIRED` abort pattern for gated environments
- **MCP Smoke Test workflow prepared:**
  - `workflows/mcp-smoke-test.export.json` — safe for MCP client testing
  - No credentials, no SSH, no GitHub API access
  - Returns only static metadata (`ok`, `system`, `no_secrets`)
- **BrowserMCP evaluated (not installed):**
  - Extension-based browser automation with auth session support
  - Risk: full profile access. Recommendation: optional fallback only
- **Documentation created/updated:**
  - `docs/browser-automation-strategy.md` — Tiered stack architecture
  - `docs/n8n-mcp-integration.md` — MCP discovery, config, security
  - `templates/mcp-client-config.example.json` — Multi-server config
  - `STATUS.md`, `CHANGELOG.md`, `evidence-index/latest.md` updated

### Tiered Automation Architecture:
```
Tier 1: n8n official MCP → Workflow ops (DISABLED, ready)
Tier 2: Chrome DevTools MCP → UI debugging (INSTALLABLE)
Tier 3: Playwright CLI → Regression (SPEC CREATED)
Tier 4: Playwright MCP → Fallback (WORKING)
Tier 5: BrowserMCP → Optional fallback (EVALUATED)
```

### Security:
- No MCP tokens stored in repo (placeholders only)
- No browser profiles copied
- No credentials exposed in test specs or workflow JSON
- `.github/workflows` confirmed absent
- `.gitignore` blocks all sensitive patterns

### Status
**GREEN_PARTIAL** — Tiered browser automation architecture defined and documented. n8n MCP discovered (disabled, awaiting user approval). All artifacts prepared for activation.

## 2026-06-24 — SSH Node Mode Fix (GitHub Issue Intake Repair)

### Root Cause Identified
- **SSH Start Runner Script** and **SSH Read status.json** nodes had NO `"mode"` parameter set
- Without `mode: command`, n8n SSH node defaults to SFTP/create and doesn't execute bash commands
- Nodes reported green (SFTP connection OK) but no command executed on runner → no evidence produced

### Fix Applied (Export File)
- Added `"mode": "command"` to SSH Start Runner Script node
- Added `"mode": "command"` to SSH Read status.json node
- Removed unsupported `--input-json` flag from SSH Start command
- SSH Write node was already correctly configured (mode=command, mkdir -p, base64 -d, jq validation)
- Prepare RUN_INPUT.json confirmed: produces `run_input_b64` via Buffer.from().toString('base64')
- BOM stripped from workflow JSON (Windows UTF-8 encoding artifact)

### Documentation Updated
- STATUS.md: added SSH Node Mode Fix section
- CHANGELOG.md: this entry
- docs/troubleshooting.md: added "SSH Node reports green but command doesn't execute" section

### Validation Pending
- Workflow export: JSON valid ✅ (all 9 nodes, clean JSON)
- Secret scan: pending
- Smoke tests: pending
- N8n UI live verification: BLOCKED (n8n sign-in required)
- Runner evidence check: BLOCKED (no SSH from Windows host)

### Status
**GREEN_PARTIAL** — Export file repaired. Awaiting n8n login for live UI verification + test run.

## 2026-06-23 — GitHub Source of Truth Intake

### Completed
- **GitHub als Source of Truth** für n8n/Runner-Agentenläufe eingeführt:
  - GitHub Issue = Auftrag (Source of Truth)
  - n8n = Orchestrator / Router / Status-Synchronizer
  - Runner = Execution Boundary
  - Issue Comments = Evidence-Zusammenfassung
- **14 Agent-Labels** im Repo angelegt:
  - `agent:queued`, `agent:ready`, `agent:running`, `agent:blocked`, `agent:needs-review`, `agent:done`
  - `evidence:attached`, `human-approval-required`
  - `mode:manual-terminal`, `mode:opencode-run`, `mode:hermes-review`
  - `risk:low`, `risk:medium`, `risk:high`
- **Issue Template** erstellt: `.github/ISSUE_TEMPLATE/agent-task.yml`
  - Pflichtfelder: Aufgabe, Kontext, Akzeptanzkriterien, Verification Contract
  - Label-Vorgaben: `agent:queued`, `mode:manual-terminal`, `human-approval-required`
  - Approval-Checkboxen: Push, PR, Merge, GitHub Actions, Provider-Konfiguration
- **Dokumentation** erstellt:
  - `docs/github-source-of-truth.md` — Architektur, Regeln, Labelmodell, Contracts
  - `docs/github-issue-intake-runbook.md` — Normalbetrieb + 9 Recovery-Szenarien
  - `docs/run-input-schema.md` — Vollständiges RUN_INPUT-Schema mit GitHub SoT
- **Runner-Script** erstellt: `scripts/start_github_issue_run.sh`
  - Validiert `source_of_truth=github`
  - Erzeugt Evidence unter `/opt/dev-fabric/evidence/github-agent-runs/<owner>/<repo>/issue-<number>/<run_id>/`
  - Schreibt: status.json, run-report.md, commands.log, agent.log, github-context.md
  - Blockiert `mode=opencode-run` wenn Provider nicht konfiguriert (fällt auf manual-terminal zurück)
- **n8n Workflow** erstellt: `workflows/github-issue-intake.export.json`
  - 9 Nodes: Manual Trigger → Validate → Prepare RUN_INPUT → SSH Write → SSH Start → Wait → SSH Read → Format Comment → Format Result
  - Manual Trigger Fallback (kein GitHub Trigger bis Credential konfiguriert)
  - Evidence Comment Format standardisiert
- **RUN_INPUT Schema** um GitHub SoT-Felder erweitert
  - `source_of_truth: "github"`
  - `github.issue_url`, `github.issue_number`, `github.trigger_label`
  - `approval_policy` Block (push, pr, merge, github_actions, provider_config)
- **GitHub Issue #1** erstellt: `feat: GitHub als Source of Truth für n8n/Runner-Agentenläufe einführen`
  - Labels: `agent:queued`, `mode:manual-terminal`, `risk:medium`, `human-approval-required`, `enhancement`
- **Dokumentation aktualisiert:** README.md, STATUS.md, CHANGELOG.md

### Key Findings
- GitHub Labels lassen sich via `gh label create --force` idempotent verwalten
- Agent-Aufträge können vollständig über GitHub Issues + Labels gesteuert werden
- n8n GitHub API Credential benötigt nur `repo` + `read:org` Scopes (kein workflow, admin, secrets)
- `mode=manual-terminal` bleibt sicherer Default — kein Provider/API-Key nötig
- OpenCode v1.17.9 ist als Runtime erkannt, aber ohne Provider/Auth nicht autonom

### Status
**GREEN_PARTIAL** — GitHub Source-of-Truth-Infrastruktur ist vollständig aufgebaut. n8n GitHub Credential und OpenCode Provider/Auth fehlen noch (benötigen separate Approval).

## 2026-06-23 — OpenCode Runner Integration (Controlled)

### Completed
- **OpenCode v1.17.9 installed** on Runner (LXC 102):
  - Standalone binary from GitHub Releases (`anomalyco/opencode`)
  - Installed at `/opt/dev-fabric/opencode/opencode` (159 MB)
  - Symlinked to `/usr/local/bin/opencode`
  - No Node.js required (native binary)
- **Tmux v3.3a confirmed** available at `/usr/bin/tmux`
- **Restrictive `opencode.json` template** created:
  - Located at `/opt/dev-fabric/workflows/templates/opencode.json`
  - Default: ask for all operations
  - Blocked: git push, gh pr create, gh workflow run, rm -rf, docker
  - No auto-push, no auto-PR, no auto-merge
  - Copied into every new project directory
- **`start_blueprint_bootstrap.sh` enhanced** (503 lines):
  - OpenCode availability and version recorded in evidence
  - `opencode-run` mode starts OpenCode in tmux session
  - Graceful fallback to `manual-terminal` when OpenCode/tmux missing
  - Tmux session name, attach/stop/log commands written to evidence
- **Adapter Layer deployed** at `/opt/dev-fabric/agent-adapters/`:
  - `manual_terminal_adapter.sh` — safe default (no agent)
  - `opencode_adapter.sh` — controlled OpenCode in tmux
  - `hermes_reviewer_adapter.sh.disabled` — placeholder (not executable)
  - `common/` — validation, evidence writing, security guard utilities
- **Smoke Test project created** at `/opt/dev-fabric/workspaces/projects/opencode-smoke-test/`
- **OpenCode verified:** `--version` → 1.17.9, `--help` → all commands listed
- **Hermes deliberately NOT installed** (planned as optional future sidecar)
- **Provider/Auth status documented:** No LLM provider configured yet

### Key Findings
- `opencode.ai` install script URL not reachable from Runner → used GitHub Releases direct download
- OpenCode binary is fully self-contained (no Node.js, no npm needed)
- OpenCode cannot run autonomously without a configured LLM provider
- Interactive provider prompt blocks non-interactive execution (expected, secure)

### Status
**GREEN_PARTIAL** — OpenCode installed and configured, but LLM provider/API-key needs separate approval.

## 2026-06-23 — Runner Permission Fix & Full Evidence Production

### Completed
- **Runner permissions fixed:** Operational subdirectories now owned by `runner:runner`:
  - `/opt/dev-fabric/workspaces/projects` (750)
  - `/opt/dev-fabric/evidence/blueprint-bootstrap` (750)
  - `/opt/dev-fabric/logs/blueprint-bootstrap` (750)
- **NOT changed:** `/opt/dev-fabric/n8n`, spec-kit-src, scripts, backups, system dirs
- Write test as `runner` user: all 3 paths PASS ✅
- Browser form submit: "Your response has been recorded" ✅
- **Execution #14: SUCCESS** — all 8 nodes green ✅
- **Evidence produced:** status.json (GREEN_PARTIAL), run-report.md, agent.log, commands.log, preflight.md, RUN_INPUT.json, etc.
- **Project directory created:** `perm-fix-test/` with full SpecKit structure, git repo, BLUEPRINT.md, INITIALISIERUNG_PROMPT_BLUEPRINT.md

### Key Findings
- Root cause was `root:root` ownership on subdirectories while parent was `runner:runner`
- Browser form submission uses `field-N` HTML names (mapped server-side by n8n)
- `curl`/`.NET` multipart with `field-N` names doesn't fully work — browser required

### Status
**GREEN_PARTIAL** — Only blocker is OpenCode/Hermes installation on runner.

## 2026-06-23 — SSH Credential Verification & JS Code Fix (End-to-End Success)

### Completed
- `dev-runner-ssh` credential verified in n8n UI: Host=192.168.1.53, Port=22, User=runner, Auth=Private Key ✅
- Connection test: "Connection tested successfully" ✅
- All 3 SSH nodes confirmed using correct credential (ID: 42a60f05-...)
- **Root cause of prior failures identified and fixed:**
  1. **JS Code Corruption:** Doubled single quotes (`''crypto''`) caused SyntaxError — FIXED
  2. **`crypto` Module Blocked:** n8n task runner disallows `require('crypto')` — replaced with pure-JS alternatives
  3. **curl Form Parsing Bug:** n8n v2.26.8 parses curl multipart fields as null — documented, browser submission works
- **End-to-End Execution SUCCESS:** Execution #10 completed with all 8 nodes passing
- SSH Write: 25s ✅ | SSH Start: 25s ✅ | SSH Read: 25s ✅

### Key Findings
- `dev-runner-ssh` credential was always correct — the blockers were JS code corruption and `crypto` module restriction
- n8n Form Trigger V2 requires browser-based submission; curl `-F` sends correct headers but fields arrive null
- The `crypto` module is blocked in n8n v2.26.8's JS Task Runner — pure-JS alternatives needed
- **Workflow is end-to-end functional** — remaining blocker is runner directory permissions

### Remaining Issue
- Runner `mkdir` fails with "Permission denied" on `/opt/dev-fabric/` — needs `chown` fix on LXC 102

## 2026-06-23 — V2 Activation & UI Form Test

### Completed
- V2 workflow activated via n8n UI (Playwright automation — session was still valid, no login needed)
- Form Trigger node deactivated → reactivated → republished successfully
- Production form URL confirmed: HTTP 200 at UUID-based URL
- Form submission tested: HTTP 200 with multipart/form-data
- Form fields verified: 11 fields loading correctly

### Key Findings
- **Form URLs are UUID-based**, not slug-based. UUID: `ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60`
- **Slug URL never worked** (`/form/blueprint-speckit-bootstrap-v2` → 404)
- **UUID changes on deactivate/reactivate** — must always read from Form Trigger Node
- **Form requires `multipart/form-data`** — `application/x-www-form-urlencoded` rejected
- **`N8N_READY_TO_RUN_WORKFLOWS_DISMISSED`** in localStorage suppresses Production Checklist
- **Container 101 → 102 SSH** uses `dev-runner-ssh` credential; TCP reachable at `192.168.1.53:22`

### Known Issue
- Runner evidence not yet produced — SSH execution may need credential host reconfiguration
- `dev-runner-ssh` credential host verification needed in n8n UI

## 2026-06-22 — V2 Reconstruction Initiated

### Added
- New local Git repo as source of truth for the workflow
- Full repo structure with workflows, scripts, docs, templates, tests
- Exported all 3 n8n workflows (2 published, 1 inactive)
- Extracted debug-minimal-form-ui as working reference
- Saved old broken blueprint as historical reference

### Status
- Debug form working: HTTP 200
- Old blueprint form: HTTP 404 (webhook path not found)
- V2 workflow: pending creation

### Known Issue
- The `blueprint-speckit-opencode-bootstrap` workflow has a webhook registration failure
- `workflow_published_version` stuck at 0 despite successful publish actions
- Root cause: workflow-specific inconsistent publish/runtime state

## 2026-06-21 — Republish & Rematerialize Attempt

### Attempted
- Unpublish and republish of the broken workflow
- n8n service restart
- Verified publish mechanism is functional (other workflows publish fine)

### Result
- `webhook_entity` count increased from 0 to 2
- `n8n export:workflow --all --published` returns 2 workflows
- Debug form remains functional
- Old blueprint form remains broken (HTTP 404)

### Evidence
- `/opt/dev-fabric/evidence/n8n-blueprint-workflow/republish-rematerialize-20260621T180626Z/`
- `/opt/dev-fabric/n8n/backups/republish-rematerialize-20260621T180701Z/`
