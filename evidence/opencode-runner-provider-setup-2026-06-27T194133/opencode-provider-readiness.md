# OpenCode Provider Readiness Decision

**Timestamp:** 2026-06-27T20:00:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  

---

## Decision

**STATUS: `GREEN_PARTIAL_SECRET_PLACEHOLDER`**

## Rationale

The infrastructure for secure OpenCode provider configuration is fully in place, but the actual credentials (API key, provider name, model name) are still placeholders.

## Checklist

| Criterion | Status | Detail |
|-----------|--------|--------|
| OpenCode installed | ✅ YES | v1.17.9 at /opt/dev-fabric/opencode/opencode |
| Secret file exists | ✅ YES | /opt/dev-fabric/secrets/opencode-provider.env |
| Secret file permissions | ✅ CORRECT | 600, runner:runner |
| Secret file directory | ✅ SECURE | 755, runner:runner |
| API key present (real) | ❌ NO | Placeholder: `PASTE_PROVIDER_API_KEY_HERE` |
| Provider set (real) | ❌ NO | Placeholder: `PASTE_PROVIDER_NAME_HERE` |
| Model set (real) | ❌ NO | Placeholder: `PASTE_MODEL_NAME_HERE` |
| Loader script works | ✅ YES | Exit code 2 (PLACEHOLDER) — correct behavior |
| Smoke test script works | ✅ YES | All 5 stages execute, external calls blocked |
| Secret hygiene | ✅ GREEN | 0 real secrets in Git/Evidence/Scripts |
| Provider call allowed | ❌ NO | `OPENCODE_ALLOW_PROVIDER_CALL` not set |
| Cost limit configured | ✅ YES | `OPENCODE_MAX_COST_USD=0.25` |
| Dry-run configured | ✅ YES | `OPENCODE_DRY_RUN=true` |

## Why Not READY_FOR_PROVIDER_SMOKE

Three blockers prevent promotion to `READY_FOR_PROVIDER_SMOKE`:

1. **API Key is placeholder** — The user must provide a real provider API key
2. **Provider name is placeholder** — The user must specify which provider (e.g., `deepseek`)
3. **Model name is placeholder** — The user must specify which model (e.g., `deepseek-v4-pro`)

Once these three values are filled in, the status advances to `GREEN_PARTIAL_PROVIDER_CALL_BLOCKED` (if `OPENCODE_ALLOW_PROVIDER_CALL` remains unset) or `READY_FOR_PROVIDER_SMOKE` (if the allow flag is also set).

## Other Status Classes (Not Applicable)

| Class | Reason Not Applicable |
|-------|----------------------|
| `YELLOW_CONFIG_UNKNOWN` | Provider model is well-understood: env vars or `opencode providers login` |
| `RED_SECRET_LEAK` | 0 real secrets found — all hygiene checks passed |

## Path to READY_FOR_PROVIDER_SMOKE

The user must:

1. SSH to the runner (via Proxmox: `ssh proxmox-scanner` then `pct enter 102`)
2. Edit `/opt/dev-fabric/secrets/opencode-provider.env`
3. Replace the three placeholder values:
   ```
   OPENCODE_PROVIDER=deepseek    (or openai, anthropic, etc.)
   OPENCODE_API_KEY=sk-xxxx...   (real API key)
   OPENCODE_MODEL=deepseek-v4-pro (or gpt-4o, claude-sonnet-4-20250514, etc.)
   ```
4. Save and exit (permissions remain 600)
5. Set `OPENCODE_ALLOW_PROVIDER_CALL=true` (via export or in the env file)
6. Run smoke test: `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh`

## Safety Note

Even when `READY_FOR_PROVIDER_SMOKE`, the smoke test:
- Does NOT modify any GitHub issues
- Does NOT modify any code
- Does NOT touch n8n or Proxmox
- Only runs read-only provider queries and a minimal hello test
- Respects `OPENCODE_MAX_COST_USD` cost limit
- Respects `OPENCODE_DRY_RUN=true`
