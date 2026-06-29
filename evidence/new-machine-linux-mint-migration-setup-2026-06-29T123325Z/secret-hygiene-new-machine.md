# Secret Hygiene — New Machine Validation

**Date/Time (UTC):** 2026-06-29T12:34:00Z

## Tracked Sensitive Files Check

### Glob Pattern Scan

| Pattern | Match Count | Status |
|---------|-------------|--------|
| ^secrets/ | 0 | CLEAN |
| .env.local | 0 | CLEAN |
| ^.playwright-mcp/ | 48 | KNOWN_LEAK (pre-existing) |
| .db, .sqlite, .bak, etc. | 0 | CLEAN |

## JWT/Token Pattern Scan

| File | Match Count | Status |
|------|-------------|--------|
| .playwright-mcp/console-2026-06-27T06-36-53-859Z.log | 7 matches (pattern: eyJ...) | KNOWN_LEAK (token revoked) |

**IMPORTANT:** No actual token values are displayed here. The matching file is the known `.playwright-mcp/` incident. The token found was already revoked per remediation plan (evidence/secret-remediation-after-token-rotation-20260629T110937Z/).

## Credential Pattern Scan

Files with credential-like patterns (apiKey, token, secret, password, credential):
- `.playwright-mcp/` files (console logs, page YAMLs) — expected: contain redacted/invalidated tokens
- `exports/` JSON workflow exports — expected: contain workflow configuration, no live credentials
- `n8n-signin-snapshot.md` — placeholder, no live credentials
- `scripts/` — PowerShell credential helpers (for old Windows machine), no live secrets

## .gitignore Status

| Pattern | Ignored? | Notes |
|---------|----------|-------|
| `.env.local` | YES | |
| `secrets/` | YES | |
| `.playwright-mcp/` | YES (new files only) | Already-tracked files NOT removed yet |
| `*.db`, `*.sqlite`, `*.bak` | YES | |
| `*.db-shm`, `*.db-wal` | YES | |

## Summary

| Check | Result |
|-------|--------|
| No new secret leaks | YES |
| No local secrets tracked | YES |
| Pre-existing .playwright-mcp/ tracked | YES (known, token revoked) |
| History rewrite pending | YES (separate task) |
| Secret values output | NO |

## Status

**YELLOW_KNOWN_PREEXISTING** — `.playwright-mcp/` files with revoked tokens remain in git history. This is a known, documented condition. The API key was revoked. Full history rewrite is a separate task. No NEW leaks detected on the new machine.
