# Evidence Index — Latest

**Last Updated:** 2026-06-29T06:50:00Z

## Active Evidence Directory

`evidence/dispatcher-comment-sync-status-json-20260629T055645Z/`

## Status

🟢 **COMMENT_SYNC_GREEN** — GitHub comment sync fix deployed and verified. The dual-table database patch (workflow_entity + workflow_history) resolved the stale comment issue. Issue #16 confirmed: comment shows real Runner Evidence from `status.json` with `Evidence source: status.json`, `Status: GREEN`, `Mode: opencode-run`, `Provider: deepseek`.

## Key Files

| File | Description |
|------|-------------|
| `preflight.md` | Pre-run system state (Run 2) |
| `workflow-snapshot-after.md` | Post-patch live workflow snapshot |
| `static-validation.md` | Static code validation (34/34 PASS) |
| `workflow-diff-summary.md` | Before/after diff (2 nodes changed) |
| `dummy-issue-14-created.md` | Issue #14 creation (pre-patch test) |
| `n8n-execution-summary.md` | n8n executions (#238-#240) |
| `github-comment-sync-validation.md` | Issue #16 comment validation (MATCH) |
| `issues-3-15-guard-after.md` | Protection verification (all safe) |
| `runner-evidence-issue-16.md` | Runner evidence analysis |
| `secret-hygiene-after-comment-sync.md` | Secret scan (GREEN) |
| `validation-report.md` | Full validation (38/38 PASS) |
| `final-report.md` | Final report |

## Live Workflow Export

- After patch (live): `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-live-after-patch-20260629T061308Z.json`
- SHA256: `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9`

## Database Backups

- Before: `database.sqlite.bak.20260629T0600Z` (on CT 101)

## Previous Evidence

- `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/` — Previous run (root cause analysis + patch design)
- `evidence/deepseek-dispatch-green-push-20260629T051858Z/` — Green push (commit 8b10fbd)
- `evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/` — Provider dispatch integration
- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` — Issue #9 test (GREEN_PARTIAL)
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` — Provider smoke test
