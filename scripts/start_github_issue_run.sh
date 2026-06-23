#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# start_github_issue_run.sh — GitHub Issue → Runner Agent Execution
# ============================================================================
# Akzeptiert RUN_INPUT.json mit source_of_truth=github
# Erzeugt Evidence unter /opt/dev-fabric/evidence/github-agent-runs/
# ============================================================================

usage() {
  cat <<'USAGE'
usage: start_github_issue_run.sh --input-json /path/to/RUN_INPUT.json
USAGE
}

fail() {
  echo "error: $*" >&2
  exit 1
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

run_json() {
  local expr="$1"
  jq -er "$expr" "$INPUT_JSON"
}

write_file() {
  local path="$1"
  local body="$2"
  mkdir -p "$(dirname "$path")"
  printf '%b' "$body" > "$path"
}

# ── Argument Parsing ────────────────────────────────────────────────────────

INPUT_JSON=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --input-json)
      INPUT_JSON="${2:-}"
      shift 2
      ;;
    --input-json=*)
      INPUT_JSON="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "unknown argument: $1"
      ;;
  esac
done

[[ -n "$INPUT_JSON" ]] || { usage; exit 64; }
[[ -f "$INPUT_JSON" ]] || fail "input JSON not found: $INPUT_JSON"
have_cmd jq || fail "jq is required"

# ── Extract Core Fields ─────────────────────────────────────────────────────

SOURCE_OF_TRUTH="$(run_json '.source_of_truth')"
RUN_ID="$(jq -r '.run_id // empty' "$INPUT_JSON")"
MODE="$(run_json '.mode')"

if [[ "$SOURCE_OF_TRUTH" != "github" ]]; then
  fail "source_of_truth must be 'github', got: $SOURCE_OF_TRUTH"
fi

GH_OWNER="$(run_json '.github.owner')"
GH_REPO="$(run_json '.github.repo')"
GH_ISSUE_NUMBER="$(run_json '.github.issue_number')"
GH_ISSUE_URL="$(run_json '.github.issue_url')"
GH_TRIGGER_LABEL="$(jq -r '.github.trigger_label // "agent:ready"' "$INPUT_JSON")"

# Validate GitHub fields
[[ -n "$GH_OWNER" ]] || fail "github.owner is required"
[[ -n "$GH_REPO" ]] || fail "github.repo is required"
[[ -n "$GH_ISSUE_NUMBER" ]] || fail "github.issue_number is required"
[[ -n "$GH_ISSUE_URL" ]] || fail "github.issue_url is required"

# Extract approval policy
APPROVAL_PUSH="$(jq -r '.approval_policy.push // false' "$INPUT_JSON")"
APPROVAL_PR="$(jq -r '.approval_policy.pr // false' "$INPUT_JSON")"
APPROVAL_MERGE="$(jq -r '.approval_policy.merge // false' "$INPUT_JSON")"
APPROVAL_GH_ACTIONS="$(jq -r '.approval_policy.github_actions // false' "$INPUT_JSON")"
APPROVAL_PROVIDER="$(jq -r '.approval_policy.provider_config // false' "$INPUT_JSON")"

# Extract runner paths
RUNNER_WORKSPACE="$(jq -r '.runner.workspace_root // "/opt/dev-fabric/workspaces/projects"' "$INPUT_JSON")"
RUNNER_EVIDENCE="$(jq -r '.runner.evidence_root // "/opt/dev-fabric/evidence/github-agent-runs"' "$INPUT_JSON")"

# Extract agent runtime info
OPENCODE_AVAILABLE="$(jq -r '.agent_runtime.opencode_available // false' "$INPUT_JSON")"
OPENCODE_VERSION="$(jq -r '.agent_runtime.opencode_version // "not-installed"' "$INPUT_JSON")"
OPENCODE_PROVIDER_CONFIGURED="$(jq -r '.agent_runtime.opencode_provider_configured // false' "$INPUT_JSON")"
HERMES_AVAILABLE="$(jq -r '.agent_runtime.hermes_available // false' "$INPUT_JSON")"

# ── Generate Run ID if missing ──────────────────────────────────────────────

if [[ -z "$RUN_ID" ]]; then
  RUN_ID="gh-issue-${GH_ISSUE_NUMBER}-$(date -u +%Y%m%dT%H%M%SZ)"
fi

# ── Evidence Paths ──────────────────────────────────────────────────────────

RUN_DIR="$RUNNER_EVIDENCE/$GH_OWNER/$GH_REPO/issue-${GH_ISSUE_NUMBER}/$RUN_ID"
STATUS_JSON="$RUN_DIR/status.json"
RUN_REPORT="$RUN_DIR/run-report.md"
COMMANDS_LOG="$RUN_DIR/commands.log"
AGENT_LOG="$RUN_DIR/agent.log"
GITHUB_CONTEXT="$RUN_DIR/github-context.md"
REDACTED_JSON="$RUN_DIR/RUN_INPUT.redacted.json"
OPERATOR_COMMANDS="$RUN_DIR/operator-commands.md"

