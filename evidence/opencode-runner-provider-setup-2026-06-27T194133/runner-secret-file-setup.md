# Runner Secret File Setup

**Timestamp:** 2026-06-27T19:50:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  

---

## Secret File Location

| Item | Value |
|------|-------|
| Path | `/opt/dev-fabric/secrets/opencode-provider.env` |
| Created | 2026-06-27T20:18 UTC |
| Existed before | NO — newly created |

## File Status

| Check | Result |
|-------|--------|
| File exists | YES |
| Permissions | `-rw-------` (600) |
| Owner | runner:runner |
| Group readable | NO |
| World readable | NO |
| Directory | `/opt/dev-fabric/secrets/` — runner:runner, 755 |

## Content Status

| Variable | Status |
|----------|--------|
| OPENCODE_PROVIDER | PLACEHOLDER (`PASTE_PROVIDER_NAME_HERE`) |
| OPENCODE_API_KEY | PLACEHOLDER (`PASTE_PROVIDER_API_KEY_HERE`) |
| OPENCODE_MODEL | PLACEHOLDER (`PASTE_MODEL_NAME_HERE`) |
| OPENCODE_MAX_COST_USD | SET (`0.25`) |
| OPENCODE_DRY_RUN | SET (`true`) |
| API-Key real | NO (placeholder only) |
| API-Key output in evidence | NO |

## Template Content

The file contains ONLY placeholder values. The user must replace:
- `PASTE_PROVIDER_NAME_HERE` → actual provider (e.g., `deepseek`)
- `PASTE_PROVIDER_API_KEY_HERE` → actual API key
- `PASTE_MODEL_NAME_HERE` → actual model (e.g., `deepseek-v4-pro`)

Safety features:
- `OPENCODE_MAX_COST_USD=0.25` — cost limit enforced
- `OPENCODE_DRY_RUN=true` — dry-run mode by default

## Git Protection

The runner does not currently have a `.gitignore` file. The secrets directory is outside any git repository scope. Recommendation: add `/opt/dev-fabric/.gitignore` with `secrets/` pattern.

## Next Step for User

1. Edit `/opt/dev-fabric/secrets/opencode-provider.env` on the runner
2. Replace the three PLACEHOLDER values with real credentials
3. Keep permissions at 600
4. Do NOT commit this file to any repository
