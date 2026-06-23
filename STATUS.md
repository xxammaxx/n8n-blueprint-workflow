# STATUS: GREEN_PARTIAL

**Last Updated:** 2026-06-23T03:45:00Z
**Session:** v2-activation-ui-test
**Previous Session:** blueprint-clean-reconstruct-v2

## Current State

| Component | Status | Detail |
|-----------|--------|--------|
| n8n Service | UP | Running since 2026-06-22T15:17:28Z |
| Debug Form (`/form/debug-minimal-form-ui`) | HTTP 200 | Working reference |
| Old Blueprint Form (`/form/blueprint-speckit-bootstrap`) | HTTP 404 | Broken — legacy, not fixable |
| Slug Form (`/form/blueprint-speckit-bootstrap-v2`) | HTTP 404 | Slug URL never worked — use UUID |
| **V2 Production Form** (`/form/ae9f52c1-...`) | **HTTP 200** | **LIVE** — working production URL |
| V2 Test Form (`/form-test/ae9f52c1-...`) | HTTP 404 | Expected — only works in editor test mode |
| V2 Workflow (Published) | YES | UI shows "Published" |
| V2 Workflow (Active) | YES | Form Trigger node active, ▶️ title prefix |
| Production Checklist | DISMISSED | `N8N_READY_TO_RUN_WORKFLOWS_DISMISSED` in localStorage |
| Form Submission | HTTP 200 | Requires `multipart/form-data` content type |
| SSH to Runner (101→102) | PARTIAL | TCP reachable (192.168.1.53:22) — auth needs verification |
| Runner Evidence | PENDING | SSH execution may need credential reconfiguration |
| Git Repo (local) | ACTIVE | `C:\n8n-blueprint-workflow` |
| Git Repo (GitHub) | LIVE | `https://github.com/xxammaxx/n8n-blueprint-workflow` — commit `c3a9b70` |

## UUID-Based Production URL

The Form Trigger node generates UUID-based production URLs. The slug-based URL (`/form/blueprint-speckit-bootstrap-v2`) does NOT work. After deactivate/reactivate/republish, the UUID changes.

**Current Production URL:** `http://192.168.1.52:5678/form/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60`
**Current Test URL:** `http://192.168.1.52:5678/form-test/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60`

⚠️ **Always read the URL from the Form Trigger Node in the UI — never guess or hardcode.**

## Known Issues

### 1. Old Blueprint Workflow (persistent)
The old `blueprint-speckit-opencode-bootstrap` workflow has a persistent webhook registration failure. Not fixable.

### 2. SSH Runner Connection (needs verification)
- Container 101 can reach container 102 at `192.168.1.53:22` (TCP confirmed)
- SSH authentication from CLI fails with "Permission denied" — but n8n uses `dev-runner-ssh` credential with its own key
- Credential may need reconfiguration for the correct host IP

### 3. `N8N_READY_TO_RUN_WORKFLOWS_DISMISSED` (localStorage)
- Production Checklist was previously dismissed ("Ignore for all workflows")
- This key suppresses the checklist dialog but doesn't block activation
- If checklist is needed in future, remove this key from browser localStorage

### 4. Form requires multipart/form-data
- POST requests must use `multipart/form-data` content type
- `application/x-www-form-urlencoded` causes: "Expected multipart/form-data" error

## What's Complete

- [x] Local Git repo with full structure created
- [x] V2 workflow imported into n8n database
- [x] V2 workflow published via n8n UI (Playwright)
- [x] V2 workflow activated — Form Trigger listening
- [x] Production form URL confirmed: HTTP 200
- [x] Form submission tested: HTTP 200 response
- [x] All documentation created
- [x] Secret scan passed
- [x] JSON validation passed
- [x] Pushed to GitHub

## What's Pending

- [ ] Verify SSH credential host configuration (check if pointing to `192.168.1.53`)
- [ ] Re-run test submission after SSH credential verified
- [ ] Check Runner evidence after successful execution
- [ ] Install OpenCode/Hermes on runner (needed for full GREEN)
- [ ] Path switch from UUID to stable slug (if desired — may not be possible in n8n)

## Blockers

- **SSH credential host** may point to wrong IP (n8n UI check needed)
- OpenCode/Hermes not yet installed on runner (needed for full GREEN)
- `dev-runner-ssh` credential verification requires n8n UI access (credential store)

## Next Steps

1. Check `dev-runner-ssh` credential in n8n UI — verify host is `192.168.1.53`
2. Re-run form submission with verified SSH credential
3. Verify Runner evidence after successful execution
4. Install OpenCode on runner for real processing
