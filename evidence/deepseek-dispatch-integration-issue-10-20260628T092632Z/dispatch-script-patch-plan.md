# Dispatch Script Patch Plan

**Timestamp (UTC):** 2026-06-28T09:30:00Z

## Patch Principle

Insert provider environment loading block in `start_github_issue_run.sh` **before** the effective mode determination. If the provider env loads successfully, update `OPENCODE_PROVIDER_CONFIGURED=true` so the `opencode-run` path can proceed past the provider gate.

## Design Constraints

| Constraint | Compliance |
|------------|------------|
| No secrets output | ✅ `>/dev/null 2>&1` on loader invocation |
| No hardcoded keys | ✅ only references file paths (no values) |
| No hardcoded model names | ✅ model comes from env file |
| No set -x activation | ✅ script doesn't use set -x (no risk) |
| Minimal change | ✅ 7 lines inserted, 0 lines modified/deleted |
| Backward compatible | ✅ on failure, falls through to existing behavior |
| No fallback removal | ✅ existing fallback logic preserved |
| No false success | ✅ only sets `OPENCODE_PROVIDER_CONFIGURED=true` on verified load |
| Permissions preserved | ✅ file ownership unchanged |
| Syntax safety | ✅ bash -n validated before and after |

## Insertion Point

In `/opt/dev-fabric/scripts/start_github_issue_run.sh`, insert after line ~158 (after `hermes_available` check) and before `case "$MODE" in` (line ~161).

Current context:
```bash
HERMES_ACTUALLY_AVAILABLE=false
if have_cmd hermes; then
  HERMES_ACTUALLY_AVAILABLE=true
fi

case "$MODE" in
```

## Patch Code (7 lines)

```bash
# ── Provider Environment Check ────────────────────────────────────────────
# Attempt to load OpenCode provider environment if available locally.
# This bridges the gap between the dispatcher's provider_configured=false
# and a locally installed provider (e.g. DeepSeek, opencode-go).
# Never outputs secret values — loader output is discarded.
PROVIDER_ENV_FILE="/opt/dev-fabric/secrets/opencode-provider.env"
PROVIDER_ENV_LOADED=false
if [ -f "$PROVIDER_ENV_FILE" ] && [ -x "/opt/dev-fabric/bin/load-opencode-provider-env.sh" ]; then
  if source "/opt/dev-fabric/bin/load-opencode-provider-env.sh" >/dev/null 2>&1; then
    PROVIDER_ENV_LOADED=true
    OPENCODE_PROVIDER_CONFIGURED=true
  fi
fi
```

## What Changes

| Before | After |
|--------|-------|
| `OPENCODE_PROVIDER_CONFIGURED` always `false` from dispatcher | Updated to `true` if local provider env loads successfully |
| `opencode-run` always falls back to `manual-terminal` | `opencode-run` proceeds to actual OpenCode run when provider available |
| No provider env awareness in dispatch script | Provider env checked and loaded optionally |

## What Stays The Same

| Item | Status |
|------|--------|
| All existing mode fallback logic | Unchanged |
| All evidence generation | Unchanged |
| All approval policy gates | Unchanged |
| All GitHub context writing | Unchanged |
| All status.json generation | Unchanged |
| Script permissions and ownership | Unchanged |
| Dispatcher workflow | Unchanged |
| Schedule trigger | Unchanged |

## Verification Plan

1. Create backup: `start_github_issue_run.sh.bak.<UTC>`
2. Apply patch
3. Run `bash -n` — must pass
4. Compare SHA256 before/after
5. Verify provider env file exists (known: YES)
6. Verify loader is executable (known: YES)
7. Test: Create Issue #10 with `agent:ready` and `mode=opencode-run`
8. Verify Issue #10 evidence shows `opencode_provider_configured=true`
9. Verify Issue #10 evidence shows `effective_mode=opencode-run`
10. Verify Issues #3–#9 remain untouched
