# Preflight Report — DeepSeek Direct Provider Setup

**Timestamp (UTC):** 2026-06-28T08:35:17Z  
**Evidence Dir:** `evidence/deepseek-direct-provider-setup-20260628T103512Z/`

## Environment Status

| Item | Value |
|------|-------|
| Date/Time UTC | 2026-06-28T08:35:17Z |
| Git Status | On master, clean except modified n8n-signin-page.png + untracked |
| Current Branch | `master` |
| Last Commit | `2bb53a9` — docs(runner): add final report and update evidence index |
| Runner Reachable | YES (via Proxmox SSH 192.168.1.136 → CT 102) |
| OpenCode Version (Runner) | 1.17.9 ✅ |
| OpenCode Version (Local) | 1.15.0 |
| Secret File Present (Local) | YES (`secrets/opencode-provider.env`) |
| Secret File Present (Runner) | YES (`/opt/dev-fabric/secrets/opencode-provider.env`, 600, runner:runner) |
| API Key Present | YES (sk- prefixed key in secrets) |
| API Key Output | NO (never included in evidence) |
| Current Provider | `opencode-go` |
| Current Model | `deepseek-v4-pro` |
| `OPENCODE_ALLOW_PROVIDER_CALL` | `true` (set in secrets) |
| Dispatcher Unchanged | YES (Workflow `Sv12QTo56NoPUu2D` frozen) |
| Issues #3–#8 Protected | YES (per STATUS.md, all protected) |

## Runner Verification

- Proxmox Host `192.168.1.136` reachable via SSH key
- Container 102 (`lxc-dev-runner`) running
- OpenCode binary at `/opt/dev-fabric/opencode/opencode` — v1.17.9
- Loader script at `/opt/dev-fabric/bin/load-opencode-provider-env.sh` — working (all 5 vars loaded)
- Smoke script at `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh` — working
- Secret file: SIZE=545 bytes, PERMS=600, OWNER=runner:runner

## Git Status Detail

- `git status` shows working tree clean except:
  - Modified: `n8n-signin-page.png` (stale)
  - Untracked: `.playwright-mcp/` logs, `evidence/` directories, `n8n-workflow-page.png`, `scripts/opencode-provider-smoke-test.sh`
- No staged changes
- Branch up to date with `origin/master`

## Constraint Verification

- ✅ No dispatcher workflow modification
- ✅ No schedule trigger modification  
- ✅ Issues #3–#8 not re-started
- ✅ No secrets output
- ✅ No GitHub Issues started
