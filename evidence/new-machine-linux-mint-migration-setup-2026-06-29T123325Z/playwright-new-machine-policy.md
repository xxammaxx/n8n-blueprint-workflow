# Playwright New Machine Policy

**Date/Time (UTC):** 2026-06-29T12:36:00Z

## Current State on New Machine

| Check | Result |
|-------|--------|
| .playwright-mcp/ exists locally | YES (from git clone) |
| Tracked in git | YES (48 files) |
| Gitignored (new files) | YES (rule exists in .gitignore) |
| Contains old secrets | YES (known, token revoked) |

## Policy: Old Artifacts NOT Transferred

The `.playwright-mcp/` directory on the new machine came from the git clone — it contains artifacts from the OLD Windows machine's Playwright sessions:

- Console logs from June 27, 2026
- Page YAML snapshots from June 27, 2026
- These contain the previously leaked (now revoked) n8n tokens/JWTs

### What We Do NOT Do

- ❌ Do NOT use old Playwright sessions
- ❌ Do NOT copy old browser sessions from the old machine
- ❌ Do NOT re-use old screenshots containing tokens
- ❌ Do NOT commit new .playwright-mcp/ files
- ❌ Do NOT dump old .playwright-mcp/ content to evidence

### What We DO

- ✅ Document that old artifacts exist (this file)
- ✅ Create fresh Playwright sessions on Linux Mint if needed
- ✅ Use .gitignore to prevent new artifacts from being tracked

### For Future Playwright Use

If Playwright visual testing is needed on the new Linux Mint machine:
1. Install Playwright fresh: `npx playwright install`
2. Create a new session (no old browser state)
3. Store screenshots only in designated directories
4. Never capture pages with visible tokens/credentials
5. Never commit session files

## Status

**POLICY_ENFORCED** — Old Playwright artifacts from Windows machine are present in git history but are NOT to be used. Fresh sessions must be created on Linux Mint if needed.
