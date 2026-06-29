# Evidence Index — Latest

**Last Updated:** 2026-06-29T08:20:00Z

## Active Evidence Directory

`evidence/branch-default-master-apply-20260629T081907Z/`

## Status

🟢✅ **BRANCH_GOVERNANCE_DEFAULT_MASTER_APPLIED** — GitHub Default Branch ist jetzt `master`. Keine Branches gelöscht, kein Merge, kein Force Push. Commit `4670add` (Branch-Drift-Analyse) nach origin/master gepusht. Source of Truth jetzt auf GitHub-Projektseite sichtbar. `main` als historischer Branch erhalten.

## Key Files

| File | Description |
|------|-------------|
| `preflight.md` | Phase 1 — Reality refresh, constraint check |
| `git-branch-remote-observation.md` | Phase 2 — Git, branch, remote status |
| `n8n-health-observation.md` | Phase 3 — n8n health, workflow verification |
| `n8n-executions-24h.md` | Phase 4 — Execution history 24h |
| `issues-3-16-guard-observation.md` | Phase 5 — Protected issues guard check |
| `issue-16-comment-sync-observation.md` | Phase 6 — Comment-Sync validation |
| `sqlite-state-24h-observation.md` | Phase 7 — SQLite state verification |
| `backup-rollback-observation.md` | Phase 8 — Backup and rollback status |
| `dispatcher-health-24h.md` | Phase 9 — Dispatcher health check |
| `secret-hygiene-24h-observation.md` | Phase 10 — Secret hygiene scan |
| `observation-summary.md` | Phase 11 — Overall summary |
| `validation-report.md` | Phase 13 — Hard constraint validation |
| `final-report.md` | Phase 15 — Final report |

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

- `evidence/post-comment-sync-stabilization-20260629T065737Z/` — COMMENT_SYNC_GREEN_BASELINE_FROZEN
- `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/` — Comment sync fix run (COMMENT_SYNC_GREEN)
- `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/` — Root cause analysis + patch design
- `evidence/deepseek-dispatch-green-push-20260629T051858Z/` — Green push (commit 8b10fbd)
- `evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/` — Provider dispatch integration
- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` — Issue #9 test (GREEN_PARTIAL)
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` — Provider smoke test
