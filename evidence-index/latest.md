# Evidence Index — Latest

**Last Updated:** 2026-06-29T07:10:00Z

## Active Evidence Directory

`evidence/post-comment-sync-stabilization-20260629T065737Z/`

## Status

🔒🟢 **COMMENT_SYNC_GREEN_BASELINE_FROZEN** — Post-Comment-Sync Stabilization Run. State frozen, validated across 13 phases. Workflow snapshot created, SHA256 verified, SQLite state documented, backup/rollback plan created, issues protected, secret hygiene confirmed. No runtime changes made.

## Key Files

| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — System preflight check |
| `branch-remote-reality.md` | Phase 2 — Branch and remote reality |
| `workflow-comment-sync-green-snapshot.md` | Phase 3 — Workflow snapshot + SHA256 |
| `sqlite-comment-sync-state.md` | Phase 4 — SQLite patch state validation |
| `rollback-plan.md` | Phase 5 — Backup and rollback plan |
| `issue-16-comment-validation.md` | Phase 6a — Issue #16 comment validation |
| `runner-evidence-issue-16-validation.md` | Phase 6b — Runner evidence validation |
| `issues-3-16-guard-check.md` | Phase 7 — Issues #3-#16 guard check |
| `dispatcher-health-post-comment-sync.md` | Phase 8 — Health check |
| `secret-hygiene-post-comment-sync.md` | Phase 9 — Secret hygiene |
| `validation-report.md` | Phase 11 — Full validation |
| `final-report.md` | Phase 13 — Final report |

## Live Workflow Export

- Green snapshot: `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.json`
- SHA256: `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9`

## Database Backups

- Backup: `database.sqlite.bak.20260629T0600Z` (on CT 101: `/opt/dev-fabric/n8n/data/.n8n/`)

## Previous Evidence

- `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/` — Comment sync fix run (COMMENT_SYNC_GREEN)
- `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/` — Root cause analysis + patch design
- `evidence/deepseek-dispatch-green-push-20260629T051858Z/` — Green push (commit 8b10fbd)
- `evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/` — Provider dispatch integration
- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` — Issue #9 test (GREEN_PARTIAL)
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` — Provider smoke test
