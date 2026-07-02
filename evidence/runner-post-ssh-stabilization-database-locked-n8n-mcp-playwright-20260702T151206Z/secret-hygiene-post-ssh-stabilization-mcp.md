# Secret Hygiene — Post-SSH Stabilization + MCP

## Metadata
- **Date/Time:** 2026-07-02T15:20:00Z

## New Files Check

### Evidence Directory
- **Path:** `evidence/runner-post-ssh-stabilization-database-locked-n8n-mcp-playwright-20260702T151206Z/`
- **Secret patterns:** NONE found
- **Status:** CLEAN

### New Documentation
- `docs/MCP_BUILD_PROCESS.md` — 0 real secrets, only concept text

### MCP Templates
- `mcp/mcp.servers.example.json` — `PASTE_` placeholders only
- `mcp/mcp.sse-supergateway.example.json` — `PASTE_` placeholders only

### .gitignore
- Updated to include:
  - `mcp/*.local.json`
  - `.mcp.local.json`
  - `.mcp/`

## Tracked Files Check

| Path | Tracked | Status |
|------|---------|--------|
| `secrets/` | NO | ✅ Protected by .gitignore |
| `*.db`, `*.sqlite` | NO | ✅ Protected by .gitignore |
| `.mcp/`, `.mcp.local.json` | NO | ✅ Protected by .gitignore (new) |
| `mcp/*.local.json` | NO | ✅ Protected by .gitignore (new) |
| `.playwright-mcp/` | **YES** | ⚠️ KNOWN_PREEXISTING_HISTORY_LEAK |

## Known Issue: .playwright-mcp/ History Leak

- **Status:** KNOWN_PREEXISTING_HISTORY_LEAK
- **Files tracked:** 48 files (console logs + page snapshots from June 27, 2026)
- **Content:** JWT tokens and session data from prior Playwright sessions
- **Risk:** Already in Git history, needs `git filter-branch` or `bfg` remediation
- **Blocked:** Cannot remediate in this run (no history rewrite allowed)
- **Mitigation:** `.gitignore` blocks new additions; old files are dormant

## New Leaks

- **New JWTs/API Keys in current files:** NONE
- **New credentials exposed:** NONE
- **New secret files tracked:** NONE

## Status

| Metric | Result |
|--------|--------|
| New evidence secret-clean | ✅ YES |
| New docs secret-clean | ✅ YES |
| MCP templates contain only placeholders | ✅ YES |
| New secret leaks | ✅ NONE |
| Known pre-existing leak | ⚠️ `.playwright-mcp/` in Git history |
| Overall | **CLEAN** for this run |

## Actions

- No commit, no push (history leak blocks Git operations)
- No remediation of history leak in this run
- All new files verified secret-clean
