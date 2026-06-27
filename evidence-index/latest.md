# Evidence Index — Latest

**Last Updated:** `2026-06-27T14:09:31Z`
**Current Status:** `GREEN_EXECUTION_SUCCESS_CONFIRMED` (with `GREEN_WITH_UNPUSHED_COMMIT`)

---

## Latest Session

| Field | Value |
|-------|-------|
| Session | post-success-operations-hardening-20260627T140931Z |
| Path | `evidence/post-success-operations-hardening-20260627T140931Z/` |
| Status | `GREEN_EXECUTION_SUCCESS_CONFIRMED` (hardening round) |
| Date | 2026-06-27T14:09:31Z |
| Purpose | Post-success operations hardening — commit review, secret hygiene, push decision, operational planning |

### Files in Latest Session
| File | Description |
|------|-------------|
| `preflight.md` | System reality check |
| `commit-4aa36d5-review.md` | Commit 4aa36d5 security + content review |
| `git-status-before-push.md` | Git status at time of hardening |
| `secret-hygiene-post-success.md` | Secret hygiene scan — all green |
| `push-decision.md` | Push readiness assessment (awaiting authorization) |
| `dispatcher-health-post-success.md` | Health check results + analysis |
| `n8n-write-access-plan.md` | Plan for n8n REST API write configuration |
| `opencode-runner-provider-plan.md` | Plan for OpenCode provider/API key |
| `playwright-session-renewal-plan.md` | Plan for secure Playwright session renewal |
| `reliability-observation-plan.md` | 3-day reliability monitoring plan |
| `validation-report.md` | Cross-reference validation (38 criteria) |

---

## Evidence Session History

| Session | Path | Status | Date |
|---------|------|--------|------|
| **Post-Success Ops Hardening** | `evidence/post-success-operations-hardening-20260627T140931Z/` | 🛡️ GREEN_EXECUTION_SUCCESS_CONFIRMED | 2026-06-27 |
| Format Final Result Fix + Canary #8 | `evidence/final-format-result-success-canary-issue-8-20260627T114642Z/` | 🟢 GREEN_EXECUTION_SUCCESS_CONFIRMED | 2026-06-27 |
| Playwright MCP Green Baseline Check | `evidence/playwright-mcp-green-baseline-check-20260627T1131Z/` | 🟢 GREEN_BASELINE_VERIFIED | 2026-06-27 |
| Post-Green Stabilization | `evidence/post-green-stabilization-20260627T131737Z/` | 🟢 GREEN_WITH_NOTES | 2026-06-27 |
| Format Final Result Fix (agent) | `evidence/format-final-result-playwright-fix-20260627T115400Z/` | 🟢 complete | 2026-06-27 |
| Final Canary #7 Report | `evidence/final-execution-success-canary-issue-7-20260627T123611Z/` | 🟢 complete | 2026-06-27 |
| Final Canary #7 Evidence | `evidence/final-execution-success-canary-issue-7-20260627T085436Z/` | 🟢 complete | 2026-06-27 |
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
