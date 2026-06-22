# CHANGELOG

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
