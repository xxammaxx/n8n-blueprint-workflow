# Dispatch Path Analysis

**Timestamp (UTC):** 2026-06-28T09:28:00Z

## Script Location

| Item | Value |
|------|-------|
| Path | `/opt/dev-fabric/scripts/start_github_issue_run.sh` |
| SHA256 (before) | `94cb24f10ad3ded04f4b19166b98a9209518ce842b4a2d68b76e8eaba088fcd8` |
| Syntax (bash -n) | ✅ SYNTAX_OK |
| Locale Warning | `setlocale: LC_ALL: cannot change locale (en_US.UTF-8)` (non-fatal) |

## OpenCode Call Path Analysis

### Binary Availability
- OpenCode binary: `/opt/dev-fabric/opencode/opencode` (v1.17.9, 166MB)
- Symlink: `/usr/local/bin/opencode` → `/opt/dev-fabric/opencode/opencode`
- `command -v opencode` works when run as `runner` user (via /usr/local/bin in PATH)
- Verified by `have_cmd opencode` returning true in dispatch script

### Provider Environment Loading
- **NOT loaded anywhere in the script** ❌
- The script extracts `OPENCODE_PROVIDER_CONFIGURED` from `RUN_INPUT.json`:
  ```bash
  OPENCODE_PROVIDER_CONFIGURED="$(jq -r '.agent_runtime.opencode_provider_configured // false' "$INPUT_JSON")"
  ```
- This value is set by the n8n dispatcher (flow `Sv12QTo56NoPUu2D`) and is **always `false`**
- The script never independently checks if a provider env file exists locally

### Effective Mode Determination

The critical code path (lines ~135-162):

```bash
case "$MODE" in
  opencode-run)
    if ! $OPENCODE_ACTUALLY_AVAILABLE; then
      MANUAL_REASON="opencode-run requested but opencode is not installed..."
      EFFECTIVE_MODE="manual-terminal"
      AGENT_STATUS="GREEN_PARTIAL"
    elif ! $OPENCODE_PROVIDER_CONFIGURED; then    # ← THIS GATE FAILS
      MANUAL_REASON="opencode-run requested but no LLM provider configured..."
      EFFECTIVE_MODE="manual-terminal"
      AGENT_STATUS="GREEN_PARTIAL"
    elif ! $TMUX_ACTUALLY_AVAILABLE; then
      ...
    else
      EFFECTIVE_MODE="opencode-run"   # ← NEVER REACHED
      AGENT_STATUS="GREEN"
    fi
    ;;
```

### Fallback Sequence for Issue #9

1. Dispatcher set `mode=opencode-run` in RUN_INPUT.json
2. Dispatcher set `opencode_provider_configured=false` in RUN_INPUT.json
3. Script checked `have_cmd opencode` → TRUE (symlink exists)
4. Script checked `OPENCODE_PROVIDER_CONFIGURED` → FALSE (from JSON)
5. Script fell back to `manual-terminal`
6. Agent ran without DeepSeek/OpenCode

### Root Cause

The `start_github_issue_run.sh` script **trusts the dispatcher's value** of `OPENCODE_PROVIDER_CONFIGURED` from `RUN_INPUT.json`. It never independently verifies whether the provider environment is available locally. Since the dispatcher always sets this to `false`, the `manual-terminal` fallback is always triggered even when the provider is fully configured and smoke-tested.

## Detection

| Item | Status |
|------|--------|
| Script Path Found | ✅ Yes |
| SHA256 Before | ✅ Captured |
| Syntax Check | ✅ PASS |
| OpenCode Call Found | ✅ Yes (in mode determination) |
| Provider Env Loaded | ❌ NO |
| Fallback Cause Plausible | ✅ Yes (`OPENCODE_PROVIDER_CONFIGURED=false` from dispatcher) |
| Secret Values Exposed | ❌ NO (never) |

## Proposed Fix Location

Insert provider-env loading block **before** the effective mode determination (before `case "$MODE" in`), so `OPENCODE_PROVIDER_CONFIGURED` is updated to `true` when the provider env is successfully loaded.