# ── Create Evidence Directory ───────────────────────────────────────────────

mkdir -p "$RUN_DIR"

# ── Write Redacted RUN_INPUT ────────────────────────────────────────────────

redacted_json="$(jq -n \
  --arg run_id "$RUN_ID" \
  --arg source_of_truth "$SOURCE_OF_TRUTH" \
  --argjson issue_number "$GH_ISSUE_NUMBER" \
  --arg issue_url "$GH_ISSUE_URL" \
  --arg owner "$GH_OWNER" \
  --arg repo "$GH_REPO" \
  --arg trigger_label "$GH_TRIGGER_LABEL" \
  --arg mode "$MODE" \
  --argjson push "$APPROVAL_PUSH" \
  --argjson pr "$APPROVAL_PR" \
  --argjson merge "$APPROVAL_MERGE" \
  --argjson github_actions "$APPROVAL_GH_ACTIONS" \
  --argjson provider_config "$APPROVAL_PROVIDER" \
  --arg workspace "$RUNNER_WORKSPACE" \
  --arg evidence_root "$RUNNER_EVIDENCE" \
  --argjson opencode_available "$OPENCODE_AVAILABLE" \
  --arg opencode_version "$OPENCODE_VERSION" \
  --argjson opencode_provider_configured "$OPENCODE_PROVIDER_CONFIGURED" \
  --argjson hermes_available "$HERMES_AVAILABLE" \
  '{
    run_id: $run_id,
    source_of_truth: $source_of_truth,
    github: {
      owner: $owner,
      repo: $repo,
      issue_number: $issue_number,
      issue_url: $issue_url,
      trigger_label: $trigger_label
    },
    mode: $mode,
    approval_policy: {
      push: $push,
      pr: $pr,
      merge: $merge,
      github_actions: $github_actions,
      provider_config: $provider_config
    },
    runner: {
      workspace_root: $workspace,
      evidence_root: $evidence_root
    },
    agent_runtime: {
      opencode_available: $opencode_available,
      opencode_version: $opencode_version,
      opencode_provider_configured: $opencode_provider_configured,
      hermes_available: $hermes_available
    }
  }')"
printf '%s\n' "$redacted_json" > "$REDACTED_JSON"

# ── Write GitHub Context ────────────────────────────────────────────────────

cat > "$GITHUB_CONTEXT" <<GHCTX
# GitHub Context

- **Issue URL:** $GH_ISSUE_URL
- **Owner:** $GH_OWNER
- **Repo:** $GH_REPO
- **Issue Number:** $GH_ISSUE_NUMBER
- **Trigger Label:** $GH_TRIGGER_LABEL
- **Source of Truth:** $SOURCE_OF_TRUTH
GHCTX

# ── Determine Effective Mode ────────────────────────────────────────────────

EFFECTIVE_MODE="$MODE"
MANUAL_REASON=""
AGENT_STATUS="GREEN_PARTIAL"

# Check OpenCode availability on this runner
OPENCODE_ACTUALLY_AVAILABLE=false
OPENCODE_ACTUAL_VERSION="not-installed"
if have_cmd opencode; then
  OPENCODE_ACTUALLY_AVAILABLE=true
  OPENCODE_ACTUAL_VERSION="$(opencode --version 2>/dev/null || opencode version 2>/dev/null || echo "unknown")"
fi

TMUX_ACTUALLY_AVAILABLE=false
if have_cmd tmux; then
  TMUX_ACTUALLY_AVAILABLE=true
fi

HERMES_ACTUALLY_AVAILABLE=false
if have_cmd hermes; then
  HERMES_ACTUALLY_AVAILABLE=true
fi

case "$MODE" in
  manual-terminal)
    EFFECTIVE_MODE="manual-terminal"
    MANUAL_REASON="manual-terminal mode selected — safe default, no agent autonomy."
    AGENT_STATUS="GREEN_PARTIAL"
    ;;
  opencode-run)
    if ! $OPENCODE_ACTUALLY_AVAILABLE; then
      MANUAL_REASON="opencode-run requested but opencode is not installed. Falling back to manual-terminal."
      EFFECTIVE_MODE="manual-terminal"
      AGENT_STATUS="GREEN_PARTIAL"
    elif ! $OPENCODE_PROVIDER_CONFIGURED; then
      MANUAL_REASON="opencode-run requested but no LLM provider configured. Falling back to manual-terminal. Provider configuration requires separate approval."
      EFFECTIVE_MODE="manual-terminal"
      AGENT_STATUS="GREEN_PARTIAL"
    elif ! $TMUX_ACTUALLY_AVAILABLE; then
      MANUAL_REASON="opencode-run requested but tmux is not available. Falling back to manual-terminal."
      EFFECTIVE_MODE="manual-terminal"
      AGENT_STATUS="GREEN_PARTIAL"
    else
      EFFECTIVE_MODE="opencode-run"
      AGENT_STATUS="GREEN"
      MANUAL_REASON=""
    fi
    ;;
  hermes-review)
    if ! $HERMES_ACTUALLY_AVAILABLE; then
      MANUAL_REASON="hermes-review requested but hermes is not installed (planned as optional sidecar). Falling back to manual-terminal."
      EFFECTIVE_MODE="manual-terminal"
      AGENT_STATUS="GREEN_PARTIAL"
    fi
    ;;
  *)
    MANUAL_REASON="unknown mode: $MODE. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
    ;;
