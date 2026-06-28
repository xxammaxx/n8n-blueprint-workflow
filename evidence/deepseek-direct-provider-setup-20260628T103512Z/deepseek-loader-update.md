# DeepSeek Loader Update

**Timestamp (UTC):** 2026-06-28T09:05:00Z

## Changes to `/opt/dev-fabric/bin/load-opencode-provider-env.sh`

### New Variables Supported
The loader now supports:
- `OPENCODE_BASE_URL` — DeepSeek API endpoint
- Provider name `deepseek-direct` (custom provider)
- Export of `DEEPSEEK_API_KEY` from `OPENCODE_API_KEY` for AI SDK compatibility

### Loader Behavior
1. Source `/opt/dev-fabric/secrets/opencode-provider.env`
2. Export all variables to the environment
3. Map `OPENCODE_API_KEY` → `DEEPSEEK_API_KEY` (needed for `@ai-sdk/openai-compatible` custom provider)
4. Validate and report status (Booleans only, no secret values)

### Loader Output (Safe)
```
OPENCODE_PROVIDER loaded: yes
OPENCODE_API_KEY loaded: yes
OPENCODE_MODEL loaded: yes
OPENCODE_BASE_URL loaded: yes
OPENCODE_DRY_RUN loaded: yes
OPENCODE_MAX_COST_USD loaded: yes
OPENCODE_ALLOW_PROVIDER_CALL loaded: yes
DEEPSEEK_API_KEY loaded: yes (mapped from OPENCODE_API_KEY)
SECRET_STATUS: api_key_present=true
```

### Key Mapping Logic
```bash
# Map project env var to AI SDK env var for custom provider auth
if [[ -n "${OPENCODE_API_KEY:-}" ]] && ! has_placeholder "${OPENCODE_API_KEY:-}"; then
    export DEEPSEEK_API_KEY="${OPENCODE_API_KEY}"
fi
```

### Root Access Note
The loader sources the secret file which is owned by `runner:runner` with `600` permissions. When run via `pct exec` as root, the loader must be invoked with proper user context or the file must be readable.

### Validation
- All 7 variables reported as "loaded" or "placeholder"
- `SECRET_STATUS` reports `api_key_present=true/false`
- Exit codes: 0 = ALL_LOADED, 2 = PLACEHOLDER, 3 = EMPTY
