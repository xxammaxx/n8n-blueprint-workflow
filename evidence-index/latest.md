# Evidence Index — Latest

**Last Updated:** `2026-06-28T09:20:00Z`
**Current Status:** `GREEN_PARTIAL_DEEPSEEK_NOT_DISPATCHED` 🟡 | `DUMMY_AGENT_TEST_COMPLETE` | `DISPATCHER_GREEN` | `RUNNER_GREEN` | `PROVIDER_DISPATCH_GAP`

---

## Latest Session

| Field | Value |
|-------|-------|
| Session | deepseek-dummy-agent-test-20260628T090301Z |
| Path | `evidence/deepseek-dummy-agent-test-20260628T090301Z/` |
| Status | `GREEN_PARTIAL_DEEPSEEK_NOT_DISPATCHED` |
| Date | 2026-06-28T09:03Z |
| Purpose | Controlled dummy agent test with direct DeepSeek provider via dispatcher pipeline |
| Issue | #9 (`[Dummy] OpenCode DeepSeek provider runner test`) |

### Files in Latest Session
| File | Description |
|------|-------------|
| `preflight.md` | Environment status, git, n8n, runner, provider checks |
| `runner-provider-readiness.md` | DeepSeek provider verification on runner |
| `dummy-issue-created.md` | Issue #9 creation details and initial labels |
| `n8n-execution-summary.md` | n8n execution timeline (59s dispatch, 84s run) |
| `dispatcher-run-summary.md` | Dispatcher behavior and label transitions |
| `dummy-issue-after.md` | Post-run issue #9 state verification |
| `issues-3-8-guard-after.md` | Issues #3-#8 protection verification |
| `runner-evidence-dummy-issue.md` | Runner evidence analysis |
| `secret-hygiene-after-dummy-test.md` | Secret scan results (0 leaks) |
| `validation-report.md` | Full constraint and objective validation |
| `final-report.md` | Comprehensive final report |

### Previous Sessions
- `deepseek-direct-provider-setup-20260628T103512Z/` — DEEPSEEK_PROVIDER_SMOKE_GREEN
- `local-opencode-credential-transfer-20260628T060908Z/` — GREEN_PARTIAL_CREDENTIAL_NOT_FOUND
- `reliability-day-3-2026-06-30-20260627T192813Z/` — RELIABILITY_OBSERVATION_PASSED_WITH_NOTES
- `reliability-day-2-2026-06-29-20260627T171051Z/` — Day 2 observation
- `reliability-day-1-2026-06-28-20260627T165431Z/` — Day 1 observation
- `push-and-reliability-start-2026-06-27T152645Z/` — Push + Day 0 start
- `final-format-result-success-canary-issue-8-20260627T114642Z/` — GREEN_EXECUTION_SUCCESS_CONFIRMED
- `post-green-stabilization-20260627T131737Z/` — Green stabilization baseline
| Purpose | Local OpenCode credential discovery, export scripts, runner transfer preparation |

### Files in Latest Session
| File | Description |
|------|-------------|
| `preflight.md` | System reality check, runner connectivity |
| `local-opencode-credential-discovery.md` | Discovery results (corrected — all placeholders) |
| `local-opencode-credential-export-script.md` | Export script architecture and discovery run |
| `gitignore-secret-protection.md` | .gitignore verification and update |
| `local-normalized-secret-result.md` | Normalized file status (placeholders only) |
| `runner-copy-result.md` | Copy script VerifyOnly result |
| `runner-opencode-readiness.md` | Runner tool/version verification |
| `provider-smoke-decision.md` | Provider smoke blocked — no credentials |
| `secret-hygiene-after-local-opencode-transfer.md` | Secret hygiene audit — all clean |
| `dummy-agent-test-readiness.md` | Dummy test blocked by policy |
| `validation-report.md` | Full validation report (26/26 gates passed) |
| `final-report.md` | Final report with status decisions |

## Previous Session

| Field | Value |
|-------|-------|
| Session | opencode-provider-credential-copy-20260628T055024Z |

### Files in Latest Session
| File | Description |
|------|-------------|
| `preflight.md` | System reality check, runner connectivity, dispatcher status |
| `local-secret-file-check.md` | Local secret file and .gitignore verification |
| `credential-copy-script.md` | Copy script architecture and security guarantees |
| `credential-copy-script-validation.md` | Static validation of copy script |
| `runner-credential-copy-result.md` | VerifyOnly result and copy decision |
| `opencode-local-readiness.md` | Runner non-destructive checks (opencode, node, git, bash) |
| `provider-smoke-decision.md` | Provider smoke test blocked — placeholder credentials |
| `secret-hygiene-after-credential-copy.md` | Post-copy secret hygiene audit |
| `dummy-agent-test-readiness.md` | Dummy agent test blocked by policy |
| `validation-report.md` | Full validation report |
| `final-report.md` | Final report with all decisions |

### Reliability Observation
| File | Description |
|------|-------------|
| `evidence/reliability-daily/2026-06-27.md` | Day 0 log |
| `evidence/reliability-daily/2026-06-28.md` | Day 1 log |
| `evidence/reliability-daily/2026-06-29.md` | Day 2 log |
| `evidence/reliability-daily/2026-06-30.md` | Day 3 log (final) |
| `evidence/reliability-daily/RELIABILITY_OBSERVATION_SUMMARY.md` | 3-Tage-Abschlussbeurteilung |

---

## Evidence Session History

| Session | Path | Status | Date |
|---------|------|--------|------|
| **Credential Copy Script** | `evidence/opencode-provider-credential-copy-20260628T055024Z/` | 🟡 GREEN_PARTIAL_SECRET_PLACEHOLDER | 2026-06-28 |
| **Reliability Day 3** | `evidence/reliability-day-3-2026-06-30-20260627T192813Z/` | ✅ RELIABILITY_OBSERVATION_PASSED_WITH_NOTES | 2026-06-30 |
| **Reliability Day 2** | `evidence/reliability-day-2-2026-06-29-20260627T171051Z/` | ✅ GREEN_RELIABILITY_DAY_2 | 2026-06-29 |
| **Reliability Day 1** | `evidence/reliability-day-1-2026-06-28-20260627T165431Z/` | ✅ GREEN_RELIABILITY_DAY_1 | 2026-06-28 |
| **Push & Reliability Start** | `evidence/push-and-reliability-start-2026-06-27T152645Z/` | 🔵 GREEN_PUSHED_AND_OBSERVATION_STARTED | 2026-06-27 |
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
