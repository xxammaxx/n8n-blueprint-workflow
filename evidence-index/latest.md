# Evidence Index — Latest

**Last Updated:** 2026-06-29T05:52:00Z

## Active Evidence Directory

`evidence/dispatcher-comment-sync-status-json-20260629T053028Z/`

## Status

🟡 **COMMENT_SYNC_FIX_PREPARED** — Root cause of stale GitHub comments identified and fix designed. The "Format Evidence Comment" node failed to extract `status.json` from the SSH output wrapper. Patch prepared and statically validated. Deployment pending n8n UI access.

## Key Files

| File | Description |
|------|-------------|
| `preflight.md` | Pre-run system state |
| `workflow-comment-path-before.md` | Current comment data flow (broken) |
| `comment-data-flow-analysis.md` | Detailed data flow diagram |
| `runner-status-json-structure.md` | status.json field documentation |
| `comment-sync-fix-design.md` | Fix design with priority logic |
| `workflow-patch-plan.md` | Minimal patch plan (2 nodes) |
| `workflow-snapshot-before.md` | Snapshot before patch (SHA256) |
| `workflow-patch-applied.md` | Patch application status |
| `workflow-diff-summary.md` | Before/after diff verification |
| `static-validation.md` | Static code validation (17/17 PASS) |
| `dummy-issue-13-created.md` | Issue #13 creation log |
| `n8n-execution-summary.md` | n8n execution for Issue #13 |
| `github-comment-sync-validation.md` | Comment content validation (stale) |
| `issues-3-12-guard-after.md` | Protection verification |
| `runner-evidence-issue-13.md` | Runner evidence analysis |
| `secret-hygiene-after-comment-sync.md` | Secret scan (GREEN) |
| `validation-report.md` | Full validation |
| `final-report.md` | Final report |

## Patch Files

- Before: `exports/comment-sync-before/dispatcher-Sv12QTo56NoPUu2D-before-comment-sync-20260629T053028Z.json`
- After: `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-after-comment-sync-20260629T053028Z.json`
- SHA256 (after): `17A4159C6BDD0538CDDFB9B87F69AF25D261701FBFFAF1D3577B4937C6E61FD7`

## Previous Evidence

- `evidence/deepseek-dispatch-green-push-20260629T051858Z/` — Green push (commit 8b10fbd)
- `evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/` — Provider dispatch integration
- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` — Issue #9 test (GREEN_PARTIAL)
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` — Provider smoke test
