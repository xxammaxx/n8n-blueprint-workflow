# Runner Provider Env Structure

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z

## File
- **Path:** `/opt/dev-fabric/secrets/opencode-provider.env`
- **Lines:** 14
- **Placeholders:** NO — all values are real (contents NOT read)

## Key Presence

| Key | Status |
|-----|--------|
| `OPENCODE_PROVIDER` | present |
| `OPENCODE_API_KEY` | present |
| `DEEPSEEK_API_KEY` | missing |
| `OPENCODE_MODEL` | present |
| `OPENCODE_MAX_COST_USD` | present |
| `OPENCODE_DRY_RUN` | present |
| `OPENCODE_ALLOW_PROVIDER_CALL` | present |

## Assessment
- All critical keys are present
- `DEEPSEEK_API_KEY` is missing (not needed for current provider)
- No placeholders — configuration appears to have real values
- Dry-run and cost limit configured

## Status
- **RUNNER_PROVIDER_ENV_READY** — structurally complete
- No values exposed
- No placeholder gap

## Secrets
- **Key values:** NOT read, NOT displayed
- Only key names checked
