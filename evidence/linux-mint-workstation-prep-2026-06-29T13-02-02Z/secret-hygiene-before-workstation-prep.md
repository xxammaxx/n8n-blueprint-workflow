# Secret Hygiene — Before Workstation Prep

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Run:** linux-mint-workstation-prep

## Tracked Secret Paths Check

| Check | Result |
|-------|--------|
| `secrets/` tracked in git | NO (correctly gitignored) |
| `.env.local` tracked in git | NO (not present, gitignored) |
| `.playwright-mcp/` tracked in git | YES — 48 files tracked |
| `.db` files tracked | NO |
| `.sqlite` files tracked | NO |
| `.bak` files tracked | NO |
| Database shm/wal files tracked | NO |

## Tracked File Secret Pattern Scan

**Patterns searched:** JWT tokens (`eyJ...`), OpenAI keys (`sk-...`), GitHub PATs (`ghp_...`, `github_pat_...`)

### Result: KNOWN SECRET LEAK — PREVIOUSLY ACKNOWLEDGED

**File:** `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log`
**Finding:** Contains n8n JWT token in URL parameters (both `api_key=` and `token=` query params)
**Context:** This is the previously documented security incident — "früherer n8n JWT/API/Auth Token Leak in `.playwright-mcp/`"
**Mitigation status:**
- Token was revoked on old setup (per task briefing)
- Active n8n session was terminated
- API Key `spec-kit_n8n` was revoked on old setup
- History rewrite to remove `.playwright-mcp/` from git history is planned separately
- `.playwright-mcp/` is already listed in `.gitignore` (line 40)

### Secret Values in Evidence
- **Secret values displayed in this document:** NO
- **Token/JWT values reproduced:** NO
- **API key values reproduced:** NO

## Hygiene Status
- **Status:** `RED_SECRET_LEAK` — but KNOWN and PREVIOUSLY DOCUMENTED incident, tokens revoked
- **New leaks found:** NO — all matches are the previously known incident
- **Immediate action required:** NO — tokens already revoked; history rewrite planned separately
- **Blocking further setup:** NO — known incident, mitigated

## Notes
- The 48 tracked `.playwright-mcp/` files are a clone artifact from the old machine. They need history rewrite (separate task).
- No new secret leaks were discovered beyond the acknowledged incident.
- `.gitignore` properly excludes `secrets/`, `.env.local`, `.playwright-mcp/`, and database artifacts.
