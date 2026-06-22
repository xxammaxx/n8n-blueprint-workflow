# Evidence Report — blueprint-clean-reconstruct-20260622T152000Z

## Status: GREEN_PARTIAL

**Session ID:** blueprint-clean-reconstruct-v2
**Completed:** 2026-06-22T15:20:00Z
**Orchestrator:** issue-orchestrator (opencode)

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Created | Yes |
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote branch | `main` |
| Commit hash | `9e41bba36937861cade47da49b332e5cb0755ce2` |
| Files committed | 30 |
| Push status | Success (remote was empty, no force-push) |
| Remote verified | `gh repo view` confirms repo exists with `main` branch |

## 2. Remote Connection Used

| Field | Value |
|-------|-------|
| Remote infrastructure access | Yes (SSH to Proxmox 192.168.1.136) |
| Browser automation attempted | Yes (delegated to playwright-agent) |
| Browser automation result | LOGIN_REQUIRED — n8n redirects to /signin |
| Manual login needed | Yes (n8n UI authentication required) |

## 3. Old Blueprint Workflow (Why Not Repaired)

| Field | Value |
|-------|-------|
| Workflow ID | `blueprint-speckit-opencode-bootstrap` |
| Form path | `blueprint-speckit-bootstrap` |
| Published version | 0 (stuck) |
| n8n log error | "No webhook path could be found" (repeats 4x per restart) |
| Diagnosis | Workflow-specific inconsistent publish/runtime state |
| Decision | Reconstruct as clean V2 rather than repair broken V1 |

## 4. New V2 Workflow

| Field | Value |
|-------|-------|
| Name | `Blueprint -> SpecKit/OpenCode Bootstrap V2` |
| Workflow ID | `blueprint-speckit-bootstrap-v2` |
| Form path | `blueprint-speckit-bootstrap-v2` |
| Nodes | 8 (Form Trigger + Validate + Prepare RUN_INPUT + 3 SSH + Wait + Format Result) |
| Form fields | 11 (all configured, defaults updated) |
| In n8n DB | Yes (imported via `n8n import:workflow`) |
| Active | False (needs UI publish) |
| Form loading | HTTP 404 (expected — not published) |
| CLI publish attempt | Failed — n8n 2.26.8 CLI cannot publish imported workflows |
| SSH credential | Linked via `dev-runner-ssh` (ID `42a60f05-16eb-493f-8257-3eeb5aef531a`) |

## 5. V2 Workflow Changes from V1

| Change | Old V1 | New V2 |
|--------|--------|--------|
| Form path | `blueprint-speckit-bootstrap` | `blueprint-speckit-bootstrap-v2` |
| Default llm_command_mode | `opencode-run` | `manual-terminal` |
| Default max_runtime_minutes | `60` | `30` |
| Field labels | German (original) | Updated per spec |
| Workflow ID | `blueprint-speckit-opencode-bootstrap` | `blueprint-speckit-bootstrap-v2` |
| All other nodes | Same | Same (credentials, connections preserved) |

## 6. Backup

| Field | Value |
|-------|-------|
| Pre-reconstruction backup | `/opt/dev-fabric/n8n/backups/pre-v2-20260622/database.sqlite` (1.6 MB) |
| Previous session backup | `/opt/dev-fabric/n8n/backups/republish-rematerialize-20260621T180701Z/` |

## 7. Workflow JSONs in Repo

| File | Source | Size | Status |
|------|--------|------|--------|
| `blueprint-v2.clean.export.json` | Generated from V1 | 24.9 KB | Ready to import |
| `blueprint-old-broken.export.json` | Runner copy | 24.9 KB | Historical reference |
| `debug-minimal-form-ui.export.json` | n8n export (extracted) | 2.2 KB | Working reference |
| `speckit-smoke-workflow.json` | Runner copy | 4.6 KB | Smoke test |
| `all-workflows-export.json` | n8n export (before) | 25.2 KB | Pre-import snapshot |
| `all-after-import.json` | n8n export (after) | 47.3 KB | Post-import snapshot |
| `published-workflows-export.json` | n8n export | 23.5 KB | Published only |

## 8. Scripts in Repo

