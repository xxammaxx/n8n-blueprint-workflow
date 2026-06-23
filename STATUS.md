# STATUS: GREEN_PARTIAL

**Last Updated:** 2026-06-23T07:30:00Z
**Session:** runner-permission-fix
**Previous Session:** ssh-credential-runner-test

## Current State

| Component | Status | Detail |
|-----------|--------|--------|
| n8n Service | UP | Running since 2026-06-23T06:16:38Z |
| Debug Form (`/form/debug-minimal-form-ui`) | HTTP 200 | Working reference |
| Old Blueprint Form (`/form/blueprint-speckit-bootstrap`) | HTTP 404 | Broken — legacy, not fixable |
| Slug Form (`/form/blueprint-speckit-bootstrap-v2`) | HTTP 404 | Slug URL never worked — use UUID |
| **V2 Production Form** (`/form/ae9f52c1-...`) | **HTTP 200** | **LIVE** — UUID preserved |
| V2 Test Form (`/form-test/ae9f52c1-...`) | HTTP 404 | Expected — only works in editor test mode |
| V2 Workflow (Published) | YES | Published and active |
| V2 Workflow (Active) | YES | Active — executing successfully |
| Form Submission (Browser) | ✅ SUCCESS | Browser-based form submit works |
| Form Submission (curl) | ⚠️ NULL FIELDS | curl multipart fields parsed as null — use browser or `field-N` names |
| `dev-runner-ssh` Credential | ✅ VERIFIED | Host=192.168.1.53, Port=22, User=runner, Auth=PrivateKey |
| **SSH Nodes (Write/Start/Read)** | ✅ ALL SUCCESS | All 3 SSH nodes execute and return data |
| JS Code (Validate node) | ✅ FIXED | `crypto` replaced with pure-JS; doubled quotes fixed |
| **End-to-End Execution** | ✅ SUCCESS | Executions #10 and #14: all 8 nodes ✅ |
| **Runner Permissions** | ✅ FIXED | `chown runner:runner` on projects/evidence/logs subdirs |
| **Runner Evidence** | ✅ PRODUCED | BLUEPRINT.md, INITIALISIERUNG_PROMPT_BLUEPRINT.md, status.json, run-report.md, agent.log, etc. |
| **Project Directory** | ✅ CREATED | Full SpecKit structure with git repo, .github/, .opencode/, .specify/ |
| Git Repo (local) | ACTIVE | `C:\n8n-blueprint-workflow` |
| Git Repo (GitHub) | LIVE | `https://github.com/xxammaxx/n8n-blueprint-workflow` — commit `b9022d6` |

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

## What's Pending

- [ ] Install OpenCode/Hermes on runner (needed for full GREEN — next separate run)
- [ ] Investigate curl form submission null-field issue (n8n v2.26.8 — use `field-N` names as workaround?)
- [ ] Path switch from UUID to stable slug (if desired — may not be possible in n8n)

## Blockers

- OpenCode/Hermes not yet installed on runner (needed for full GREEN)

## Next Steps

1. Install OpenCode on runner for full GREEN status (separate, approved run)
2. Optional: Hermes as secondary reviewer/agent
3. Optional: Investigate `field-N` form field naming for curl compatibility
