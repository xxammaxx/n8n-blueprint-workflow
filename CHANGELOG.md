# CHANGELOG

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
