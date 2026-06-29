# New Machine Baseline — Linux Mint Migration

**Date/Time (UTC):** 2026-06-29T12:33:25Z
**Machine:** xxammaxx-desktop (Linux Mint 22.1 Xia)

## Migration Summary

| Check | Result |
|-------|--------|
| Repo cloned | YES |
| Branch | master |
| Remote correct | YES (https://github.com/xxammaxx/n8n-blueprint-workflow.git) |
| Secret Hygiene | YELLOW_KNOWN_PREEXISTING (token revoked) |
| Local secret structure | CREATED (templates only) |
| n8n reachable | YES (192.168.1.52:5678) |
| Runner reachable | SSH_KEY_REQUIRED |
| Playwright old artifacts | NOT transferred (present in git history, not used) |

## Open Tasks

| Task | Priority | Owner |
|------|----------|-------|
| n8n password change | HIGH | User |
| New n8n API key (local) | HIGH | User |
| 2FA setup (optional) | MEDIUM | User |
| DeepSeek API key in secrets/opencode-provider.env | HIGH (if runner managed from new machine) | User |
| SSH key for runner (192.168.1.53) | HIGH | User |
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

## Status

**NEW_MACHINE_READY_WITH_NOTES** — Repository is cloned and validated on Linux Mint. Core infrastructure is reachable (n8n). User must complete local secret setup (API keys, SSH key for runner).
