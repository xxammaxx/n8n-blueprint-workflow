# Evidence Index — Latest

**Last Updated:** 2026-06-29T09:06:31Z

## Active Evidence Directory

`evidence/repo-hygiene-root-docs-gitignore-20260629T090631Z/`

## Status

🟢✅ **REPO_HYGIENE_GREEN** — 10-phase repository hygiene run completed. `.gitignore` hardened with 14 new patterns (DB/backup artifacts + Playwright session artifacts). Root documentation pointers (`GREEN_BASELINE.md`, `OPERATIONS_RUNBOOK.md`) created. 0 tracked DB/backup files. Secret Hygiene GREEN (0 real leaks). 19 hard constraints met — no runtime changes. Previous baseline: FINAL_OPERATIONS_BASELINE_GREEN.

## Key Files

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