esac

# ── Write commands.log ──────────────────────────────────────────────────────

cat > "$COMMANDS_LOG" <<CMDEOF
# Commands executed for $RUN_ID
# Mode: $EFFECTIVE_MODE
# Source of Truth: $SOURCE_OF_TRUTH
# Issue: $GH_ISSUE_URL

## System Check
$(date -u +"[%Y-%m-%dT%H:%M:%SZ]") hostname: $(hostname)
$(date -u +"[%Y-%m-%dT%H:%M:%SZ]") whoami: $(whoami)
CMDEOF

# ── Write agent.log ─────────────────────────────────────────────────────────

cat > "$AGENT_LOG" <<AGENTEOF
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] start_github_issue_run.sh started
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] run_id=$RUN_ID
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] source_of_truth=$SOURCE_OF_TRUTH
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] issue_url=$GH_ISSUE_URL
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] issue_number=$GH_ISSUE_NUMBER
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] requested_mode=$MODE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] effective_mode=$EFFECTIVE_MODE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] manual_reason=${MANUAL_REASON:-none}
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode_actually_available=$OPENCODE_ACTUALLY_AVAILABLE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode_version=$OPENCODE_ACTUAL_VERSION
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode_provider_configured=$OPENCODE_PROVIDER_CONFIGURED
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] tmux_available=$TMUX_ACTUALLY_AVAILABLE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] hermes_available=$HERMES_ACTUALLY_AVAILABLE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] approval_push=$APPROVAL_PUSH
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] approval_pr=$APPROVAL_PR
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] approval_merge=$APPROVAL_MERGE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] approval_github_actions=$APPROVAL_GH_ACTIONS
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] approval_provider_config=$APPROVAL_PROVIDER
AGENTEOF

# ── Write Operator Commands ─────────────────────────────────────────────────

TMUX_SESSION_NAME="gh-issue-${GH_ISSUE_NUMBER}-${RUN_ID//[^a-zA-Z0-9]/}"
TMUX_SESSION_NAME="${TMUX_SESSION_NAME:0:60}"

cat > "$OPERATOR_COMMANDS" <<OPEOF
# Operator Commands — $RUN_ID

**Status:** $AGENT_STATUS
**Mode:** $EFFECTIVE_MODE
**Issue:** $GH_ISSUE_URL

## Manual handoff commands

