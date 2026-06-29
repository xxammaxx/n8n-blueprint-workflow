# Dispatch Script — After Patch

**Timestamp (UTC):** 2026-06-28T09:31:00Z

## Patch Summary

| Item | Value |
|------|-------|
| Script Path | `/opt/dev-fabric/scripts/start_github_issue_run.sh` |
| Backup Created | ✅ YES (`start_github_issue_run.sh.bak.20260628T093029Z`) |
| Backup Size | 16,725 bytes |
| Patched Size | 17,379 bytes (+654 bytes) |
| Patch Applied | ✅ YES |
| Syntax Check | ✅ SYNTAX_OK |
| Provider Loader Call | ✅ YES (line 215-227) |
| Secret Values Exposed | ❌ NO |

## SHA256

| State | Hash |
|-------|------|
| Before | `94cb24f10ad3ded04f4b19166b98a9209518ce842b4a2d68b76e8eaba088fcd8` |
| After | `55d1802b7327fba749bc7a8d52c67e3c24d3e00627234b66a781c33aadd0f142` |

## Inserted Block (lines 215-227)

```bash
# --- Provider Environment Check ---
# Attempt to load OpenCode provider environment if available locally.
# This bridges the gap between dispatcher provider_configured=false
# and a locally installed provider (e.g. DeepSeek, opencode-go).
# Never outputs secret values -- loader output is discarded.
PROVIDER_ENV_FILE="/opt/dev-fabric/secrets/opencode-provider.env"
PROVIDER_ENV_LOADED=false
if [ -f "$PROVIDER_ENV_FILE" ] && [ -x "/opt/dev-fabric/bin/load-opencode-provider-env.sh" ]; then
  if source "/opt/dev-fabric/bin/load-opencode-provider-env.sh" >/dev/null 2>&1; then
    PROVIDER_ENV_LOADED=true
    OPENCODE_PROVIDER_CONFIGURED=true
  fi
fi
```

## Insertion Context

- **Before:** `HERMES_ACTUALLY_AVAILABLE` check (lines 210-213)
- **After:** `case "$MODE" in` (line 229)
- **Position:** Between tool availability checks and mode determination — correct

## Patch Characteristics

| Feature | Status |
|---------|--------|
| No secrets in code | ✅ Only file paths, no values |
| No hardcoded provider | ✅ Provider name from env file |
| No hardcoded model | ✅ Model name from env file |
| No set -x risk | ✅ Script doesn't use set -x |
| Output suppressed | ✅ `>/dev/null 2>&1` on loader |
| Optional loading | ✅ Falls through silently on failure |
| Original logic preserved | ✅ No lines modified, only inserted |
| Backup exists | ✅ Yes |
