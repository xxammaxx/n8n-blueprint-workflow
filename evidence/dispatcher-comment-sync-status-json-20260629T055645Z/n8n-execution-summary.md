# n8n Execution Summary — Issue #16

**Timestamp (UTC):** 2026-06-29T06:50:00Z

## Execution Details

| Field | Value |
|-------|-------|
| Execution ID | 240 |
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow Name | "GitHub Ready Issue → Runner Agent Dispatch" |
| Trigger | Schedule Trigger (15 min) |
| Started at | 2026-06-29T06:45:28.057Z |
| Status | `success` |
| Mode | `trigger` |

## Processed Issue

| Field | Value |
|-------|-------|
| Issue | #16 |
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/16 |
| Title | [Dummy] Comment sync verification v3 — dual-table database patch |
| Run ID | `gh-issue-16-20260629T064530Z` |
| Initial labels | `agent:ready`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |
| Final labels | `agent:needs-review`, `evidence:attached`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |

## Pipeline Flow

1. ✅ Schedule Trigger fired at 06:45 UTC
2. ✅ Issue #16 selected (agent:ready)
3. ✅ Guardrails passed
4. ✅ Labels updated (ready → running → needs-review + evidence:attached)
5. ✅ Runner started (lxc-dev-runner / 192.168.1.53)
6. ✅ Evidence generated
7. ✅ `status.json` read via SSH
8. ✅ **Comment posted with status.json values (PATCHED CODE!)**
9. ✅ Evidence source: `status.json`

## Post-Patch Execution Comparison

| Execution | Issue | Comment Source | Status | Mode | Provider | Correct? |
|-----------|-------|----------------|--------|------|----------|----------|
| #238 | #14 | RUN_INPUT.json (stale) | UNKNOWN | manual-terminal | NO | ❌ Pre-patch |
| #239 | #15 | RUN_INPUT.json (stale) | UNKNOWN | manual-terminal | NO | ❌ Pre-patch |
| #240 | #16 | status.json ✅ | GREEN | opencode-run | true | ✅ POST-PATCH! |

## Conclusion

✅ Execution #240 is the FIRST execution to use the patched code successfully. The dual-table database patch (workflow_entity + workflow_history) resolved the stale comment issue.
