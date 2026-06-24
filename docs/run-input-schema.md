# RUN_INPUT Schema — GitHub Source of Truth Extension

## Overview

RUN_INPUT.json is the contract between n8n (Orchestrator) and the Runner (LXC 102). With the GitHub Source-of-Truth extension, every RUN_INPUT now carries GitHub issue context and explicit approval boundaries.

## Full Schema (GitHub Source-of-Truth Mode)

```json
{
  "run_id": "gh-issue-123-20260623T120000Z",
  "source_of_truth": "github",
  "github": {
    "owner": "xxammaxx",
    "repo": "n8n-blueprint-workflow",
    "issue_number": 123,
    "issue_url": "https://github.com/xxammaxx/n8n-blueprint-workflow/issues/123",
    "trigger_label": "agent:ready"
  },
  "mode": "manual-terminal",
  "risk": "medium",
  "approval_policy": {
    "push": false,
    "pr": false,
    "merge": false,
    "github_actions": false,
    "provider_config": false
  },
  "runner": {
    "workspace_root": "/opt/dev-fabric/workspaces/projects",
    "evidence_root": "/opt/dev-fabric/evidence/github-agent-runs"
  },
  "agent_runtime": {
    "opencode_available": true,
    "opencode_version": "v1.17.9",
    "opencode_provider_configured": false,
    "hermes_available": false
  },
  "issue_context": {
    "title": "feat: GitHub als Source of Truth",
    "labels": ["agent:ready", "mode:manual-terminal", "risk:medium"],
    "mode": "manual-terminal",
    "risk": "medium"
  }
}
```

## Field Reference

### Top-Level

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `run_id` | string | yes | Unique run identifier, format: `gh-issue-<N>-<timestamp>` |
| `source_of_truth` | string | yes | Must be `"github"` for GitHub-driven runs |

### `github` Block

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `owner` | string | yes | GitHub owner (e.g., `xxammaxx`) |
| `repo` | string | yes | Repository name |
| `issue_number` | number | yes | GitHub issue number |
| `issue_url` | string | yes | Full issue URL for traceability |
| `trigger_label` | string | yes | Label that triggered the run (`agent:ready` or `agent:queued`) |

### `mode` Field

| Value | Description |
|-------|-------------|
| `manual-terminal` | **Default.** Safe mode. No agent autonomy. Runner produces handoff commands. |
| `opencode-run` | OpenCode autonomy in tmux. Requires: OpenCode installed + provider configured. |
| `hermes-review` | Hermes sidecar review. Requires: Hermes installed (not yet available). |

### `approval_policy` Block

Every approval is **default `false`**. Must be explicitly set to `true` only with separate human approval.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `push` | boolean | `false` | Git push to remote allowed |
| `pr` | boolean | `false` | Pull request creation allowed |
| `merge` | boolean | `false` | Merge/pull request merge allowed |
| `github_actions` | boolean | `false` | GitHub Actions creation/trigger allowed |
| `provider_config` | boolean | `false` | LLM provider/API-key configuration allowed |

### `agent_runtime` Block

| Field | Type | Description |
|-------|------|-------------|
| `opencode_available` | boolean | Whether OpenCode binary is installed on Runner |
| `opencode_version` | string | Detected version (e.g., `v1.17.9`) |
| `opencode_provider_configured` | boolean | Whether a LLM provider has been configured |
| `hermes_available` | boolean | Whether Hermes is installed |

## Runner Evidence Output

The Runner writes evidence to:
```
/opt/dev-fabric/evidence/github-agent-runs/<owner>/<repo>/issue-<number>/<run_id>/
```

### Evidence Files

| File | Content |
|------|---------|
| `RUN_INPUT.redacted.json` | Redacted copy of input (no secrets, no binary blobs) |
| `status.json` | Structured status (GREEN, GREEN_PARTIAL, BLOCKED) |
| `run-report.md` | Human-readable run report |
| `commands.log` | Commands executed during run |
| `agent.log` | Agent decision log |
| `github-context.md` | GitHub issue context for traceability |
| `operator-commands.md` | Manual handoff commands for operator |

## Conflict Resolution Rule

```
Wenn source_of_truth=github:
  → GitHub Issue Body + Labels sind die Wahrheit
  → n8n Form Input ist advisory
  → Chat-Verlauf / Memory ist advisory

Bei Widerspruch: GitHub gewinnt.
```

## Downstream Use of owner/repo/issue_number

The `github.owner`, `github.repo`, and `github.issue_number` fields are consumed by downstream n8n nodes in the GitHub Issue Intake workflow:

| Downstream Node | Fields Used | Access Pattern |
|-----------------|-------------|----------------|
| Node 9 (Format Evidence Comment) | `owner`, `repo`, `issue_number` | `$json.github.owner` (before API calls) |
| Node 10 (GitHub Comment API URL) | `owner`, `repo`, `issue_number` | `$json.github.owner` (URL path parameter) |
| Node 11 (Add Labels API URL) | `owner`, `repo`, `issue_number` | `$('Prepare RUN_INPUT.json').first().json.owner` (cross-node ref — FIXED) |
| Node 12 (Remove Label API URL) | `owner`, `repo`, `issue_number` | `$('Prepare RUN_INPUT.json').first().json.owner` (cross-node ref — FIXED) |

**⚠️ Important:** After Node 10 executes the GitHub Comment API, `$json` is overwritten with the API response. Nodes 11 and 12 **must** use cross-node references (`$('Prepare RUN_INPUT.json').first().json.owner`) instead of `$json.owner`.

The Prepare RUN_INPUT.json node (Node 3) always produces these fields as accessible JSON:
```json
{
  "owner": "xxammaxx",
  "repo": "n8n-blueprint-workflow",
  "issue_number": 1
}
```
These fields are the stable source of truth for all downstream label and comment API calls.

## Extension: Blueprint Bootstrap Mode

The existing blueprint bootstrap RUN_INPUT schema remains unchanged for non-GitHub-triggered runs. The GitHub Source-of-Truth extension adds parallel fields and does not break backward compatibility.

When both modes overlap (e.g., a GitHub issue triggers a blueprint bootstrap), the `source_of_truth` field determines which contract takes precedence.
