# Phase 2 — Secret Hygiene Before Operational Readiness

## UTC Timestamp: 2026-06-29T14:00:47Z

## Tracked Sensitive Files Check

| Pattern | Status | Notes |
|---------|--------|-------|
| `secrets/` | **NOT tracked** | Properly gitignored ✅ |
| `.env.local` | **NOT tracked** | Properly gitignored ✅ |
| `.playwright-mcp/` | **TRACKED** | KNOWN INCIDENT — 48 files tracked (console logs + page YAMLs), pre-date `.gitignore` update |
| `*.db` / `*.sqlite` | **NOT tracked** | Properly gitignored ✅ |
| `*.bak` / `*.sqlite-shm` / `*.sqlite-wal` | **NOT tracked** | Properly gitignored ✅ |

## Secret/Token Pattern Scan (tracked files)

| Pattern | Result |
|---------|--------|
| JWT (`eyJ...`) | **FOUND** in `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log` (6 occurrences) |
| OpenAI key (`sk-...`) | Not found |
| GitHub PAT (`ghp_...`) | Not found |
| GitHub fine-grained PAT (`github_pat_...`) | Not found |
| n8n API key (`n8n_api_...`) | Reference only (boolean check in `evidence/api-readiness-preflight.md`) |

## Analysis

### Known Playwright JWT Leak
- The `.playwright-mcp/` directory was committed to git **before** it was added to `.gitignore`
- Contains 48 tracked files (console logs with JWTs in URLs, page state YAMLs)
- The JWTs found belong to n8n public API tokens (`aud: "public-api"`)
- **Mitigation confirmed:** The user has revoked the old n8n API key
- **Constraint:** No history rewrite, no `git rm --cached` per user instructions
- These leaked JWTs are **invalid/revoked**

### No New Secrets
- No currently-valid API keys, tokens, or credentials found in tracked files
- `secrets/` directory properly excluded from tracking
- Database/backup artifacts properly excluded

## Status
**HISTORICAL_LEAK_DOCUMENTED_MITIGATED** — Known `.playwright-mcp/` JWT leak is tracked but the leaked API key has been revoked. No new, active secrets found.
