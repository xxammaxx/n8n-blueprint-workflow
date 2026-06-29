# Evidence Index — Latest

**Last Updated:** 2026-06-28T12:37:00Z

## Active Evidence Directory

`evidence/deepseek-dispatch-integration-issue-10-20260628T092632Z/`

## Status

🟢 **DEEPSEEK_DUMMY_AGENT_GREEN** — DeepSeek provider successfully integrated into runner dispatch path. Provider env loaded, mode upgraded from `manual-terminal` to `opencode-run`, verified with Issue #12.

## Key Files

| File | Description |
|------|-------------|
| `preflight.md` | Pre-run system state |
| `dispatch-path-analysis.md` | Dispatch path root cause analysis |
| `provider-loader-readiness.md` | Provider loader verification |
| `dispatch-script-patch-plan.md` | Patch design document |
| `dispatch-script-after.md` | Script state after patching |
| `dispatch-script-validation.md` | Syntax and logic validation |
| `dispatch-script-dry-validation.md` | Dry-run analysis |
| `secret-hygiene-before-issue-10.md` | Secret scan before test |
| `dummy-issue-10-created.md` | Issue #10 creation log |
| `dummy-issue-12-after.md` | Issue #12 post-run analysis |
| `runner-evidence-issue-12.md` | Runner evidence analysis |
| `secret-hygiene-after-issue-12.md` | Secret scan after test |
| `issues-3-11-guard-after.md` | Protection verification |
| `validation-report.md` | Full validation |
| `n8n-execution-summary.md` | n8n execution details |
| `dispatcher-run-summary.md` | Dispatcher run summary |
| `final-report.md` | Final report |

## Dispatch Script State

- Path: `/opt/dev-fabric/scripts/start_github_issue_run.sh`
- SHA256: `4610a983aceb481e3c8f4083169ba13ee781e8ef40bdc3d2d1d2eb0c01ca3496`
- Backup: `start_github_issue_run.sh.bak.20260628T093029Z`

## Previous Evidence

- `evidence/deepseek-dummy-agent-test-20260628T090301Z/` — Issue #9 test (GREEN_PARTIAL)
- `evidence/deepseek-direct-provider-setup-20260628T103512Z/` — Provider smoke test (DEEPSEEK_PROVIDER_SMOKE_GREEN)
