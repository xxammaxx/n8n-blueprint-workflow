# Secret Hygiene Report — After Runner SSH Readiness Check

**UTC Timestamp:** 2026-06-29T15:32:01Z  
**Session:** linux-mint-runner-ssh-readiness-validation  
**Agent:** Issue Orchestrator (read-only validation)

---

## Overall Status: **RED_SECRET_LEAK**

---

## Check 1: Sensitive Tracked Files

### `.playwright-mcp/` — TRACKED (48 files)

| File Type | Count | Status |
|-----------|-------|--------|
| Console logs (`.log`) | 19 | **TRACKED — CONTAINS SECRETS** |
| Page snapshots (`.yml`) | 29 | TRACKED |

**Detail:** `.playwright-mcp/` is listed in `.gitignore` (line 40), but the directory was committed to git **before** the gitignore rule was added. Once tracked, gitignore does not retroactively untrack files.

### Other Sensitive Patterns

| Pattern | Result |
|---------|--------|
| `secrets/` tracked | **NO** (0 files) |
| `.env.local` tracked | **NO** (0 files) |
| Database files (`.db`, `.sqlite`, `.sqlite3`, `.bak`, etc.) | **NO** (0 files) |

---

## Check 2: Real Secrets in Tracked Files (JWT / API Key / Token Patterns)

| Search Pattern | Files Found | File Count |
|----------------|-------------|------------|
| JWT tokens (`eyJ...`) | `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log` | **1 file, 7 occurrences** |
| OpenAI keys (`sk-...`) | None | 0 |
| GitHub tokens (`ghp_...`) | None | 0 |
| GitHub PAT (`github_pat_...`) | None | 0 |

### JWT Finding Details

- **Location:** `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log`
- **Occurrences:** 7 instances of the same n8n JWT token
- **Context:** Browser console log captured during a Playwright session. The JWT appears as URL parameters (`?api_key=...` and `?token=...`) in n8n workflow URLs and login redirects.
- **Token Type:** n8n public API JWT (issuer: `n8n`, audience: `public-api`)
- **Token origin:** n8n session from `192.168.1.52:5678`
- **Commit date:** June 27, 2026 (in git history)

---

## Secret Values Output

| Question | Answer |
|----------|--------|
| Were secret values deliberately output in this report? | **NO** |
| Were secret values previously exposed in git history? | **YES** (via `.playwright-mcp/` console logs committed June 27) |
| Is the JWT still potentially valid? | Unknown — expiry check not performed in this read-only session |

---

## Assessment

### Severity: HIGH

Real n8n JWT tokens are tracked in git history. The `.playwright-mcp/` directory was committed before the `.gitignore` rule was in place.

### Mitigation Required (NOT PERFORMED — READ-ONLY SESSION)

The following actions are recommended but were NOT performed in this session:
1. `git rm --cached -r .playwright-mcp/` to untrack the directory
2. Verify `.gitignore` has `.playwright-mcp/` (confirmed: YES, line 40)
3. Rotate the exposed n8n JWT if still valid
4. Consider `git filter-branch` or BFG to remove from history (high effort)

### Why Not Fixed Now

Per session constraints:
- Kein `git rm --cached`
- Kein History Rewrite
- Keine Runtime-Änderungen
- Read-only validation only

---

## Verdict

| Component | Status |
|-----------|--------|
| `secrets/` tracked | **SAFE** |
| Database files tracked | **SAFE** |
| `.env.local` tracked | **SAFE** |
| `.playwright-mcp/` tracked | **RED — 48 files, 1 contains JWTs** |
| API Keys in tracked files | **SAFE** (no `sk-`, `ghp_`, `github_pat_`) |
| JWTs in tracked files | **RED — n8n JWT in console log** |
| Overall Secret Hygiene | **RED_SECRET_LEAK** |
