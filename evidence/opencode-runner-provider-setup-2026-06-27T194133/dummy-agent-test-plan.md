# Dummy Agent Test Plan

**Timestamp:** 2026-06-27T20:02:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  
**Status: PLANNED ONLY — NOT EXECUTED**  

---

## Purpose

After the OpenCode provider is configured and smoke-tested, this plan describes how to safely test the Runner with a real but isolated OpenCode agent run — without touching production Issues #3-#8.

## Preconditions

| Precondition | Required |
|--------------|----------|
| OpenCode provider smoke test passed | YES |
| `README_FOR_PROVIDER_SMOKE` status | YES |
| User explicit approval | YES |
| All hard constraints still in effect | YES |

## Phase 0: Pre-Flight Gate

Before creating the dummy issue:
1. Verify Issues #3-#8 labels are unchanged
2. Verify Dispatcher Workflow is active and unchanged
3. Verify Schedule Trigger (15 min) is functional
4. Take a snapshot of current execution list in n8n
5. Verify no `agent:ready` labels on Issues #3-#8

## Phase 1: Dummy Issue Creation

### Issue Details
| Field | Value |
|-------|-------|
| Repository | xxammaxx/n8n-blueprint-workflow |
| Title | `TEST-DUMMY: OpenCode Provider Agent Smoke Test — DO NOT MERGE` |
| Body | Structured test task (read-only analysis, no code changes) |
| Labels | `agent:ready`, `test:dummy-provider-agent`, `mode:manual-terminal`, `risk:zero` |
| Assignee | None |
| Milestone | None |

### Issue Content
```markdown
## TEST-DUMMY: Provider Agent Smoke Test

**THIS IS A TEST ISSUE. DO NOT MERGE ANY RESULTING PR.**

### Task
1. Read this issue and confirm you can access the GitHub API
2. List the files in the repository root
3. Report the current git HEAD commit hash
4. DO NOT modify any files
5. DO NOT create a branch
6. DO NOT open a PR
7. Post a structured completion comment with your findings

### Expected Behavior
- Agent reads issue
- Agent performs read-only repository analysis
- Agent posts a completion comment
- Agent does NOT modify code, push, or create PR
```

## Phase 2: Runner Execution

### Execution Control
| Parameter | Value |
|-----------|-------|
| Mode | `manual-terminal` (safe fallback even if provider configured) |
| Issue selection | ONLY this dummy issue (filter by `test:dummy-provider-agent` label) |
| Approval policy | push=false, pr=false, merge=false, github_actions=false |
| Provider config | allowed for this test (provider_config=true in RUN_INPUT) |

### Safety Mechanisms
- The runner script `start_github_issue_run.sh` falls back to `manual-terminal` if provider isn't configured
- Even in `opencode-run` mode, the OpenCode permission config blocks: git push, gh pr create, gh workflow run, rm, docker
- The dummy issue explicitly instructs the agent NOT to modify files

## Phase 3: Verification Gates

### During Execution
1. Monitor n8n execution list for the dummy issue run
2. Verify the run targets only the dummy issue
3. Verify Issues #3-#8 are NOT re-processed
4. Check runner logs: `/opt/dev-fabric/logs/`

### After Execution
1. Verify dummy issue has completion comment
2. Verify NO new branches were created in the repo
3. Verify NO PRs were created
4. Verify NO commits were pushed
5. Verify Issues #3-#8 labels and comments unchanged
6. Collect runner evidence from `/opt/dev-fabric/evidence/github-agent-runs/`

## Phase 4: Abort Conditions

Abort the test immediately if:
- Issues #3-#8 get `agent:ready` label (Dispatcher picked wrong issue)
- Any code modification occurs
- Any branch creation or push occurs
- Any PR creation occurs
- Any cost exceeds `OPENCODE_MAX_COST_USD=0.25`
- Runner produces unexpected errors

### Abort Procedure
1. Remove `agent:ready` from all issues
2. Deactivate Dispatcher Workflow in n8n
3. Kill runner session: `pct enter 102; tmux kill-server`
4. Document abort reason
5. Do NOT proceed until root cause is identified

## Phase 5: Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Dummy issue processed | YES (completion comment posted) |
| Issues #3-#8 untouched | YES (all labels unchanged) |
| No code changes | YES (git diff empty) |
| No branch/PR created | YES |
| No cost overrun | YES (< $0.25) |
| Evidence produced | YES (runner evidence directory created) |
| Agent reported results correctly | YES (issue comment matches expectations) |

## Phase 6: Cleanup

After successful test:
1. Close the dummy issue (no merge)
2. Remove `agent:ready` label
3. Add `test:completed` label
4. Document results in evidence
5. Keep runner evidence for audit trail

## Important Constraints

- **This plan is NOT to be executed without explicit user approval**
- The user must explicitly say "execute the dummy agent test" or equivalent
- All hard constraints from the main run apply during the test
- No production Issue (#3-#8) may be started or modified
- No code in the repository may be modified
- No n8n workflow changes
- No Proxmox configuration changes
