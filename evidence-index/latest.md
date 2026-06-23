# Evidence Report — ssh-credential-runner-test-20260623T064500Z

## Status: GREEN_PARTIAL

**Session ID:** ssh-credential-runner-test
**Completed:** 2026-06-23T06:45:00Z
**Previous Session:** v2-activation-ui-test
**Orchestrator:** issue-orchestrator (opencode)

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote branch | `main` |
| Previous commit | `64766ed030d6aca4a23e43ff094ac46b2ac77728` |
| Push status | Pending (after doc updates) |

## 2. Remote Connection Used

| Field | Value |
|-------|-------|
| Remote infrastructure access | Yes (SSH to Proxmox 192.168.1.136) |
| Browser automation | Yes (delegated to playwright-agent — form submit via real browser) |
| Browser form submit | SUCCESS — "Your response has been recorded" |
| curl form submit | PARTIAL — HTTP 200 but all fields parsed as null by n8n v2.26.8 |

## 3. `dev-runner-ssh` Credential Verification

| Field | Expected | Actual | Match |
|-------|----------|--------|-------|
| Host | 192.168.1.53 | 192.168.1.53 | ✅ |
| Port | 22 | 22 | ✅ |
| Username | runner | runner | ✅ |
| Auth Type | Private Key | SSH Private Key | ✅ |
| Passphrase | (empty) | (empty) | ✅ |
| Connection Test | N/A | "Connection tested successfully" | ✅ |
| Private Key | (not read) | (properly masked) | ✅ |

**Verdict: `dev-runner-ssh` credential is correctly configured. No changes needed.**

## 4. SSH Nodes in V2 Workflow

| Node | Credential Used | Credential ID |
|------|----------------|---------------|
| SSH — Write RUN_INPUT to Runner | dev-runner-ssh | 42a60f05-16eb-493f-8257-3eeb5aef531a |
| SSH — Start Blueprint Bootstrap | dev-runner-ssh | 42a60f05-16eb-493f-8257-3eeb5aef531a |
| SSH — Read Status | dev-runner-ssh | 42a60f05-16eb-493f-8257-3eeb5aef531a |

**All 3 SSH nodes correctly use `dev-runner-ssh`.**

## 5. Root Cause Analysis: Why Previous Executions Failed

### Issue 1: Corrupted JavaScript (FIXED)
The V2 workflow export/import process corrupted single quotes in JS code:
```javascript
// BROKEN (caused SyntaxError):
const crypto = require(''crypto'');
Buffer.from(data, ''base64'').toString(''utf8'');

// FIXED: Removed crypto dependency, fixed remaining doubled quotes
```

### Issue 2: `crypto` Module Blocked by n8n Task Runner (FIXED)
n8n v2.26.8's JS Task Runner blocks the `crypto` built-in:
```
Module 'crypto' is disallowed
```
**Fix applied:**
- `require('crypto')` → removed
- `crypto.randomBytes(3).toString('hex')` → `Math.floor(Math.random()*16777216).toString(16).padStart(6,'0')`
- `crypto.createHash('sha256').update(...).digest('hex')` → DJB2-style hash via `TextEncoder`

### Issue 3: curl Form Submissions Yield Null Fields (DOCUMENTED)
n8n Form Trigger V2 under v2.26.8 parses curl multipart submissions with all fields as `null`. Browser-based submissions work correctly.

## 6. Production Form URLs

| URL Type | Path | Result |
|----------|------|--------|
| **Production (UUID)** | `/form/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60` | **HTTP 200** ✅ |
| Test | `/form-test/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60` | HTTP 404 (expected) |
| Slug (never worked) | `/form/blueprint-speckit-bootstrap-v2` | HTTP 404 |
| Debug (reference) | `/form/debug-minimal-form-ui` | HTTP 200 ✅ |

**UUID preserved across CLI import/republish.** Same UUID: `ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60`

## 7. End-to-End Execution Results (Execution #10)

