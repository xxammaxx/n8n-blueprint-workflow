# OpenCode Provider API Key Structural Validation

## Local (`secrets/opencode-provider.env`)
- **File exists:** yes
- **Gitignored:** yes
- **Permissions:** 600
- **OPENCODE_PROVIDER:** present
- **OPENCODE_API_KEY:** present
- **DEEPSEEK_API_KEY:** missing (renamed to OPENCODE_API_KEY, expected)
- **OPENCODE_MODEL:** present
- **OPENCODE_MAX_COST_USD:** present
- **OPENCODE_DRY_RUN:** present
- **OPENCODE_ALLOW_PROVIDER_CALL:** present
- **Placeholders:** no

## Runner (`/opt/dev-fabric/secrets/opencode-provider.env`)
- **File exists:** yes
- **OPENCODE_PROVIDER:** present
- **OPENCODE_API_KEY:** present
- **DEEPSEEK_API_KEY:** missing (renamed)
- **OPENCODE_MODEL:** present
- **OPENCODE_MAX_COST_USD:** present
- **OPENCODE_DRY_RUN:** present
- **OPENCODE_ALLOW_PROVIDER_CALL:** present
- **Placeholders:** no

## Drift Check
- **Local/Runner Drift:** none (identical key presence)

## Status
- **OPENCODE_PROVIDER_KEY_STRUCTURALLY_READY**
- **OPENCODE_PROVIDER_ENV_MISSING:** false (both present)
- **OPENCODE_PROVIDER_KEY_PLACEHOLDER:** false
- **RED_SECRET_VISIBLE:** false (no values shown)
