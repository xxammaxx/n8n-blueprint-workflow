# Local Secret Structure — New Machine

**Date/Time (UTC):** 2026-06-29T12:35:00Z

## Secrets Directory

| Property | Value |
|----------|-------|
| Path | ~/Spec-kit_n8n/secrets/ |
| Permissions | 700 (drwx------) |
| Owner | xxammaxx:xxammaxx |
| Created | 2026-06-29T12:35:00Z |

## Template Files

### opencode-provider.env

| Property | Value |
|----------|-------|
| Path | ~/Spec-kit_n8n/secrets/opencode-provider.env |
| Permissions | 600 (-rw-------) |
| Content | TEMPLATE ONLY — no real values |
| Git tracked | NO (gitignored via `secrets/` rule) |

**Template content (safe to display — no real values):**
```
OPENCODE_PROVIDER=deepseek
OPENCODE_API_KEY=PASTE_DEEPSEEK_API_KEY_HERE
OPENCODE_MODEL=deepseek/deepseek-v4-pro
OPENCODE_MAX_COST_USD=0.25
OPENCODE_DRY_RUN=true
OPENCODE_ALLOW_PROVIDER_CALL=false
```

## Gitignore Verification

| Check | Result |
|-------|--------|
| `git check-ignore secrets/opencode-provider.env` | YES (ignored) |
| Will be committed | NO |

## Usage Notes

1. **No real values written** — all values are placeholder strings
2. **User must fill in** — DeepSeek API key must be added manually by the user
3. **Never commit** — the `secrets/` directory is in `.gitignore`
4. **No values displayed** — if real values are added locally, they are never shown in logs, evidence, or git

## Status

**GREEN** — Local secret structure created with templates only. No real secrets written. Gitignored correctly.