| # | Node | Status | Duration | Notes |
|---|------|--------|----------|-------|
| 1 | Form Trigger | ✅ success | 1ms | |
| 2 | Validate + Extract Blueprint | ✅ success | 14ms | No crypto, no syntax errors |
| 3 | Prepare RUN_INPUT | ✅ success | 7ms | |
| 4 | **SSH — Write RUN_INPUT to Runner** | ✅ success | 25s | File uploaded successfully |
| 5 | **SSH — Start Blueprint Bootstrap** | ✅ success | 25s | Script started, permission error on mkdir |
| 6 | Wait — Initial Status Delay | ✅ success | 10s | |
| 7 | **SSH — Read Status** | ✅ success | 25s | Status: PENDING (script couldn't write) |
| 8 | Format Result | ✅ success | 17ms | Formatted output with instructions |

**Overall: SUCCESS — all 8 nodes completed. First successful end-to-end execution.**

## 8. Runner Evidence Status

| Check | Result |
|-------|--------|
| Project directory | NOT created (permission denied) |
| Evidence directory | NOT created (permission denied) |
| RUN_INPUT.json | Uploaded to /tmp but couldn't be moved |
| `start_blueprint_bootstrap.sh` | Executed but failed at mkdir |
| Error message | `mkdir: cannot create directory '/opt/dev-fabric/evidence/...': Permission denied` |

**Root cause:** The `runner` user on LXC 102 lacks write permissions on `/opt/dev-fabric/`.
**Fix needed:** `chown -R runner:runner /opt/dev-fabric/evidence /opt/dev-fabric/logs /opt/dev-fabric/workspaces`

## 9. What the System Can Do Now vs. Previous Session

| Capability | Previous Session | This Session |
|------------|-----------------|--------------|
| V2 workflow | Published + Active | Published + Active (re-imported with fixes) |
| SSH credential | Unverified | Verified correct (no changes needed) |
| JS code execution | SyntaxError (corrupted quotes) | Runs successfully (crypto-free) |
| SSH Nodes | Never tested | All 3 execute and return data ✅ |
| End-to-end execution | Failed at Validate node | SUCCESS — all 8 nodes complete ✅ |
| Form submission (browser) | Not tested | SUCCESS — "Your response has been recorded" ✅ |
| Form submission (curl) | HTTP 200 (null fields unknown) | Documented null-field bug |
| Runner connectivity | TCP confirmed only | Full SSH auth works ✅ |
| Runner evidence | None | Script executes but fails on permissions |

## 10. Security Status

| Check | Status |
|-------|--------|
| No private keys in repo | ✅ VERIFIED |
| No .env files in repo | ✅ VERIFIED |
| No database files in repo | ✅ VERIFIED |
| No credentials in workflow JSON | ✅ VERIFIED |
| .gitignore enforced | ✅ VERIFIED |
| No GitHub Actions | ✅ VERIFIED |
| No force-push | ✅ VERIFIED |
| No SQL patches applied | ✅ VERIFIED |
| No credential export | ✅ VERIFIED |
| Private Key never read/displayed | ✅ VERIFIED |
| No secrets in screenshots | ✅ VERIFIED |

## 11. Open Constraints

1. **Runner directory permissions** — `runner` user cannot write to `/opt/dev-fabric/` (needs `chown`)
2. **curl form submissions** — n8n v2.26.8 parses curl multipart fields as null (browser required for testing)
3. **OpenCode/Hermes** not yet installed on runner (needed for full GREEN)
4. **UUID volatility** — republishing changes the production URL (limitation, not a bug)
5. **Slug URL** never worked — form path is UUID-based, not slug-based

## 12. Next Steps

1. **Fix runner permissions:** `chown -R runner:runner /opt/dev-fabric/evidence /opt/dev-fabric/logs /opt/dev-fabric/workspaces` (on LXC 102)
2. **Re-submit form via browser** to produce actual runner evidence after permissions fix
3. **Install OpenCode/Hermes** on runner for real processing
4. **Investigate curl null-field issue** — possible n8n v2.26.8 bug, check for updates or workarounds

## 13. Required Approvals

- Runner permission changes (`chown` on LXC 102)
- OpenCode/Hermes installation on runner
- Old broken workflow removal (if desired)
