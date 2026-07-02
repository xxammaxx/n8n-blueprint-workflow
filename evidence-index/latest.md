# Evidence Index — Latest

**Last Updated:** 2026-07-02T16:10:00Z

## Active Evidence Directory

**Current:** `evidence/su-runner-pam-remediation-20260702T160431Z/` ✅🔧 **SU_RUNNER_FIXED**

**Previous:** `evidence/database-locked-remediation-2026-07-02T15-55-51Z/` ✅🔓 **DATABASE_LOCK_REMEDIATION_GREEN**

**Previous:** `evidence/playwright-mcp-history-remediation-20260702T152807Z/` ✅🧹 **HISTORY_REMEDIATION_GREEN**

## Status

✅🔧 **SU_RUNNER_FIXED** — `su - runner` Hang im LXC-Container behoben. Root Cause: `pam_systemd.so` in `/etc/pam.d/common-session` versucht Session bei unresponsive `systemd-logind` via D-Bus zu registrieren. Repair: `pam_systemd.so` in `common-session` + `runuser-l` auskommentiert. Backups erstellt. Workaround `runuser -u runner` validiert. 0 Secrets. 

**Previous:** ✅🔓 **DATABASE_LOCK_REMEDIATION_GREEN** — Database lock auf CT 102 erfolgreich resolved via kontrolliertes SIGTERM an stale PID 7103.

**Previous:** ✅🧹 **HISTORY_REMEDIATION_GREEN** — `.playwright-mcp/` vollständig aus `master` Git-History entfernt via `git filter-repo`. Token-Rotation bestätigt, `--force-with-lease` Push auf `master`, Remote validiert, Docs restored (115 files). 0 neue Leaks.

## Key Files (Current Session: su-runner PAM Remediation Phases 1-18)

| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — Preflight: Git status, SSH, CT 102, Repair-Autorisierung |
| `su-runner-reproduction.md` | Phase 2 — `su - runner` + `su runner` HANG bestätigt (exit 124) |
| `runuser-sudo-workaround-check.md` | Phase 3 — `runuser -u` works, `runuser -l` hangs, sudo not installed |
| `runner-user-shell-home-status.md` | Phase 4 — User: valid, Shell: /bin/bash, Home: correct perms |
| `profile-structure-check.md` | Phase 5 — Profiles clean, no blocking lines |
| `pam-systemd-diagnosis.md` | Phase 6 — Root Cause: `pam_systemd.so` in common-session + degraded logind |
| `su-runner-strace-diagnosis.md` | Phase 7 — strace not available (N/A) |
| `su-runner-repair-decision.md` | Phase 8 — Decision C: PAM_SYSTEMD_REPAIR (root cause unambiguous) |
| `su-runner-repair-application.md` | Phase 9 — Repair applied: pam_systemd.so commented out, backups created |
| `su-runner-post-check.md` | Phase 10 — All 4 su/runuser variants work (exit 0) |
| `runner-readonly-after-su-diagnosis.md` | Phase 11 — Runner healthy, OpenCode 1.17.9, loader/dispatch present |
| `n8n-api-recheck-after-su-diagnosis.md` | Phase 12 — n8n API 401 (pre-existing, unrelated to PAM fix) |
| `dispatcher-health-after-su-diagnosis.md` | Phase 13 — HEALTH_YELLOW (benign warnings) |
| `secret-hygiene-after-su-diagnosis.md` | Phase 14 — GREEN, 0 secrets |
| `final-report.md` | Phase 18 — Final report with status decision |

## Key Files (Previous: Database Locked Remediation)

| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — Preflight: Zielhost, Zielkey, Constraints, Git-Status |
| `network-access-check.md` | Phase 2 — Netzwerk/Port-Check: Alle Hosts/Ports erreichbar |
| `proxmox-admin-access-options.md` | Phase 3 — Proxmox Admin: root@192.168.1.136 via ed25519 key ✅ |
| `runner-container-vm-identification.md` | Phase 4 — Runner = CT 102 lxc-dev-runner |
| `runner-user-home-check.md` | Phase 5 — User runner existiert, Permissions korrekt, Root Cause gefunden |
| `authorized-keys-repair.md` | Phase 6 — Backup + Key appended, Permissions fixed |
| `sshd-config-readonly-check.md` | Phase 7 — SSHD Config korrekt (PubkeyAuthentication yes) |
| `ssh-validation-after-admin-repair.md` | Phase 8 — SSH SUCCESS: runner@192.168.1.53 → lxc-dev-runner ✅ |
| `runner-readonly-check-after-admin-repair.md` | Phase 10 — Runner-Infrastruktur: Node, Loader, Dispatch, Evidence ✅ |
| `n8n-api-recheck-after-admin-repair.md` | Phase 11 — n8n API HTTP 200 ✅ |
| `dispatcher-health-after-admin-repair.md` | Phase 12 — HEALTH_YELLOW (Benign-Warnungen) |
| `secret-hygiene-after-admin-repair.md` | Phase 13 — 0 new secrets, KNOWN_PREEXISTING_HISTORY_LEAK |

## Key Files (Previous: Runner SSH Readiness Phase 1-6)

## Key Files (Previous: n8n API Validation)

| File | Description |
|------|-------------|
| `n8n-api-validation-preflight.md` | Phase 1 — Git status, branch, secret file checks |
| `n8n-api-secret-structure-check.md` | Phase 2 — Boolean structure validation (no placeholder) |
| `n8n-api-readonly-validation-after-local-key.md` | Phase 3 — API read-only test (HTTP 200, N8N_API_READY) |
| `runner-ssh-status-pending.md` | Phase 4 — SSH status (SSH_USER_ACTION_REQUIRED) |
| `dispatcher-health-after-n8n-api-validation.md` | Phase 5 — HEALTH_YELLOW |
| `secret-hygiene-after-n8n-api-validation.md` | Phase 6 — Secret hygiene (GREEN) |
| `validation-report.md` | Phase 8 — Constraint validation |
| `final-report.md` | Phase 10 — Final report with status decision |

## Key Files (Previous: Linux Mint Operational Readiness)

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
