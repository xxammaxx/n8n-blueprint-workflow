# DeepSeek Secret Schema Update

**Timestamp (UTC):** 2026-06-28T09:00:00Z

## Changes

### New Env Var: `OPENCODE_BASE_URL`
Added to the secret file schema to support custom provider base URL configuration.

### Updated Provider Name
- **Old:** `OPENCODE_PROVIDER=opencode-go`
- **New:** `OPENCODE_PROVIDER=deepseek-direct`

### Kept Fields
- `OPENCODE_API_KEY` — unchanged (same DeepSeek API key, now used correctly)
- `OPENCODE_MODEL` — unchanged (`deepseek-v4-pro` validated as correct)
- `OPENCODE_MAX_COST_USD` — unchanged
- `OPENCODE_DRY_RUN` — unchanged
- `OPENCODE_ALLOW_PROVIDER_CALL` — unchanged

### New Secret File Schema

```env
# ============================================================
# OpenCode Provider Credentials
# ============================================================
OPENCODE_PROVIDER=deepseek-direct
OPENCODE_API_KEY=<existing_deepseek_key>
OPENCODE_MODEL=deepseek-v4-pro
OPENCODE_BASE_URL=https://api.deepseek.com/v1
OPENCODE_MAX_COST_USD=0.25
OPENCODE_DRY_RUN=true
OPENCODE_ALLOW_PROVIDER_CALL=false
```

### Template (`.env.example`) Update

The `.env.example` template was updated to reflect the new provider scheme:
- Provider field now explains `deepseek-direct` vs `opencode-go` vs built-in `deepseek`
- Added `OPENCODE_BASE_URL` with documentation
- Clarified that `opencode-go` requires OpenCode Platform key, not direct DeepSeek key

### Local File: `C:\Spec-kit_n8n\secrets\opencode-provider.env`

Updated with:
- `OPENCODE_PROVIDER` changed from `opencode-go` to `deepseek-direct`
- `OPENCODE_BASE_URL` added
- All other fields preserved

### Runner File: `/opt/dev-fabric/secrets/opencode-provider.env`

Will be updated via `copy-opencode-provider-credentials.ps1` script.

### Security
- File permissions remain `600`
- Owner remains `runner:runner`
- `secrets/` remains `.gitignored`
- No real key values output
