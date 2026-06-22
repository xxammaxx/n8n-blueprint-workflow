# Evidence Report — blueprint-clean-reconstruct-20260622T131500Z

## Status: IN_PROGRESS → GREEN_PARTIAL

**Session ID:** blueprint-clean-reconstruct-v2
**Started:** 2026-06-22T13:15:00Z
**Orchestrator:** issue-orchestrator (opencode)

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Created | Yes |
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote status | Empty (0 bytes, no branches) |
| Git remote | `https://github.com/xxammaxx/n8n-blueprint-workflow.git` |
| Commit | Pending |

## 2. Remote Infrastructure

| Field | Value |
|-------|-------|
| Remote connection used | Yes (SSH to Proxmox 192.168.1.136) |
| Automation used | None yet (manual copy via SSH) |
| Manual login needed | No (SSH key auth) |

## 3. Old Blueprint Workflow

| Field | Value |
|-------|-------|
| Workflow ID | `blueprint-speckit-opencode-bootstrap` |
| Name | `Blueprint → SpecKit/OpenCode Bootstrap` |
| Nodes | 8 |
| Active | True |
| Published version | 0 (stuck) |
| Form path | `blueprint-speckit-bootstrap` |
| Form status | HTTP 404 — webhook path not found |
| Reason not repaired | Workflow-specific inconsistent publish/runtime state; safer to reconstruct |

## 4. Debug Workflow (Reference)

| Field | Value |
|-------|-------|
| Workflow ID | `7BdoKSsnOhApjEP8` |
| Name | `My workflow 2` |
| Nodes | 1 (Form Trigger only) |
| Active | True |
| Form path | `debug-minimal-form-ui` |
| Form status | HTTP 200 |
| Exported to repo | `workflows/debug-minimal-form-ui.export.json` |

## 5. New V2 Workflow

| Field | Value |
|-------|-------|
| Name | `Blueprint → SpecKit/OpenCode Bootstrap V2` |
| Form path | `blueprint-speckit-bootstrap-v2` |
| Status | PENDING — to be created via n8n UI |
| Form loading | Not yet tested |

## 6. Backup

| Field | Value |
|-------|-------|
| Pre-reconstruction backup | NOT YET CREATED (will create before UI work) |
| Previous session backup | `/opt/dev-fabric/n8n/backups/republish-rematerialize-20260621T180701Z/` |

## 7. Workflow JSONs in Repo

| File | Source | Size |
|------|--------|------|
| `workflows/debug-minimal-form-ui.export.json` | n8n export | (extracted) |
| `workflows/blueprint-old-broken.export.json` | Runner copy | 24.9 KB |
| `workflows/speckit-smoke-workflow.json` | Runner copy | 4.6 KB |
| `workflows/all-workflows-export.json` | n8n export | 25.2 KB |
| `workflows/published-workflows-export.json` | n8n export | 23.5 KB |

## 8. Scripts in Repo

| File | Source | Status |
|------|--------|--------|
| `scripts/start_blueprint_bootstrap.sh` | Runner copy | 21.9 KB |
| `scripts/speckit_iteration.sh` | Runner copy | 4.7 KB |
| `scripts/export_n8n_workflows.sh` | Newly created | — |
| `scripts/publish_check.sh` | Newly created | — |
| `scripts/validate_repo.sh` | Newly created | — |

## 9. Secret Scan

| Field | Value |
|-------|-------|
| Status | PENDING (will run before commit) |

## 10. Security Status

| Field | Value |
|-------|-------|
| SSH credentials protected | Yes (n8n credential store only) |
| No private keys in repo | Yes |
| No .env in repo | Yes |
| No database files in repo | Yes |
| .gitignore configured | Yes (strict) |

## 11. Open Constraints

- V2 workflow not yet created (needs n8n UI access or Playwright automation)
- GitHub push not yet done
- OpenCode/Hermes not installed on runner (out of scope for this session)
- Old broken workflow still active (not deleted, per approval)
- Path switch from V2 to old path not done (requires new approval)

## 12. Next Steps

1. Create V2 workflow in n8n UI (delegate to playwright-agent)
2. Create pre-reconstruction backup
3. Test `/form/blueprint-speckit-bootstrap-v2`
4. Add processing nodes (SSH, Code, etc.)
5. Run an actual test execution
6. Export V2 workflow to repo
7. Run full validation (secret scan, JSON checks, smoke tests)
8. Commit and push to GitHub

## 13. What the System Can Do Now vs. Before

| Capability | Before | Now |
|------------|--------|-----|
| Workflow source control | None | Git repo with all artifacts |
| Debug reference | Only in n8n | Exported and archived |
| Broken workflow analysis | Only in n8n UI | Exported for offline analysis |
| Documentation | Scattered | Centralized in repo |
| Validation scripts | None | JSON, shell, secret scan |
| Evidence retention | On runner only | In repo evidence-index/ |
| Rollback capability | None | Old workflow archived, backup paths documented |
