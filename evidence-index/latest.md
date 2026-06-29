# Evidence Index — Latest

**Last Updated:** 2026-06-29T13:02:02Z

## Active Evidence Directory

**Current:** `evidence/linux-mint-workstation-prep-2026-06-29T13-02-02Z/` 🟢🖥️🔑

**Previous:** `evidence/new-machine-linux-mint-migration-setup-2026-06-29T123325Z/` 🟢🖥️

## Status

🟢🖥️🔑 **LINUX_MINT_WORKSTATION_READY_WITH_NOTES** — Linux Mint Workstation vorbereitet: Repo validiert, n8n erreichbar, lokale Secret-Struktur erstellt, SSH-Key vorhanden (Runner-Auth pending). 4 User-Actions für volle Operational Readiness ausstehend. Keine Runtime-Änderungen. Keine Secrets ausgegeben.

## Key Files (Current Session: Linux Mint Workstation Prep)

| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — OS, tooling, git state preflight |
| `secret-hygiene-before-workstation-prep.md` | Phase 2 — Secret hygiene scan (known incident only) |
| `n8n-account-security-prep.md` | Phase 3 — n8n password/2FA/API-key status |
| `local-n8n-api-secret-structure.md` | Phase 4 — n8n API key placeholder file |
| `local-deepseek-secret-structure.md` | Phase 5 — DeepSeek provider secret file |
| `ssh-key-prep.md` | Phase 6 — SSH key fingerprint, runner prep |
| `runner-ssh-connectivity.md` | Phase 7 — Runner SSH test (SSH_KEY_REQUIRED) |
| `runner-readonly-validation.md` | Phase 8 — Runner validation (BLOCKED) |
| `n8n-readonly-validation-new-machine.md` | Phase 9 — n8n HTTP checks from new machine |
| `local-baseline-validation.md` | Phase 10 — Health check (HEALTH_YELLOW) |
| `secret-hygiene-after-linux-workstation-prep.md` | Phase 12 — Post-prep hygiene (GREEN) |
| `validation-report.md` | Phase 14 — Constraint validation |
| `final-report.md` | Phase 16 — Final report |

## Key Files (Previous: Linux Mint Migration)

| File | Description |
|------|-------------|
| `new-machine-linux-mint-preflight.md` | Phase 1 — Linux Mint OS, Shell, Tooling preflight |
| `repo-clone-validation.md` | Phase 2 — Clone validation, branch, remote, commit |
| `repo-content-validation.md` | Phase 3 — Key files inventory (README, STATUS, etc.) |
| `secret-hygiene-new-machine.md` | Phase 4 — Secret hygiene scan, YELLOW_KNOWN_PREEXISTING |
| `local-secret-structure.md` | Phase 5 — Local secrets/ template creation |
| `n8n-readonly-connectivity.md` | Phase 6 — n8n health check (reachable) |
| `runner-readonly-connectivity.md` | Phase 7 — Runner SSH check (key required) |
| `local-tooling-check.md` | Phase 8 — Node, npm, Python, scripts inventory |
| `playwright-new-machine-policy.md` | Phase 9 — Policy: no old artifacts |
| `NEW_MACHINE_BASELINE.md` | Phase 10 — Migration baseline summary (root) |
| `validation-report.md` | Phase 12 — 30-point validation (28 pass, 2 warn) |
| `final-report.md` | Phase 14 — Final report with status decision |

### Previous: Migration Handoff (Old Machine)

| `preflight.md` | Phase 1 — System info, git status, .gitignore, secret hygiene preflight |
| `git-remote-sync-check.md` | Phase 2 — Remote-Sync-Validierung, Statusentscheidung |
| `secret-hygiene-before-migration-handoff.md` | Phase 3 — Secret-Scan-Ergebnisse, GREEN |

### Previous: RED_SECRET_LEAK Evidence
| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — Git status, branch, commit, .gitignore status |
| `playwright-mcp-tracked-inventory.md` | Phase 2 — Inventory of 48 tracked .playwright-mcp/ files |
| `secret-hygiene-before-playwright-index-cleanup.md` | Phase 3 — RED_SECRET_LEAK finding (real JWT tokens, redacted) |
| `final-report.md` | Phase 4 — Final report on halted index cleanup |

### Previous: REPO_HYGIENE_GREEN Evidence
| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — System info, git status, n8n health |
| `git-remote-default-branch-check.md` | Phase 2 — Branch validation, remote config |
| `repository-landing-page-check.md` | Phase 3 — GitHub landing page assessment |
| `n8n-dispatcher-baseline-check.md` | Phase 4 — n8n workflow read-only check |
| `n8n-executions-baseline-check.md` | Phase 5 — Execution history check (24h) |
| `issues-baseline-check.md` | Phase 6 — Issue state (#3–#8 protected, #9–#16 closed) |
| `comment-sync-spot-check.md` | Phase 7 — Issue #16 comment sync verification |
| `runner-deepseek-baseline-check.md` | Phase 8 — Runner/DeepSeek read-only assessment |
| `backup-rollback-baseline-check.md` | Phase 9 — Backup, snapshot, rollback verification |
| `secret-hygiene-final-baseline.md` | Phase 10 — Secret hygiene scan (GREEN) |
| `FINAL_OPERATIONS_BASELINE.md` | Phase 11 — Final baseline summary |
| `validation-report.md` | Phase 13 — Constraint and operational validation |
| `final-report.md` | Phase 15 — Final report with status decision |

## Live Workflow Export

- Green snapshot: `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.json`
- SHA256: `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9`

## Database Backups

- Backup: `database.sqlite.bak.20260629T0600Z` (on CT 101: `/opt/dev-fabric/n8n/data/.n8n/`)

## Dummy Issue Cleanup Evidence

`evidence/dummy-issues-cleanup-9-16-20260629T103114Z/` — 🟢✅ DUMMY_ISSUES_CLEANUP_GREEN

---

## Previous Evidence

- `evidence/branch-default-master-apply-20260629T081907Z/` — BRANCH_GOVERNANCE_DEFAULT_MASTER_APPLIED
- `evidence/comment-sync-24h-observation-20260629T074032Z/` — COMMENT_SYNC_24H_OBSERVATION_GREEN
- `evidence/post-comment-sync-stabilization-20260629T065737Z/` — COMMENT_SYNC_GREEN_BASELINE_FROZEN
- `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/` — Comment sync fix run (COMMENT_SYNC_GREEN)
- `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/` — Root cause analysis + patch design
- `evidence/deepseek-dispatch-green-push-20260629T051858Z/` — Green push (commit 8b10fbd)
- `evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/` — Provider dispatch integration
- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` — Issue #9 test (GREEN_PARTIAL)
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` — Provider smoke test
- `evidence/playwright-mcp-index-cleanup-20260629T092447Z/` — RED_SECRET_LEAK (index cleanup halted)
- `evidence/secret-remediation-playwright-mcp-n8n-token-20260629T094013Z/` — REMEDIATION_PLAN_COMPLETE (previous session)
- `evidence/secret-remediation-after-token-rotation-20260629T110937Z/` 🟡⏳ — TOKEN_ROTATION_PENDING (previous session)
- `evidence/migration-handoff-old-machine-2026-06-29_12-22-20/` 🟢📦 — MIGRATION_HANDOFF_PREPARED (current session)
