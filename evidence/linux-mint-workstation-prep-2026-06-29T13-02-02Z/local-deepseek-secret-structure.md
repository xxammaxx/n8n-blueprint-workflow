# Local DeepSeek Secret Structure

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **File:** `secrets/opencode-provider.env`

## File Status

| Check | Result |
|-------|--------|
| File exists | YES (pre-existing from earlier setup) |
| Permissions (file) | 600 (rw-------) |
| Permissions (directory) | 700 (rwx------) |
| Gitignored | YES (via `secrets/` rule in .gitignore) |
| Provider set | unknown (file not read to avoid exposing values) |
| Model set | unknown (file not read) |
| API Key value displayed | NO |

## File Contents
File was NOT read to protect any pre-existing real values.

From the creation template, expected structure:
```
OPENCODE_PROVIDER=deepseek
OPENCODE_API_KEY=PASTE_DEEPSEEK_API_KEY_HERE
OPENCODE_MODEL=deepseek/deepseek-v4-pro
OPENCODE_MAX_COST_USD=0.25
OPENCODE_DRY_RUN=true
OPENCODE_ALLOW_PROVIDER_CALL=false
```

## Action Required
If not already done, user should paste the real DeepSeek API key into this file, replacing the placeholder.
