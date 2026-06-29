# Evidence Index — Latest

**Last Updated:** 2026-06-29T10:31:14Z

## Active Evidence Directory

`evidence/dummy-issues-cleanup-9-16-20260629T103114Z/`

## Status

🟢✅ **DUMMY_ISSUES_CLEANUP_GREEN** — All 8 dummy/test/canary issues (#9–#16) safely closed as `completed`. No workflow, SQLite, runner, or branch changes. Issues #3–#8 protected. Secret hygiene GREEN. Closing comments posted on all 8 issues.

## Key Files

| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — System info, git status, authorization check |
| `issues-9-16-inventory.md` | Phase 2 — Per-issue inventory (labels, comments, evidence) |
| `cleanup-safety-gate.md` | Phase 3 — Safety gate classification (all GREEN) |
| `cleanup-comments-prepared.md` | Phase 4 — Standardized closing comments |
| `cleanup-apply-result.md` | Phase 5 — Applied results (8 closed, 0 skipped) |
| `issues-9-16-after-cleanup.md` | Phase 6 — Post-cleanup state verification |
| `issues-3-8-guard-after-cleanup.md` | Phase 6 — Guard issues #3–#8 protection check |
| `dispatcher-after-cleanup-check.md` | Phase 7 — n8n/dispatcher read-only check |
| `secret-hygiene-dummy-cleanup.md` | Phase 8 — Secret hygiene (GREEN, 0 real leaks) |


## Live Workflow Export

- Green snapshot: `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.json`
- SHA256: `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9`

## Database Backups

- Backup: `database.sqlite.bak.20260629T0600Z` (on CT 101: `/opt/dev-fabric/n8n/data/.n8n/`)

## Branch Drift Governance Evidence

`evidence/branch-drift-governance-20260629T080206Z/`

### Status
🔴 **RED_BRANCH_CONFLICT** — `main` and `master` have completely unrelated histories. Default Branch (`main`) shows outdated content. Source of Truth (`master`) contains all current operational documentation. Recommendation: Option A — set `master` as GitHub Default Branch. **No changes applied** — awaiting user authorization.

### Key Files
| File | Description |
|------|-------------|
| `preflight.md` | System environment, git status, initial drift detection |
| `branch-comparison.md` | Detailed comparison: commit counts, diff stats, content differences |
| `github-default-branch-reality.md` | GitHub settings, branch protection, README comparison |
| `branch-drift-risk-analysis.md` | Risk assessment (7 risks evaluated) |
| `branch-governance-options.md` | Three options: A (set default), B (sync to main), C (document only) |
| `branch-governance-recommendation.md` | Clear recommendation: Option A |
| `branch-governance-apply-plan.md` | Step-by-step apply instructions with authorization gates |
| `secret-hygiene-branch-governance.md` | Secret hygiene scan — GREEN, 0 leaks |

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