### Attach to tmux session (if opencode-run)
\`\`\`bash
ssh runner@192.168.1.53
tmux attach -t $TMUX_SESSION_NAME
\`\`\`

### View live agent log
\`\`\`bash
ssh runner@192.168.1.53 "tail -f $AGENT_LOG"
\`\`\`

### View evidence
\`\`\`bash
ssh runner@192.168.1.53 "cat $RUN_REPORT"
\`\`\`

### Stop tmux session
\`\`\`bash
ssh runner@192.168.1.53 "tmux kill-session -t $TMUX_SESSION_NAME"
\`\`\`

## System State
- OpenCode available: $OPENCODE_ACTUALLY_AVAILABLE
- OpenCode version: $OPENCODE_ACTUAL_VERSION
- OpenCode provider configured: $OPENCODE_PROVIDER_CONFIGURED
- Tmux available: $TMUX_ACTUALLY_AVAILABLE
- Hermes available: $HERMES_ACTUALLY_AVAILABLE
OPEOF

# ── Write Run Report ────────────────────────────────────────────────────────

cat > "$RUN_REPORT" <<REPORTEOF
# GitHub Issue Run Report

## Status: $AGENT_STATUS

**Run ID:** $RUN_ID
**Source of Truth:** $SOURCE_OF_TRUTH
**Mode (requested):** $MODE
**Mode (effective):** $EFFECTIVE_MODE
**Manual reason:** ${MANUAL_REASON:-none}

## GitHub Context

| Field | Value |
|-------|-------|
| Issue URL | $GH_ISSUE_URL |
| Owner | $GH_OWNER |
| Repo | $GH_REPO |
| Issue Number | $GH_ISSUE_NUMBER |
| Trigger Label | $GH_TRIGGER_LABEL |

## Agent Runtime

| Tool | Available | Version |
|------|-----------|---------|
| OpenCode | $OPENCODE_ACTUALLY_AVAILABLE | $OPENCODE_ACTUAL_VERSION |
| Provider configured | $OPENCODE_PROVIDER_CONFIGURED | — |
| Tmux | $TMUX_ACTUALLY_AVAILABLE | — |
| Hermes | $HERMES_ACTUALLY_AVAILABLE | — |

## Approval State

| Action | Approved |
|--------|----------|
| Push | $APPROVAL_PUSH |
| PR | $APPROVAL_PR |
| Merge | $APPROVAL_MERGE |
| GitHub Actions | $APPROVAL_GH_ACTIONS |
| Provider/API-Key config | $APPROVAL_PROVIDER |

## Evidence Paths

- Run directory: \`$RUN_DIR\`
- Status: \`$STATUS_JSON\`
- Run report: \`$RUN_REPORT\`
- Commands log: \`$COMMANDS_LOG\`
- Agent log: \`$AGENT_LOG\`
- GitHub context: \`$GITHUB_CONTEXT\`
- Redacted input: \`$REDACTED_JSON\`
- Operator commands: \`$OPERATOR_COMMANDS\`

## Limits

- No push, no PR, no merge without explicit approval.
- No GitHub Actions without explicit approval.
- No provider/API-key configuration without explicit approval.
- OpenCode v1.17.9 is installed but provider/auth is NOT configured.
- Hermes is NOT installed (planned as optional sidecar).
REPORTEOF

# ── Write Status JSON ───────────────────────────────────────────────────────

status_json="$(jq -n \
  --arg status "$AGENT_STATUS" \
  --arg run_id "$RUN_ID" \
  --arg source_of_truth "$SOURCE_OF_TRUTH" \
  --arg issue_url "$GH_ISSUE_URL" \
  --argjson issue_number "$GH_ISSUE_NUMBER" \
  --arg owner "$GH_OWNER" \
  --arg repo "$GH_REPO" \
  --arg requested_mode "$MODE" \
  --arg effective_mode "$EFFECTIVE_MODE" \
  --arg manual_reason "${MANUAL_REASON:-}" \
  --argjson opencode_available "$OPENCODE_ACTUALLY_AVAILABLE" \
  --arg opencode_version "$OPENCODE_ACTUAL_VERSION" \
  --argjson opencode_provider_configured "$OPENCODE_PROVIDER_CONFIGURED" \
  --argjson tmux_available "$TMUX_ACTUALLY_AVAILABLE" \
  --argjson hermes_available "$HERMES_ACTUALLY_AVAILABLE" \
  --argjson approval_push "$APPROVAL_PUSH" \
  --argjson approval_pr "$APPROVAL_PR" \
  --argjson approval_merge "$APPROVAL_MERGE" \
  --argjson approval_github_actions "$APPROVAL_GH_ACTIONS" \
  --argjson approval_provider_config "$APPROVAL_PROVIDER" \
  --arg run_dir "$RUN_DIR" \
  --arg run_report "$RUN_REPORT" \
  --arg commands_log "$COMMANDS_LOG" \
  --arg agent_log "$AGENT_LOG" \
  --arg github_context "$GITHUB_CONTEXT" \
  --arg redacted_json "$REDACTED_JSON" \
  --arg operator_commands "$OPERATOR_COMMANDS" \
  '{
    status: $status,
    run_id: $run_id,
    source_of_truth: $source_of_truth,
    github: {
      issue_url: $issue_url,
      issue_number: $issue_number,
      owner: $owner,
      repo: $repo
    },
    mode: {
      requested: $requested_mode,
      effective: $effective_mode,
      manual_reason: $manual_reason
    },
    agent_runtime: {
      opencode_available: $opencode_available,
      opencode_version: $opencode_version,
      opencode_provider_configured: $opencode_provider_configured,
      tmux_available: $tmux_available,
      hermes_available: $hermes_available
    },
    approval_policy: {
      push: $approval_push,
      pr: $approval_pr,
      merge: $approval_merge,
      github_actions: $approval_github_actions,
      provider_config: $approval_provider_config
    },
    evidence_paths: {
      run_dir: $run_dir,
      run_report: $run_report,
      commands_log: $commands_log,
      agent_log: $agent_log,
      github_context: $github_context,
      redacted_json: $redacted_json,
      operator_commands: $operator_commands
    }
  }')"
printf '%s\n' "$status_json" > "$STATUS_JSON"

# ── Final Output ────────────────────────────────────────────────────────────

# Output status.json to stdout for n8n SSH Read node
printf '%s\n' "$status_json"

exit 0