| File | Lines | Source |
|------|-------|--------|
| `start_blueprint_bootstrap.sh` | ~500 | Runner copy |
| `speckit_iteration.sh` | ~100 | Runner copy |
| `export_n8n_workflows.sh` | ~30 | Newly created |
| `publish_check.sh` | ~30 | Newly created |
| `validate_repo.sh` | ~50 | Newly created |

## 9. Documentation Created

| File | Purpose |
|------|---------|
| `README.md` | Repo overview, quick start |
| `STATUS.md` | Current operational status |
| `CHANGELOG.md` | Version history |
| `SECURITY.md` | Security rules |
| `docs/architecture.md` | System architecture |
| `docs/security-boundaries.md` | Trust zones, credential flow |
| `docs/ui-reconstruction-runbook.md` | Step-by-step V2 build guide |
| `docs/troubleshooting.md` | Common issues and fixes |
| `docs/evidence-index.md` | Evidence path index |
| `docs/import-publish-guide.md` | Workflow import guide |
| `evidence-index/latest.md` | This report |
| `evidence-index/known-evidence-paths.md` | Previous session evidence |
| `workflows/README.md` | Workflow directory guide |

## 10. Validation Results

| Check | Result |
|-------|--------|
| Secret scan (grep for keys/tokens/passwords) | PASS (only self-referential grep pattern) |
| Forbidden files (.sqlite, .env, .pem, .key) | PASS (none found) |
| JSON validation (all 7 workflow files) | PASS (all valid) |
| .gitignore critical patterns | PASS (all required patterns present) |
| No .github/workflows directory | PASS |
| Git working tree | CLEAN |
| Remote verified empty before push | PASS (0 branches) |
| Push to GitHub | SUCCESS (main → origin/main) |

## 11. What the System Can Do Now vs. Before This Session

| Capability | Before | Now |
|------------|--------|-----|
| Workflow source control | None | Git repo with 30 files |
| V2 workflow existence | None | Complete JSON, imported to n8n DB |
| Workflow documentation | Scattered | 13 documents centralized |
| Evidence trail | On runner only | In repo + evidence-index/ |
| Validation tooling | None | JSON, shell, smoke test scripts |
| Export history | Single point | Before/after import snapshots |
| Rollback capability | Limited | Old workflow archived, backup paths documented |
| GitHub repository | Empty | Live at github.com/xxammaxx/n8n-blueprint-workflow |

## 12. Security Status

| Check | Status |
|-------|--------|
| No private keys in repo | VERIFIED |
| No .env files in repo | VERIFIED |
| No database files in repo | VERIFIED |
| No credentials in workflow JSON | VERIFIED (credential ID reference only) |
| .gitignore enforced | VERIFIED |
| No GitHub Actions | VERIFIED |
| No force-push used | VERIFIED |

## 13. Open Constraints

1. **V2 workflow not published** — requires manual n8n UI login + Publish click
2. **n8n CLI publish limitation** — n8n 2.26.8 `publish:workflow` command cannot find CLI-imported workflows (0 published workflows processed)
3. **No real UI test run** — cannot test form submission without publishing first
4. **OpenCode/Hermes not installed** on runner (out of scope for this session)
5. **Path switch not performed** — `blueprint-speckit-bootstrap-v2` not yet switched to old path
6. **Browser automation blocked** by n8n login wall

## 14. Next Step (Manual)

1. Open browser, navigate to `http://192.168.1.52:5678`
2. Log in with n8n credentials
3. Find workflow `Blueprint -> SpecKit/OpenCode Bootstrap V2` (ID: `blueprint-speckit-bootstrap-v2`)
4. Open it — verify all 8 nodes and 11 form fields
5. Click **Publish** / **Activate**
6. Verify: `curl -i http://192.168.1.52:5678/form/blueprint-speckit-bootstrap-v2` → HTTP 200
7. Run a test submission with the test data from `docs/ui-reconstruction-runbook.md`

## 15. Required Approval for Later Steps

- Unpublishing old broken blueprint workflow
- Path switch from `blueprint-speckit-bootstrap-v2` to `blueprint-speckit-bootstrap`
- Installing OpenCode/Hermes on runner
- Running full production test with SSH node execution
