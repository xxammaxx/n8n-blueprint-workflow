# Playwright Session Renewal Plan

**Timestamp:** 2026-06-27T14:09:31Z
**Session:** post-success-operations-hardening-20260627T140931Z

---

## 1. Purpose

Document the secure process for maintaining Playwright MCP browser sessions for n8n UI access without exposing credentials in agent prompts, logs, or evidence.

---

## 2. Current State

| Aspect | Status |
|--------|--------|
| Playwright MCP available | ✅ Yes (via `playwright-agent` subagent) |
| Browser engine | Chromium |
| Last authenticated session | ✅ Was working (green baseline check) |
| Current session status | ⚠️ EXPIRED — redirected to `/signin` |
| Storage state file | `n8n-storage-state.json` (expired/invalid) |

---

## 3. Problem Statement

Playwright MCP sessions to n8n UI expire after a period of inactivity or browser restart. The stored `n8n-storage-state.json` (cookies, localStorage) becomes invalid. Re-authentication requires n8n credentials (email+password), which must NOT be:
- Exposed in agent prompts
- Stored in evidence files
- Committed to git
- Logged in console output

---

## 4. Secure Session Renewal Process

### Step-by-Step (User-Performed)

```
┌─────────────────────────────────────────────────┐
│  STEP 1: USER logs into n8n manually             │
│  (Browser: http://192.168.1.52:5678/signin)     │
│  User enters email + password                    │
│  → n8n session established in browser            │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  STEP 2: USER exports browser storage state       │
│  Option A: Playwright MCP save storage state      │
│    playwright.saveStorageState(                  │
│      path: "n8n-storage-state.json"              │
│    )                                             │
│  Option B: Manual cookie extraction               │
│    (NOT recommended — fragile)                   │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  STEP 3: Verify storage state is valid            │
│  playwright.navigate("http://192.168.1.52:5678")│
│  → Should land on workflow list, NOT /signin     │
│  → Confirms authentication is working             │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  STEP 4: Agent uses existing session              │
│  Playwright loads n8n-storage-state.json          │
│  → No credentials needed in prompt                │
│  → Agent can interact with n8n UI                 │
└─────────────────────────────────────────────────┘
```

---

## 5. Storage State File Management

### File Location (Local Only)
```
C:\Spec-kit_n8n\.playwright-mcp\n8n-storage-state.json
```
or
```
C:\Spec-kit_n8n\n8n-storage-state.json
```

### Protection Rules

| Rule | Implementation |
|------|---------------|
| **`.gitignore`** | Add `n8n-storage-state.json` to `.gitignore` |
| **Never in evidence** | Evidence files are committed — storage state must NOT be |
| **Never in logs** | Console logs may contain URLs — no cookies |
| **Treat as secret** | Storage state = authenticated session = secret |
| **Rotate if leaked** | Delete file, re-authenticate, generate new |

### `.gitignore` Entry (verify/add)
```
# Playwright browser storage state (contains auth cookies)
n8n-storage-state.json
.playwright-mcp/n8n-storage-state.json
```

---

## 6. What NOT to Do

| Anti-Pattern | Why It's Dangerous |
|-------------|-------------------|
| Put password in agent prompt | Prompt may be logged, stored in evidence, or appear in git |
| Store cookies in evidence | Evidence is committed — anyone can steal session |
| Hardcode credentials in scripts | Scripts are committed to git |
| Export cookies as environment variables | Env vars may be dumped in logs |
| Screenshot with visible credentials | Screenshots may be committed |

---

## 7. Session Expiry Detection

Before any Playwright UI operation, the agent should:

1. Navigate to `http://192.168.1.52:5678`
2. Check current URL:
   - `http://192.168.1.52:5678/home/workflows` → ✅ Authenticated
   - `http://192.168.1.52:5678/signin` → ❌ Session expired
3. If expired: Report status, do NOT attempt login, request user session renewal

---

## 8. Fallback: API-Based Operations

When Playwright session is unavailable:

| Operation | API Fallback | Status |
|-----------|-------------|--------|
| Check workflow active | `GET /api/v1/workflows/{id}` | ✅ Works |
| View workflow code | `GET /api/v1/workflows/{id}` → jsCode field | ✅ Works |
| Check execution status | `GET /api/v1/executions/{id}` | ✅ Works |
| Publish draft | `POST /deactivate` + `POST /activate` | ✅ Works |
| Edit node code | API v1 does NOT support | ❌ Needs Playwright |
| Change credentials | API v1 does NOT support | ❌ Needs Playwright |

**Conclusion:** Most read-only and publish operations work via API. Only node editing requires Playwright UI. Prioritize API over Playwright where possible.

---

## 9. Session Health Monitoring

Add to daily health check:
```javascript
// Playwright session check
const url = await page.url();
const isAuthenticated = !url.includes('/signin');
// Report: SESSION_OK or SESSION_EXPIRED
```

---

## 10. Summary

| Question | Answer |
|----------|--------|
| Is Playwright currently working? | ⚠️ Session expired — needs renewal |
| Can agent fix this itself? | ❌ No — needs user credentials to re-auth |
| What does user need to do? | Login manually, save storage state |
| Is this blocking? | No — most operations work via API v1 |
| What should NEVER happen? | Passwords in prompts, cookies in evidence |
| Preferred long-term approach | API key auth over browser session |
