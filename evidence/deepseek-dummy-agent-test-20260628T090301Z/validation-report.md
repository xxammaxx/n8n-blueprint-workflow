# Validation Report — DeepSeek Dummy Agent Test

**Timestamp (UTC):** 2026-06-28T09:20:00Z
**Evidence Dir:** `evidence/deepseek-dummy-agent-test-20260628T090301Z/`

## Test Objectives vs Results

| # | Objective | Expected | Actual | Pass |
|---|-----------|----------|--------|------|
| 1 | New Dummy Issue created | #9 | #9 | ✅ |
| 2 | Only dummy issue gets `agent:ready` | Only #9 | Only #9 | ✅ |
| 3 | Dispatcher detects it | YES | YES (59s) | ✅ |
| 4 | Runner starts exactly once | YES | YES (1 run) | ✅ |
| 5 | OpenCode uses DeepSeek Provider | YES | ⚠️ PARTIAL — Provider configured but not used in dispatch | ⚠️ |
| 6 | Evidence generated | YES | YES (8 files) | ✅ |
| 7 | Labels correctly set | YES | ✅ ready→running→needs-review+evidence:attached | ✅ |
| 8 | Issues #3-#8 unchanged | YES | ✅ All 6 protected | ✅ |
| 9 | No secrets exposed | YES | ✅ 0 secrets | ✅ |
| 10 | No productive code changed | YES | ✅ 0 changes | ✅ |
| 11 | No auto-merge | YES | ✅ No merge | ✅ |
| 12 | No GitHub Actions | YES | ✅ No actions | ✅ |

## Constraint Verification

| Constraint | Status | Detail |
|------------|--------|--------|
| No secrets output | ✅ | 0 secrets in any artifact |
| No API keys logged | ✅ | 0 keys in logs/evidence/comments |
| No tokens/cookies/SSH keys/passwords | ✅ | 0 found |
| No n8n credential values read | ✅ | Read-only health checks only |
| Dispatcher Workflow unchanged | ✅ | `Sv12QTo56NoPUu2D` frozen |
| Schedule Trigger unchanged | ✅ | 15 min interval intact |
| Issues #3-#8 not re-started | ✅ | All 6 labels unchanged |
| No productive GitHub Issues touched | ✅ | Only #9 (dummy) processed |
| Exactly 1 new Dummy Issue created | ✅ | #9 only |
| No auto-merge | ✅ | Not performed |
| No GitHub Actions started | ✅ | 0 actions triggered |
| No Proxmox configuration changed | ✅ | Read-only access only |
| Proxmox Host Zombie n8n not touched | ✅ | Not accessed |
| No containers/volumes deleted | ✅ | 0 deletions |
| No workflow modification | ✅ | Workflow not modified |
| No runner script modification | ✅ | Runner scripts not edited |
| Cost limit respected | ✅ | $0.25 limit active |
| Secret Hygiene green | ✅ | 0 real leaks |

## Critical Path Verification

### Dispatcher Path
```
GitHub Issue #9 (agent:ready)
  → Schedule Trigger (15 min) fires at ~09:15 UTC
    → Dispatcher Workflow Sv12QTo56NoPUu2D
      → Guardrails: Issue #3 blocked, #4-#8 skipped
        → Issue #9 selected (only issue with agent:ready)
          → Runner script dispatched
            → Runner CT 102 starts start_github_issue_run.sh
              → Mode: manual-terminal (safe default)
                → Evidence written
                  → GitHub labels updated
                    → Comment posted
```

### Label Lifecycle
```
agent:ready (09:14:30Z)
  → agent:running (09:15:29Z)
    → agent:needs-review + evidence:attached (09:16:53Z)
```

### Runner Execution
```
start_github_issue_run.sh (09:16:21Z)
  → RUN_INPUT validated: PASS
  → OpenCode detected: v1.17.9
  → Provider configured: false (not sourced in dispatch script)
  → Mode: manual-terminal
  → Evidence written: 8 files
  → Status: GREEN_PARTIAL
  → Exit: success (09:16:53Z)
```

## Anomaly: OpenCode Provider Not Used

**Finding:** `opencode_provider_configured: false`

**Root Cause:** The runner's `start_github_issue_run.sh` dispatch script does NOT source the provider environment file. The DeepSeek provider IS configured on the system (proven in Phase 2: `DEEPSEEK_API_KEY` loaded, `provider=deepseek`, `model=deepseek-v4-pro`), but the runner dispatch pipeline doesn't load it.

**Impact:** The agent ran in `manual-terminal` mode (safe fallback) rather than using the DeepSeek provider for AI-powered execution.

**Classification:** This is an **architectural gap**, NOT a DeepSeek provider failure. The provider itself is operational and tested (DEEPSEEK_PROVIDER_SMOKE_GREEN).

**Mitigation:** The dispatch script needs an optional provider-loading step before starting OpenCode.

## Overall Assessment

| Category | Status |
|----------|--------|
| Dispatcher | ✅ GREEN — Detected and dispatched correctly |
| Runner | ✅ GREEN — Started exactly once, completed successfully |
| Evidence | ✅ GREEN — Complete, 8 files, no secrets |
| Labels | ✅ GREEN — Correct transitions |
| Issues #3-#8 | ✅ GREEN — Fully protected |
| OpenCode/DeepSeek | 🟡 YELLOW — System ready, not used in dispatch |
| Secret Hygiene | ✅ GREEN — 0 leaks |
| Code Integrity | ✅ GREEN — 0 productive changes |
| GitHub Actions | ✅ GREEN — 0 triggered |
| Auto-Merge | ✅ GREEN — Not performed |

## Status Classification

### 🟡 GREEN_PARTIAL_DEEPSEEK_NOT_DISPATCHED

The test proves the dispatcher/runner pipeline is operational, but the DeepSeek provider is not yet integrated into the runner dispatch flow. The provider itself is verified working (DEEPSEEK_PROVIDER_SMOKE_GREEN), the gap is in the dispatch script integration.

This is **NOT** `DEEPSEEK_DUMMY_AGENT_GREEN` because the DeepSeek provider was not actually used during the agent run.

This is **NOT** `YELLOW_RUNNER_ERROR` because the runner completed successfully without errors.

This is **NOT** `RED_SECRET_LEAK` because 0 secrets were exposed.
