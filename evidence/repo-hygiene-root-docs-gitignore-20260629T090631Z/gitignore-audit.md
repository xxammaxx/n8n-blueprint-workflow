# Gitignore Audit

**Date/Time UTC:** `2026-06-29T09:06:31Z`  

---

## Current `.gitignore` (29 lines)

```gitignore
# ============================================================
# Local secret / environment files — NEVER commit real secrets
# ============================================================
.env.local
.env.*.local
*.secret.env
secrets/
credential-sync.sources.local.json

# But DO allow the example template
!.env.example

# ============================================================
# Node.js
# ============================================================
node_modules/
npm-debug.log*

# ============================================================
# OS artifacts
# ============================================================
.DS_Store
Thumbs.db

# ============================================================
# Temporary / build artifacts
# ============================================================
.tmp/
*.tmp
```

---

## Required Patterns vs. Current State

| Pattern | Required | Present | Status |
|---------|----------|---------|--------|
| `secrets/` | ✅ | ✅ | OK |
| `.env.local` | ✅ | ✅ | OK |
| `.env.*.local` | ✅ | ✅ | OK |
| `*.secret.env` | ✅ | ✅ | OK |
| `credential-sync.sources.local.json` | ✅ | ✅ | OK |
| `!.env.example` | ✅ | ✅ | OK (explicitly allowed) |
| `*.db` | ✅ | ❌ | **MISSING** |
| `*.sqlite` | ✅ | ❌ | **MISSING** |
| `*.sqlite3` | ✅ | ❌ | **MISSING** |
| `*.bak` | ✅ | ❌ | **MISSING** |
| `*.db-shm` | ✅ | ❌ | **MISSING** |
| `*.db-wal` | ✅ | ❌ | **MISSING** |
| `*.sqlite-shm` | ✅ | ❌ | **MISSING** |
| `*.sqlite-wal` | ✅ | ❌ | **MISSING** |

---

## Additional Recommended Patterns

| Pattern | Reason |
|---------|--------|
| `.playwright-mcp/` | Ephemeral Playwright session artifacts (48 tracked files need cleanup) |
| `*.log` | General log files (if not needed in repo) |

> `.env.example` is already protected by `!.env.example` — it will NOT be ignored. ✅  
> Documentation files (`*.md`) are NOT affected by these patterns. ✅  
> Evidence directories remain versionable. ✅  

---

## Audit Verdict

**`FAIL`** — 8 required DB/backup patterns are missing from `.gitignore`.  

Additionally, `.playwright-mcp/` directory should be added to prevent further ephemeral session artifacts from being tracked.

No existing patterns should be removed — all current entries are valid and intentional.

---

## Remediation Plan

Add the following block to `.gitignore`:

```gitignore
# ============================================================
# Database / backup artifacts — NEVER commit SQLite files
# ============================================================
*.db
*.sqlite
*.sqlite3
*.bak
*.db-shm
*.db-wal
*.sqlite-shm
*.sqlite-wal

# ============================================================
# Playwright session artifacts (ephemeral)
# ============================================================
.playwright-mcp/
```
