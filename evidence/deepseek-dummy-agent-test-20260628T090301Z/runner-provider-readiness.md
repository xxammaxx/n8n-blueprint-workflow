# Runner Provider Readiness — DeepSeek Dummy Agent Test

**Timestamp (UTC):** 2026-06-28T09:05:00Z  
**Evidence Dir:** `evidence/deepseek-dummy-agent-test-20260628T090301Z/`

## Runner Access

| Item | Value |
|------|-------|
| Host | 192.168.1.136 (Proxmox) → CT 102 (`lxc-dev-runner`) |
| Container Status | running (mounted) |
| Uptime | 6 days 22 hours |
| Access Method | SSH key → `pct exec 102` |

## OpenCode Version

| Item | Value |
|------|-------|
| Binary Path | `/opt/dev-fabric/opencode/opencode` |
| Version | **1.17.9** ✅ |
| In PATH | No (not needed, direct path used) |

## Secret File

| Item | Value |
|------|-------|
| Path | `/opt/dev-fabric/secrets/opencode-provider.env` |
| Size | 590 bytes |
| Permissions | 0600 (`-rw-------`) |
| Owner | runner:runner |
| Last Modified | 2026-06-28 08:49:04 UTC |
| Format | LF line endings |

## Provider Configuration

| Variable | Status | Value |
|----------|--------|-------|
| `DEEPSEEK_API_KEY` | ✅ loaded | Present (prefix redacted) |
| `OPENCODE_PROVIDER` | ✅ set | `deepseek` |
| `OPENCODE_MODEL` | ✅ set | `deepseek-v4-pro` |
| `OPENCODE_ALLOW_PROVIDER_CALL` | ✅ set | `true` |
| `OPENCODE_MAX_COST_USD` | ✅ set | `0.25` |
| `OPENCODE_API_KEY` | ✅ set | Mapped → `DEEPSEEK_API_KEY` |

## Loader Script

| Item | Value |
|------|-------|
| Path | `/opt/dev-fabric/secrets/opencode-provider.env` (self-contained) |
| Loader Wrapper | Previously at `/opt/dev-fabric/bin/load-opencode-provider-env.sh` |
| Placeholder Detection | ✅ PASTE_*, PLACEHOLDER*, YOUR_*, <* patterns |
| API Key Mapping | ✅ `OPENCODE_API_KEY` → `DEEPSEEK_API_KEY` |

## Previous Smoke Test

| Item | Value |
|------|-------|
| Result | `DEEPSEEK_PROVIDER_SMOKE_GREEN` 🟢 |
| Evidence | `evidence/deepseek-direct-provider-setup-20260628T103512Z/` |
| Model Listing | ✅ Confirmed |
| Agent Run | ✅ Confirmed |
| Provider Type | `deepseek` (built-in, NOT opencode-go) |

## Readiness Gates

| Gate | Status |
|------|--------|
| OpenCode installed | ✅ 1.17.9 |
| Secret file present | ✅ 590 bytes, 0600 |
| API key loaded | ✅ YES (prefix hidden) |
| Provider configured | ✅ `deepseek` |
| Model configured | ✅ `deepseek-v4-pro` |
| Provider calls allowed | ✅ `true` |
| Cost limit active | ✅ `$0.25` |
| Previous smoke green | ✅ |
| Secret values exposed | ❌ NO (never in evidence) |

## Decision

### ✅ PROVIDER_READINESS_CONFIRMED

The runner has a fully configured and verified DeepSeek direct provider:
- OpenCode 1.17.9 with built-in `deepseek` provider
- Real DeepSeek API key loaded (DEEPSEEK_API_KEY)
- Cost limit of $0.25 active
- Previous smoke test passed (DEEPSEEK_PROVIDER_SMOKE_GREEN)

**Proceeding to Phase 3 (Dummy Issue Creation).**
