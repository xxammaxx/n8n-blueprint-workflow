# STATUS: GREEN_PARTIAL

**Last Updated:** 2026-06-22T15:20:00Z
**Session:** blueprint-clean-reconstruct-v2

## Current State

| Component | Status | Detail |
|-----------|--------|--------|
| n8n Service | UP | Running since 2026-06-22T15:17:28Z (restarted) |
| Debug Form (`/form/debug-minimal-form-ui`) | HTTP 200 | Working reference |
| Old Blueprint Form (`/form/blueprint-speckit-bootstrap`) | HTTP 404 | Broken — webhook path not found |
| V2 Blueprint Form (`/form/blueprint-speckit-bootstrap-v2`) | HTTP 404 | Imported but needs UI Publish click |
| V2 Workflow JSON | READY | `workflows/blueprint-v2.clean.export.json` — validated, all 8 nodes |
| V2 Workflow in n8n DB | IMPORTED | ID `blueprint-speckit-bootstrap-v2`, active=False |
| Git Repo (local) | ACTIVE | `C:\n8n-blueprint-workflow` — 25+ files |
| Git Repo (GitHub) | EMPTY | `https://github.com/xxammaxx/n8n-blueprint-workflow` — ready for push |

## Known Issues

### 1. Old Blueprint Workflow (persistent)
The old `blueprint-speckit-opencode-bootstrap` workflow has a persistent webhook registration failure:
- n8n logs: `No webhook path could be found for node "Form Trigger — Bitte Blueprint eingeben"`
- `workflow_published_version` stuck at `0` despite publish actions
- `/form/blueprint-speckit-bootstrap` returns HTTP 404

### 2. V2 Workflow — n8n 2.26.8 CLI Limitation
- `n8n import:workflow` succeeded (workflow visible in `export:workflow --all`)
- `n8n publish:workflow` fails: "Workflow not found" — CLI command cannot find CLI-imported workflows in this n8n version
- `n8n update:workflow` same error (deprecated, same code path)
- n8n processes **0 published workflows** after restart — imported workflow not recognized by dependency indexer
- **Fix:** Log into n8n UI, open workflow `blueprint-speckit-bootstrap-v2`, click **Publish**

### 3. n8n UI Authentication
- n8n editor at http://192.168.1.52:5678 redirects to `/signin`
- Playwright automation blocked by login wall
- Manual login required to access the UI

## What's Complete

- [x] Local Git repo with full structure created
- [x] All workflow artifacts copied from runner
- [x] Fresh n8n exports captured (before/after import)
- [x] All documentation created (7 docs)
- [x] V2 workflow JSON created (path: `blueprint-speckit-bootstrap-v2`, form fields updated)
- [x] V2 workflow imported into n8n database
- [x] Pre-reconstruction backup created: `/opt/dev-fabric/n8n/backups/pre-v2-20260622/`
- [x] Secret scan passed (no secrets in repo)
- [x] JSON validation passed (all 7 workflow files valid)
- [x] `.gitignore` configured with strict rules

## What's Pending (Manual Step Required)

- [ ] **Log into n8n UI** at http://192.168.1.52:5678
- [ ] **Open workflow** `blueprint-speckit-bootstrap-v2` (8 nodes)
- [ ] **Click Publish** button
- [ ] **Verify:** `curl -i http://192.168.1.52:5678/form/blueprint-speckit-bootstrap-v2` returns HTTP 200
- [ ] Optional: Run a test execution from the form
- [ ] Optional later: Switch V2 to old path `blueprint-speckit-bootstrap` (needs new approval)

## Blockers

- OpenCode/Hermes not yet installed on runner (needed for full GREEN)
- n8n UI authentication (manual login required)

## Next Steps

1. Push repo to GitHub (ready, remote is empty)
2. Manual: Log into n8n UI, publish V2 workflow
3. Manual: Test V2 form
4. Optional: Add SSH/Code processing nodes
5. Optional: Path switch to old URL
