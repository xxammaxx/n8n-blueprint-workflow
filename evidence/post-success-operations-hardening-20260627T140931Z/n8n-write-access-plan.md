# n8n REST/API Write-Access Plan

**Timestamp:** 2026-06-27T14:09:31Z
**Session:** post-success-operations-hardening-20260627T140931Z

---

## 1. Purpose

Document the secure path to enable n8n REST API write operations (PUT/PATCH) for future programmatic workflow management.

---

## 2. Current State

### What Works (Read-Only)
- **Public API v1 GET endpoints** — Readable without authentication
  - `GET /api/v1/workflows/{id}` — Fetch workflow details
  - `GET /api/v1/executions/{id}` — Fetch execution details
  - `GET /api/v1/executions?workflowId={id}` — List executions
  - `GET /healthz` — Health check
- **JWT Bearer API Key** — Used successfully for authenticated reads and publish operations
  - `POST /api/v1/workflows/{id}/deactivate` — Deactivate workflow
  - `POST /api/v1/workflows/{id}/activate` — Activate workflow (publish draft)

### What Didn't Work (Write Operations)
| Operation | Attempt | Result |
|-----------|---------|--------|
| `PUT /api/v1/workflows/{id}` | Full workflow update | 400 Bad Request |
| `PATCH /api/v1/workflows/{id}` | Partial node update | Not available in API v1 |
| email-based REST API | Required email+password | Not configured |

### What Falls Back to UI
- **Playwright MCP** — Browser-based UI interaction for operations that API doesn't support

---

## 3. Access Tiers

### Tier 1: Public API (No Auth) — CURRENTLY USED
- Health checks
- GET workflow metadata (limited)
- GET execution lists (limited)

### Tier 2: JWT Bearer API Key — CURRENTLY USED
- Full GET access
- Activate/deactivate workflows
- **Configured in `.env.local` as `N8N_API_KEY`**

### Tier 3: REST/API Write (Full) — PLANNED
- `PUT/PATCH` workflow nodes
- Create/update credentials
- Full workflow CRUD
- **Requires: n8n user API key with appropriate scope**

### Tier 4: Browser/Playwright UI — FALLBACK
- Any UI operation
- Node editing via browser
- **Requires: active browser session (cookies/storage state)**

---

## 4. Gap Analysis: Why API v1 REST Limitations Occurred

| Issue | Root Cause |
|-------|-----------|
| `PUT /api/v1/workflows/{id}` returns 400 | n8n API v1 does not support full workflow replacement via PUT. Update operations require the n8n REST API (not the public API v1) or the newer n8n API endpoints. |
| No `PATCH` endpoint in API v1 | API v1 is primarily read-oriented + activate/deactivate. Write operations are limited. |
| REST API returns 401 | n8n REST API requires cookie-based auth (email+password session) or a properly scoped API key configured in n8n settings. |

The successful `POST /deactivate` + `POST /activate` pattern used previously is the API v1 workaround for publishing drafts — it does NOT support arbitrary node editing.

---

## 5. Recommended: n8n User API Key for Write Access

### Configuration Steps (by user)

1. **Generate API Key in n8n UI:**
   - Navigate to n8n → Settings → n8n API
   - Create a new API key
   - Scope: Full access (or read+write workflows)

2. **Store Securely in `.env.local`:**
   ```env
   N8N_BASE_URL=http://192.168.1.52:5678
   N8N_API_KEY=<YOUR_REAL_API_KEY_HERE>
   ```

3. **Use in API Calls:**
   ```
   Header: X-N8N-API-KEY: ${N8N_API_KEY}
   or
   Header: Authorization: Bearer ${N8N_API_KEY}
   ```

### Security Rules

| Rule | Rationale |
|------|-----------|
| NEVER commit `.env.local` | Already in `.gitignore` |
| NEVER put API key in evidence | Evidence is committed to git |
| NEVER put API key in logs | Console output may be captured |
| NEVER put API key in scripts | Scripts are committed to git |
| Rotate immediately if leaked | Minimize exposure window |

---

## 6. Cookie-Based Authentication (NOT RECOMMENDED)

### Risks
- **Cookies expire** — Session timeout requires re-auth
- **Cookies are more sensitive than API keys** — They represent a full authenticated session
- **Harder to rotate** — Requires new login, not just key rotation
- **Leaked cookies = full account access** — Unlike scoped API keys

### When Cookies Might Be Needed
- Only if n8n REST API does not support token-based auth for specific endpoints
- Should be treated as a last resort

### If Cookies Must Be Used (Local Only)
```
N8N_REST_COOKIE=<session-cookie-value>
```
- Store ONLY in `.env.local`
- NEVER in git, evidence, logs
- Rotate if leaked
- Prefer API keys over cookies always

---

## 7. Preferred Architecture

```
┌─────────────────────────────────────────────┐
│  Agent / Script                             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  read .env.local (NEVER committed)  │    │
│  │  N8N_API_KEY=<key>                  │    │
│  └─────────────────────────────────────┘    │
│          │                                   │
│          ▼                                   │
│  ┌─────────────────────────────────────┐    │
│  │  API Requests                       │    │
│  │  Header: X-N8N-API-KEY             │    │
│  │  Read:  GET  /api/v1/...           │    │
│  │  Write: PUT  /api/v1/workflows/... │    │
│  │  (fallback if PUT unsupported:      │    │
│  │   Playwright MCP UI)               │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 8. Rotation Procedure (if key is compromised)

1. **Immediately:** Generate new API key in n8n UI (invalidates old one)
2. **Update:** `.env.local` with new key
3. **Verify:** Run read-only health check with new key
4. **Audit:** Check n8n audit logs for unauthorized access during compromised window
5. **Document:** Note rotation in `CHANGELOG.md` (without exposing key)

---

## 9. Summary

| Question | Answer |
|----------|--------|
| Can we write to n8n via API today? | Partially — activate/deactivate only |
| What's missing for full write? | Properly scoped n8n user API key |
| Where should the key live? | `.env.local` (gitignored, never committed) |
| What should NEVER be used? | Cookies in git/evidence/logs |
| Fallback if API write isn't supported? | Playwright MCP UI |
| Is this urgent? | No — current operations don't need write access |
