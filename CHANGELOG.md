# CHANGELOG

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
