# Evidence Index — Latest

**Last Updated:** `2026-06-27T11:41:00Z`
**Current Status:** `GREEN_BASELINE_VERIFIED`

---

## Latest Session

| Field | Value |
|-------|-------|
| Session | playwright-mcp-green-baseline-check-20260627T1131Z |
| Path | `evidence/playwright-mcp-green-baseline-check-20260627T1131Z/` |
| Status | `GREEN_BASELINE_VERIFIED` |
| Date | 2026-06-27T11:41:00Z |
| Purpose | Playwright MCP read-only verification of frozen green baseline |

### Files in Latest Session
| File | Description |
|------|-------------|
| `preflight.md` | System reality check |
| `playwright-mcp-discovery.md` | Playwright MCP tool/browser availability |
| `n8n-workflow-ui-check.md` | n8n UI page load and identity verification |
| `workflow-structure-check.md` | Network intercept: 18 nodes, all critical nodes verified |
| `n8n-executions-readonly-check.md` | Execution history: schedule cadence, error analysis |
| `github-issues-3-7-readonly-check.md` | GitHub issue label verification, double-run check |
| `dispatcher-health-check-run.md` | Health check script results (HEALTH_YELLOW → effectively GREEN) |
| `secret-hygiene-playwright-check.md` | Secret hygiene scan (4 placeholder false-positives) |
| `validation-report.md` | Cross-reference validation of all findings |
| `final-report.md` | Final report with status decision and comparison |

---

## Evidence Session History

| Session | Path | Status | Date |
|---------|------|--------|------|
| Playwright MCP Green Baseline Check | `evidence/playwright-mcp-green-baseline-check-20260627T1131Z/` | 🟢 GREEN_BASELINE_VERIFIED | 2026-06-27 |
| Post-Green Stabilization | `evidence/post-green-stabilization-20260627T131737Z/` | 🟢 GREEN_WITH_NOTES | 2026-06-27 |
| Final Canary #7 Report | `evidence/final-execution-success-canary-issue-7-20260627T123611Z/` | 🟢 complete | 2026-06-27 |
| Final Canary #7 Evidence (49 files) | `evidence/final-execution-success-canary-issue-7-20260627T085436Z/` | 🟢 complete | 2026-06-27 |
| Playwright UI Fix | `evidence/playwright-ui-fix-20260627T112116Z/` | 🟢 complete | 2026-06-27 |
| Canary #6 Final Green | `evidence/final-green-canary-issue-6-20260627T073906Z/` | 🟢 complete | 2026-06-27 |
| Canary #5 E2E | `evidence/e2e-canary-issue-5-20260627T071248Z/` | 🟢 complete | 2026-06-27 |
| Guardrails Fix | `evidence/guardrails-trigger-agnostic-fix-20260627T062657Z/` | 🟢 complete | 2026-06-27 |
| Schedule Auto-Run | `evidence/schedule-auto-run-verification-20260627T061306Z/` | 🟢 complete | 2026-06-27 |
| Node 15 Fix | `evidence/schedule-trigger-node15-fix-20260627T050006Z/` | 🟢 complete | 2026-06-27 |

---

## Key Artifacts

| Artifact | Path |
|----------|------|
| Green Workflow Snapshot | `exports/green/dispatcher-green-20260627T131737Z.json` |
| GREEN_BASELINE.md | `evidence/post-green-stabilization-20260627T131737Z/GREEN_BASELINE.md` |
| OPERATIONS_RUNBOOK.md | `evidence/post-green-stabilization-20260627T131737Z/OPERATIONS_RUNBOOK.md` |
| Health Check Script | `scripts/dispatcher-health-check.mjs` |
| Health Check Output | `evidence/post-green-stabilization-2026-06-27T11-2/dispatcher-health-check.json` |
