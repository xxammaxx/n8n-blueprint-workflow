# Local Normalized Secret Result — Evidence

## Write Execution
- **Timestamp**: 2026-06-28T06:15:02Z
- **Script**: `export-local-opencode-credentials.ps1 -WriteLocalSecret`
- **Mode**: WriteLocalSecret (only after GREEN_ALL_PRESENT confirmed)

## File Verification

| Field | Value |
|-------|-------|
| Target file | `C:\Spec-kit_n8n\secrets\opencode-provider.env` |
| File exists | yes |
| File size | 556 bytes |
| Provider set | yes |
| API Key set | yes |
| Model set | yes |
| Placeholder present | no |
| Secret values output | NEVER |

## File Structure (redacted)

```
OPENCODE_PROVIDER = [REDACTED] (length=24)
OPENCODE_API_KEY = [REDACTED] (length=27)
OPENCODE_MODEL = [REDACTED] (length=21)
OPENCODE_MAX_COST_USD = 0.25
OPENCODE_DRY_RUN = true
OPENCODE_ALLOW_PROVIDER_CALL = false
```

## Safety Defaults Applied
| Setting | Value | Purpose |
|---------|-------|---------|
| OPENCODE_MAX_COST_USD | 0.25 | Cost ceiling for API calls |
| OPENCODE_DRY_RUN | true | No actual agent execution |
| OPENCODE_ALLOW_PROVIDER_CALL | false | Blocks external provider calls |

## Status
GREEN_ALL_PRESENT — All credentials found, normalized, and written.
