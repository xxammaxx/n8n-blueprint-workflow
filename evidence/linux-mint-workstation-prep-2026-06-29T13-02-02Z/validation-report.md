# Validation Report — Linux Mint Workstation Prep

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Run:** linux-mint-workstation-prep
- **Machine:** xxammaxx-desktop (Linux Mint 22.1)

## Hard Constraint Validation

| # | Constraint | Status | Evidence |
|---|-----------|--------|----------|
| 1 | No secrets output | PASS | No API keys, tokens, JWTs, SSH private keys displayed |
| 2 | No API keys logged | PASS | Only placeholder values in secret files |
| 3 | No token values in evidence | PASS | Token references use file paths only, no values |
| 4 | No SSH private keys in evidence | PASS | Only public key fingerprint documented |
| 5 | No password display | PASS | No passwords read or displayed |
| 6 | No n8n credential values read | PASS | No n8n credentials accessed |
| 7 | No browser cookies extracted | PASS | No browser interaction |
| 8 | No old Playwright sessions copied | PASS | Existing .playwright-mcp/ from clone, not new copies |
| 9 | No old .playwright-mcp/ files copied | PASS | None copied this run |
| 10 | No old tokens transferred | PASS | All tokens revoked, none transferred |
| 11 | No git history rewrite | PASS | No history operations performed |
| 12 | No force push | PASS | No push at all yet |
| 13 | No `git rm --cached` | PASS | No git rm operations |
| 14 | No workflow change | PASS | Workflow Sv12QTo56NoPUu2D untouched |
| 15 | No SQLite change | PASS | No database operations |
| 16 | No runner script change | PASS | Runner unreachable (SSH not authorized) |
| 17 | No issue modification | PASS | No GitHub issue API calls |
| 18 | No new issue creation | PASS | No new issues created |
| 19 | No GitHub Actions triggered | PASS | No dispatch events |
| 20 | No auto-merge | PASS | No PR or merge operations |
| 21 | No Proxmox/Docker/n8n runtime change | PASS | Only read-only HTTP checks |
| 22 | Secret files not tracked in git | PASS | secrets/ gitignored, not in git ls-files |
| 23 | .playwright-mcp/ not newly tracked | PASS | 48 files already tracked (pre-existing, known incident) |
| 24 | No DB/backup files tracked | PASS | No .db, .sqlite, .bak files in git |
| 25 | No secret values in new files | PASS | All new files contain only metadata |

## Operational Validation

| Check | Status | Detail |
|-------|--------|--------|
| Repo clean (except evidence) | PASS | Only untracked: new evidence dir |
| Branch is master | PASS | Up to date with origin |
| n8n reachable | PASS | HTTP 200, healthz OK |
| Local secret structure | PASS | n8n-api.env (placeholder), opencode-provider.env (pre-existing) |
| Secret file permissions | PASS | secrets/ 700, *.env 600 |
| Secret files gitignored | PASS | Both confirmed ignored |
| SSH key exists | PASS | id_ed25519 |
| Runner SSH | WARN | Key not yet authorized — user action required |
| Health check | PASS | HEALTH_YELLOW (expected — known playwright tracks + no powershell) |

## Summary

- **Total constraints:** 25
- **Pass:** 25
- **Warn:** 0 (Runner SSH is user action, not a constraint violation)
- **Fail:** 0
- **Overall:** VALIDATION_GREEN
