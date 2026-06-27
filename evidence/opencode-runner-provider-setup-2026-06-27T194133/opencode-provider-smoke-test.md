# OpenCode Provider Smoke Test

**Timestamp:** 2026-06-27T19:54:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  

---

## Smoke Test Script

| Item | Value |
|------|-------|
| Path | `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh` |
| Permissions | `-rwxr-xr-x` (755) |
| Owner | runner:runner |
| Syntax valid | YES (bash -n passed) |

## Test Stages

### Stage 1: OpenCode Version
- Runs `opencode --version`
- Result: **VERSION_OK** (v1.17.9) ✅

### Stage 2: Secret Loader
- Executes `load-opencode-provider-env.sh`
- Reports which variables are loaded vs. placeholder
- Current result: **PLACEHOLDER_DETECTED** (expected)

### Stage 3: Provider Configuration
- Checks if OPENCODE_PROVIDER and OPENCODE_MODEL are set
- Current result: **NO** (placeholders)

### Stage 4: Provider Model List (Read-Only)
- Only runs if provider is configured AND `OPENCODE_ALLOW_PROVIDER_CALL=true`
- Calls `opencode models <provider>` (read-only metadata query)
- Current status: **BLOCKED** — `OPENCODE_ALLOW_PROVIDER_CALL` not set
- Status code: `SMOKE_READY_PROVIDER_CALL_BLOCKED_BY_POLICY`

### Stage 5: Provider Hello Test
- Only runs if provider is configured AND `OPENCODE_ALLOW_PROVIDER_CALL=true`
- Placeholder for actual minimal inference test
- Current status: **BLOCKED** by policy

## Run Result (with placeholders)

```
==========================================
 OpenCode Provider Smoke Test
 Timestamp: 2026-06-27T20:21:31Z
==========================================

--- Stage 1: OpenCode Version ---
1.17.9
Result: VERSION_OK

--- Stage 2: Secret Loader ---
OPENCODE_DRY_RUN: loaded
OPENCODE_MAX_COST_USD: loaded
OPENCODE_PROVIDER: placeholder (value not configured)
OPENCODE_API_KEY: placeholder (value not configured)
OPENCODE_MODEL: placeholder (value not configured)
SECRET_STATUS: api_key_present=false
Loader exit code: 2
Loader Result: PLACEHOLDER_DETECTED

--- Stage 3: Provider Configuration ---
Provider set: NO (placeholder or not configured)
Model set: NO (placeholder or not configured)

--- Stage 4: Provider Model List ---
Provider not configured. Skipping model list.
Status: SMOKE_READY_NO_PROVIDER

--- Stage 5: Provider Hello Test ---
Hello test BLOCKED by policy.
Set OPENCODE_ALLOW_PROVIDER_CALL=true to enable.
```

## Safety Controls

| Control | Status |
|---------|--------|
| No GitHub issue modification | ✅ Guaranteed (script doesn't touch gh) |
| No repo modification | ✅ Guaranteed |
| No n8n modification | ✅ Guaranteed |
| No runner execution against real issues | ✅ Guaranteed |
| External LLM calls blocked | ✅ `OPENCODE_ALLOW_PROVIDER_CALL` gate |
| Cost limit | ✅ `OPENCODE_MAX_COST_USD=0.25` |
| Dry-run mode | ✅ `OPENCODE_DRY_RUN=true` |

## How to Enable Full Smoke Test

1. Configure real values in `/opt/dev-fabric/secrets/opencode-provider.env`
2. Set `OPENCODE_ALLOW_PROVIDER_CALL=true` (environment or in the env file)
3. Run: `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh`
