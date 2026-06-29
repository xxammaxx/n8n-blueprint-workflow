# New Machine Baseline — Linux Mint Workstation Prepared

**Date/Time (UTC):** 2026-06-29T13:02:02Z
**Machine:** xxammaxx-desktop (Linux Mint 22.1 Xia)
**Run:** linux-mint-workstation-prep

## Migration Summary

| Check | Result |
|-------|--------|
| Repo cloned | YES |
| Branch | master |
| Remote correct | YES (https://github.com/xxammaxx/n8n-blueprint-workflow.git) |
| Working tree clean | YES (only new evidence dir untracked) |
| Last commit | a78d427 — docs(ops): add linux mint new machine migration validation |
| Secret Hygiene (before) | YELLOW_KNOWN_PREEXISTING (token revoked, .playwright-mcp tracked) |
| Secret Hygiene (after) | YELLOW_KNOWN_PREEXISTING (no new leaks) |
| Local secret structure | CREATED (n8n-api.env placeholder; opencode-provider.env pre-existing) |
| n8n reachable | YES (HTTP 200, healthz OK) |
| n8n password changed | USER_ACTION_REQUIRED |
| n8n API key created | USER_ACTION_REQUIRED |
| n8n 2FA | USER_ACTION_REQUIRED (optional) |
| Runner SSH | SSH_KEY_REQUIRED (key not authorized) |
| Runner read-only validation | BLOCKED (SSH) |
| DeepSeek secret file | EXISTS (secrets/opencode-provider.env, 600) |
| Playwright old artifacts | Present in git history (48 tracked files), NOT used |
| Health check | HEALTH_YELLOW |
| No runtime changed | YES |

## Local Secrets Status

| Secret File | Exists | Permissions | Gitignored | Real Value |
|-------------|--------|-------------|------------|-------------|
| secrets/n8n-api.env | YES | 600 | YES | NO (placeholder) |
| secrets/opencode-provider.env | YES | 600 | YES | unknown (not read) |

## SSH Key Status

| Check | Result |
|-------|--------|
| Key exists | YES (id_ed25519) |
| Fingerprint | SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg |
| Runner user | runner (confirmed existing) |
| Key authorized on runner | NO |

## Open Tasks

| Task | Priority | Owner |
|------|----------|-------|
| n8n password change | HIGH | User (manual via n8n UI) |
| New n8n API key (save locally) | HIGH | User (create in n8n UI → paste into secrets/n8n-api.env) |
| 2FA setup (optional) | MEDIUM | User |
| DeepSeek API key in secrets/opencode-provider.env | HIGH | User (paste real key into file) |
| SSH key authorize for runner | HIGH | User (add public key to runner's authorized_keys) |
| Runner read-only validation | MEDIUM | After SSH works |
| History rewrite (.playwright-mcp/ cleanup) | MEDIUM (separate task) | Later |

## Constraints Maintained

- [x] No runtime changes
- [x] No workflow changes
- [x] No SQLite changes
- [x] No runner changes
- [x] No issue modifications
- [x] No GitHub Actions triggered
- [x] No auto-merge
- [x] No force push
- [x] No history rewrite
- [x] No secrets output
- [x] No old Playwright sessions copied
- [x] No old tokens transferred

## Status

**LINUX_MINT_WORKSTATION_READY_WITH_NOTES**
- Repository cloned, validated, working tree clean
- n8n reachable from new machine
- Local secret structure prepared (values pending user entry)
- SSH key exists but needs runner authorization
- No runtime modifications
- 4 user actions pending for full operational readiness
