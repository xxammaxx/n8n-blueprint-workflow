# DeepSeek Provider Readiness Decision

**Timestamp (UTC):** 2026-06-28T09:00:00Z

## Readiness Checks

| Check | Status | Detail |
|-------|--------|--------|
| Provider set to `deepseek-direct` | ✅ | Secret file updated, loader confirmed |
| Direct DeepSeek API key present | ✅ | `sk-` prefixed key, validated by loader |
| Base URL validated | ✅ | `https://api.deepseek.com/v1` (confirmed via official docs) |
| Model validated | ✅ | `deepseek-v4-pro` (validated via api-docs.deepseek.com) |
| Loader successful | ✅ | All 7 vars loaded, DEEPSEEK_API_KEY mapped |
| Smoke script updated | ✅ | Supports `deepseek-direct` provider type |
| Secret hygiene | ✅ | 600 perms, runner:runner, no leaks |
| `OPENCODE_ALLOW_PROVIDER_CALL` | 🟡 | Set to `true` in secret file |
| Cost limit set | ✅ | `OPENCODE_MAX_COST_USD=0.25` |
| Dispatcher unchanged | ✅ | Confirmed |
| Issues #3-#8 protected | ✅ | Confirmed |
| opencode.json deployed | ✅ | `/home/runner/.config/opencode/opencode.json`, custom `deepseek-direct` provider configured |

## Decision

### READY_FOR_DEEPSEEK_SMOKE

All preconditions for a DeepSeek provider smoke test are met:
- ✅ Correct provider type (`deepseek-direct` custom provider)
- ✅ Direct DeepSeek API key present
- ✅ Base URL validated
- ✅ Model validated
- ✅ Loader works
- ✅ Smoke script supports direct DeepSeek
- ✅ Secret hygiene green
- ✅ `OPENCODE_ALLOW_PROVIDER_CALL=true`
- ✅ Cost limit set

## Key Distinction Documented

| Provider | Key Type | Endpoint | Status |
|----------|----------|----------|--------|
| `opencode-go` | OpenCode Platform Key | `opencode.ai/zen/v1` | ❌ Rejects DeepSeek keys |
| `deepseek-direct` (custom) | DeepSeek API Key | `api.deepseek.com/v1` | ✅ Ready for smoke |

## Next Step
Run DeepSeek smoke test: `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh`
