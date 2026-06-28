# Local OpenCode Credential Discovery — CORRECTED Evidence

## Discovery Re-run (after placeholder detection fix)
- **Timestamp**: 2026-06-28T06:16:08Z
- **Fixed**: Added `PASTE_YOUR_` and `PASTE_` to placeholder detection patterns

## Corrected Results

### Section 1: Environment Variables
- No OpenCode credential variables set in environment (Process, User, or Machine scope)
- No provider-specific keys found

### Section 2: Local Config Paths
- `USERPROFILE\.config\opencode`: present, config has model set but no provider
- No API keys in config

### Section 3: Project Paths
- `.env.local`: present, no OpenCode credential keys
- `secrets/opencode-provider.env`: present, but **ALL VALUES ARE PLACEHOLDERS**
  - OPENCODE_PROVIDER: placeholder=YES (starts with PASTE_)
  - OPENCODE_API_KEY: placeholder=YES (starts with PASTE_)
  - OPENCODE_MODEL: placeholder=YES (starts with PASTE_)

## Final Status

| Field | Value |
|-------|-------|
| Credential found | no (placeholders only) |
| Provider present | no |
| API Key present | no |
| Model present | yes (from config file only) |
| Status | CREDENTIAL_NOT_FOUND — no real credentials available |
| Secret values output | NEVER |

## Root Cause Analysis
The initial discovery (before fix) incorrectly classified `PASTE_YOUR_*` values as real credentials because the placeholder detection list was incomplete. The copy script's `Test-IsPlaceholder` function correctly identified them by checking for `StartsWith("PASTE_")`.

## Impact
- No real OpenCode credentials exist locally to transfer
- The local `secrets/opencode-provider.env` file contains template/placeholder values only
- Provider smoke test CANNOT proceed (no real API key)
- Runner transfer would be meaningless (placeholders)
