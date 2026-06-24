# n8n Authentication & Automation Strategy

## Problem Statement

The n8n Webinterface at `http://192.168.1.52:5678` requires authentication (email/password). This blocks Playwright browser automation and other automated UI access. Each session starts with a fresh browser context that cannot share the existing login session.

## Strategy Priority (Descending)

### Option A — n8n API Key (PREFERRED for API Automation)

Use an n8n API Key instead of browser-based login for all non-UI operations.

**Setup:**
1. Log into n8n UI manually once
2. Navigate to **Settings → API Keys**
3. Create a new API key
4. Store the key **outside the repository**:

```
Windows:  C:\Users\xxammaxx\.n8n-automation\n8n-api-key.txt
Linux:    /home/runner/.config/n8n-automation/n8n-api-key
```

**Security Rules:**
- File must have `chmod 600` (Linux) or restrictive Windows ACL
- NEVER store in the repository (`C:\n8n-blueprint-workflow`)
- NEVER store in evidence paths (`/opt/dev-fabric/evidence/`)
- NEVER commit to git
- NEVER include in logs or screenshots
- NEVER post in chat

**Usage Pattern (placeholder — never include real key):**
```bash
export N8N_API_KEY="$(cat /home/runner/.config/n8n-automation/n8n-api-key)"
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://192.168.1.52:5678/api/v1/workflows
unset N8N_API_KEY
```

**What the API Key Enables:**
- List workflows, credentials, executions
- Trigger workflow executions
- Read execution history
- Export workflow JSON

**What the API Key Does NOT Enable:**
- UI-based debugging
- Visual workflow inspection
- Drag-and-drop node editing

---

### Option B — Playwright Persistent Profile / storageState (PREFERRED for UI Automation)

When UI automation is needed, use a persistent Playwright browser context.

**Storage Location (outside repo):**
```
Windows:  C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json
Linux:    /home/runner/.config/n8n-automation/playwright/n8n-storage-state.json
```

**Workflow:**
1. Playwright opens a **visible browser** (not headless)
2. User logs in **manually** once
3. Playwright saves `storageState` to the secret path
4. Future sessions load this `storageState` to skip login
5. If 401/expired session: user re-authenticates manually and state is refreshed

**Example (conceptual — no secrets):**
```javascript
const context = await browser.newContext({
  storageState: 'C:/Users/xxammaxx/.n8n-automation/playwright/n8n-storage-state.json'
});
const page = await context.newPage();
await page.goto('http://192.168.1.52:5678/home/workflows');
// If redirected to /signin → storageState expired → prompt user for re-auth
```

**Security Rules:**
- `storageState` file IS a secret — treat like a password
- NEVER commit to git
- NEVER store in evidence paths
- NEVER include in screenshots
- NEVER output in logs
- Rotate or delete after each session if needed

**Status:** ⚠️ NOT YET CREATED — manual login required first

---

### Option C — Temporarily Disable n8n Login (RED_HOLD)

**WARNING: This is NOT the default path. Only for emergencies.**

**Preconditions (ALL must be met):**
1. Separate explicit user approval (RED_HOLD)
2. n8n version confirmed (`n8n --version`)
3. Official n8n documentation checked for this exact version
4. Full backup created
5. LAN exposure verified (internal network only)
6. Time window: maximum 15 minutes
7. Login re-enabled immediately after test
8. Service status documented before and after

**Prohibited Actions:**
- No direct database manipulation
- No SQL UPDATE/INSERT/DELETE
- No deprecated `N8N_BASIC_AUTH_*` environment variables
- No community hacks or unsupported workarounds

**Decision Rule:** If no officially supported, version-compatible method exists → DO NOT disable login. Use Option A or B instead.

---

### Option D — Login Credentials in File (YELLOW_REVIEW — LAST RESORT)

**NOT RECOMMENDED. Only if Options A, B, and C are impossible.**

**Preconditions:**
1. Separate explicit user approval
2. File stored outside repository
3. `chmod 600` / restrictive ACL only
4. Temporary — deleted after use
5. Never in git, evidence, logs, screenshots

**Allowed location (placeholder only):**
```
C:\Users\xxammaxx\.n8n-automation\n8n-login.local.json
```

**Decision Rule:** Can `storageState` (Option B) be used instead? Can API Key (Option A) be used? If yes, DO NOT use credential files.

---

## Current Status (2026-06-24)

| Method | Available | Notes |
|--------|-----------|-------|
| Option A (API Key) | ❌ Not created | User must log into n8n UI to create |
| Option B (storageState) | ❌ Not created | User must log in once to generate |
| Option C (Login disabled) | ❌ Not attempted | RED_HOLD — separate approval required |
| Option D (Credential file) | ❌ Not created | Last resort — not recommended |

**Blocked Operations (until login resolved):**
- GitHub credential verification in n8n UI
- Workflow node configuration inspection
- Manual Trigger execution from UI
- Visual workflow verification

**Unblocked Operations (no login needed):**
- Git operations (fetch, commit, push)
- SSH to Runner (LXC 102)
- Runner evidence verification
- Workflow JSON editing (export format)
- Documentation updates
- Secret scanning
- `gh` CLI GitHub operations

---

## Recommended Next Action

1. **User logs into n8n UI manually** at http://192.168.1.52:5678
2. **Create API Key** (Settings → API Keys) → store in `%USERPROFILE%\.n8n-automation\n8n-api-key.txt`
3. **Optionally create storageState** via Playwright persistent context
4. After login/API key: verify `github-n8n-blueprint` credential exists
5. After credential verified: test GitHub Comment + Label nodes

---

## References

- n8n API documentation: https://docs.n8n.io/api/
- n8n Authentication: https://docs.n8n.io/api/authentication/
- Playwright storageState: https://playwright.dev/docs/auth
