# Playwright MCP Discovery — Green Baseline Check

**Date/Time UTC:** `2026-06-27T11:31Z`
**Session:** `playwright-mcp-green-baseline-check-20260627T1131Z`

---

## 1. MCP Configuration Check

| Field | Value |
|-------|-------|
| Playwright MCP server defined | ✅ Yes (opencode.json line 43-48) |
| Server command | `npx -y @playwright/mcp@latest --isolated` |
| Server enabled | ✅ `true` |
| Global `playwright_*` tools | ❌ `false` (disabled globally) |
| `playwright-agent` subagent `playwright_*` | ✅ `true` (enabled for subagent) |
| Current agent (`issue-orchestrator`) `playwright_*` | ❌ Not enabled |

**Conclusion:** Playwright MCP tools are available ONLY via the `playwright-agent` subagent. The `issue-orchestrator` cannot use them directly.

---

## 2. Local Playwright Runtime Check

| Field | Value |
|-------|-------|
| `npm ls playwright` in project | ❌ Empty (not installed) |
| Prior `.playwright-mcp/` logs exist | ✅ Yes (50+ files from multiple sessions) |
| Most recent page log | `console-2026-06-27T08-55-29-977Z.log` |
| Most recent page state | `page-2026-06-27T08-55-31-195Z.yml` |
| Prior session storage state | `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json` |

**Conclusion:** Playwright MCP WAS operational in prior sessions. Session artifacts exist.

---

## 3. n8n Reachability

| Endpoint | Method | Result |
|----------|--------|--------|
| `http://192.168.1.52:5678` | GET | ✅ HTTP 200 |
| `http://192.168.1.52:5678/healthz` | GET | ✅ HTTP 200, `{"status":"ok"}` |
| `http://192.168.1.52:5678/rest/settings` | GET | ✅ HTTP 200 |
| `http://192.168.1.52:5678/rest/workflows` | GET | ❌ HTTP 401 |
| `http://192.168.1.52:5678/rest/executions` | GET | ❌ HTTP 401 |
| `http://192.168.1.52:5678/rest/login` | GET | ❌ HTTP 401 |
| `http://192.168.1.52:5678/api/v1/workflows` | GET | ❌ HTTP 401 |

**Conclusion:** n8n is reachable but all workflow/execution data requires authentication.

---

## 4. Playwright MCP Session History Analysis

### Latest session (08:55 UTC)
- Navigated to `http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D`
- **Redirected to `/signin`** — login required
- Console: `401 (Unauthorized)` on `/rest/login`
- Page state: Minimal DOM (`ref=e3`, `ref=e4`, `complementary`)
- **NOT authenticated**

### Prior session (07:43 UTC)
- Same behavior: navigated to workflow URL → redirected to signin
- Page state shows full signin form:
  - "Sign in" heading
  - Email textbox
  - Password textbox  
  - "Sign in" button
  - "Forgot my password" link
- **NOT authenticated**

### Prior session (07:41 UTC)
- Navigated to `http://192.168.1.52:5678/` 
- Redirected to `/signin`
- **NOT authenticated**

### Prior successful session (09:27 UTC — playwright-ui-fix)
- According to `results.json`:
  - `login_status: "already_authenticated"`
  - `browser_launched: true`
  - `workflow_url_reachable: true`
  - Used local Playwright CLI (not MCP)
- This session had auth — but it was 2+ hours ago

---

## 5. Login Status Assessment

| Criteria | Value |
|----------|-------|
| n8n requires login | ✅ Yes |
| Current Playwright MCP session authenticated | ❌ No |
| Prior storage state file exists | ✅ `n8n-storage-state.json` |
| Storage state validity (age) | Unknown (session may have expired) |
| Playwright-agent can attempt with storage state | ✅ Can try |
| Can credentials be entered | ❌ HARD CONSTRAINT: Never read/enter credentials |

---

## 6. Decision

### Status: `PLAYWRIGHT_MCP_LOGIN_GATING`

The n8n instance requires authentication. All recent Playwright MCP sessions (07:41, 07:43, 08:55 UTC) were redirected to the signin page. No authenticated session is currently available in MCP.

### Options:
1. **Try playwright-agent with storage state** — attempt to use `n8n-storage-state.json` for session resumption
2. **Accept TOOL_GAP_LOGIN_REQUIRED** — user must manually authenticate in browser, then resume

### Recommendation:
Attempt Option 1 first. If playwright-agent can resume the stored session, proceed with UI checks. Otherwise, classify as `TOOL_GAP_LOGIN_REQUIRED` and use HTTP/API-based fallback for the remaining checks.

---

## 7. Playwright MCP Capability Summary

| Capability | Status |
|------------|--------|
| Playwright MCP server configured | ✅ |
| Playwright tools enabled (via subagent) | ✅ |
| Browser launchable (via subagent) | ✅ Needs test |
| n8n URL reachable | ✅ |
| n8n login required | ✅ |
| Authenticated session available | ❌ Unknown (storage state may work) |
| Secrets visible risk | ✅ None (login required blocks all data access) |
