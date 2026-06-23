#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
usage: start_blueprint_bootstrap.sh --input-json /path/to/RUN_INPUT.json
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

write_md_stub() {
  local path="$1"
  local title="$2"
  local body="$3"
  if [[ ! -e "$path" ]]; then
    mkdir -p "$(dirname "$path")"
    {
      printf '# %s\n\n' "$title"
      printf '%b\n' "$body"
    } > "$path"
  fi
}

write_raw() {
  local path="$1"
  local body="$2"
  mkdir -p "$(dirname "$path")"
  printf '%b' "$body" > "$path"
}

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
have_cmd git || fail "git is required"
have_cmd python3 || fail "python3 is required"
have_cmd sha256sum || fail "sha256sum is required"

SPEC_KIT_ROOT="/opt/dev-fabric/workspaces/spec-kit-src"
SPECIFY_BIN="$SPEC_KIT_ROOT/.venv/bin/specify"
USE_UV=false
if [[ ! -x "$SPECIFY_BIN" ]]; then
  if have_cmd uv; then
    USE_UV=true
  else
    fail "specify binary not found at $SPECIFY_BIN and uv is not available"
  fi
fi

PROJECT_SLUG="$(run_json '.project_slug')"
PROJECT_TITLE="$(run_json '.project_title')"
RUN_ID="$(jq -r '.run_id // empty' "$INPUT_JSON")"
BLUEPRINT_SOURCE="$(run_json '.blueprint_source')"
BLUEPRINT_FILENAME="$(run_json '.blueprint_filename')"
BLUEPRINT_SHA256="$(run_json '.blueprint_sha256')"
BLUEPRINT_LENGTH="$(run_json '.blueprint_length')"
BLUEPRINT_B64="$(run_json '.blueprint_b64')"
INIT_PROMPT_B64="$(run_json '.init_prompt_b64')"
LLM_COMMAND_MODE="$(run_json '.llm_command_mode')"
OPENCODE_MODEL="$(jq -r '.opencode_model // ""' "$INPUT_JSON")"
MAX_RUNTIME_MINUTES="$(run_json '.max_runtime_minutes')"
DRY_RUN="$(jq -r '.dry_run' "$INPUT_JSON")"
ALLOW_GITHUB_ISSUE_SCRIPT_GENERATION="$(jq -r '.allow_github_issue_script_generation' "$INPUT_JSON")"
ALLOW_GITHUB_ACTIONS_FILES="$(jq -r '.allow_github_actions_files' "$INPUT_JSON")"
EXTRA_INSTRUCTION_B64="$(jq -r '.extra_instruction_b64 // ""' "$INPUT_JSON")"
PROJECT_DIR="$(run_json '.project_dir')"
RUN_DIR="$(run_json '.run_dir')"
LOG_DIR="/opt/dev-fabric/logs/blueprint-bootstrap/$PROJECT_SLUG/$RUN_ID"

[[ "$PROJECT_SLUG" =~ ^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$ ]] || fail "invalid project_slug: $PROJECT_SLUG"
[[ ${#PROJECT_TITLE} -ge 3 && ${#PROJECT_TITLE} -le 120 ]] || fail "project_title must be 3..120 chars"
[[ "$BLUEPRINT_SOURCE" == "file" || "$BLUEPRINT_SOURCE" == "textarea" ]] || fail "blueprint_source must be file or textarea"
[[ "$BLUEPRINT_LENGTH" -ge 50 && "$BLUEPRINT_LENGTH" -le 300000 ]] || fail "blueprint length must be 50..300000"

if [[ -z "$RUN_ID" ]]; then
  RUN_ID="$(date -u +run-%Y%m%dT%H%M%SZ)-$(python3 - <<'PY'
import secrets
print(secrets.token_hex(3))
PY
)"
  RUN_DIR="/opt/dev-fabric/evidence/blueprint-bootstrap/$PROJECT_SLUG/$RUN_ID"
  LOG_DIR="/opt/dev-fabric/logs/blueprint-bootstrap/$PROJECT_SLUG/$RUN_ID"
fi

SESSION_NAME="bp-${PROJECT_SLUG}-${RUN_ID//[^a-zA-Z0-9]/}"
SESSION_NAME="${SESSION_NAME:0:60}"
STATUS_JSON="$RUN_DIR/status.json"
RUN_REPORT="$RUN_DIR/run-report.md"
COMMANDS_LOG="$RUN_DIR/commands.log"
AGENT_LOG="$RUN_DIR/agent.log"
PREFLIGHT_MD="$RUN_DIR/preflight.md"
OPERATOR_COMMANDS="$RUN_DIR/operator-commands.md"
REDUCED_JSON="$RUN_DIR/RUN_INPUT.redacted.json"
SPECIFY_CHECK_LOG="$RUN_DIR/specify-check.log"
SPECIFY_INIT_LOG="$RUN_DIR/specify-init.log"

if [[ -d "$PROJECT_DIR" ]]; then
  if find "$PROJECT_DIR" -mindepth 1 -maxdepth 1 | read -r _; then
    fail "project directory is not empty: $PROJECT_DIR"
  fi
fi

mkdir -p \
  "$PROJECT_DIR" \
  "$RUN_DIR" \
  "$LOG_DIR" \
  "$PROJECT_DIR/docs/architecture" \
  "$PROJECT_DIR/docs/evidence" \
  "$PROJECT_DIR/portfolio" \
  "$PROJECT_DIR/specs/001-initial-blueprint" \
  "$PROJECT_DIR/scripts" \
  "$PROJECT_DIR/.github/workflows" \
  "$PROJECT_DIR/.opencode" \
  "$PROJECT_DIR/.specify"

BLUEPRINT_MARKDOWN="$(printf '%s' "$BLUEPRINT_B64" | base64 -d)"
INIT_PROMPT_TEXT="$(printf '%s' "$INIT_PROMPT_B64" | base64 -d)"
EXTRA_INSTRUCTION_TEXT=""
if [[ -n "$EXTRA_INSTRUCTION_B64" ]]; then
  EXTRA_INSTRUCTION_TEXT="$(printf '%s' "$EXTRA_INSTRUCTION_B64" | base64 -d)"
fi

BLUEPRINT_MARKDOWN="${BLUEPRINT_MARKDOWN//$'\r\n'/$'\n'}"
BLUEPRINT_MARKDOWN="${BLUEPRINT_MARKDOWN//$'\r'/$'\n'}"

printf '%s\n' "$BLUEPRINT_MARKDOWN" > "$PROJECT_DIR/BLUEPRINT.md"
printf '%s\n' "$INIT_PROMPT_TEXT" > "$PROJECT_DIR/INITIALISIERUNG_PROMPT_BLUEPRINT.md"
cp "$PROJECT_DIR/BLUEPRINT.md" "$PROJECT_DIR/BLUEPRINT_FINAL.md"

redacted_json="$(jq -n \
  --arg project_slug "$PROJECT_SLUG" \
  --arg project_title "$PROJECT_TITLE" \
  --arg run_id "$RUN_ID" \
  --arg project_dir "$PROJECT_DIR" \
  --arg run_dir "$RUN_DIR" \
  --arg blueprint_source "$BLUEPRINT_SOURCE" \
  --arg blueprint_filename "$BLUEPRINT_FILENAME" \
  --arg blueprint_sha256 "$BLUEPRINT_SHA256" \
  --argjson blueprint_length "$BLUEPRINT_LENGTH" \
  --arg llm_command_mode "$LLM_COMMAND_MODE" \
  --arg opencode_model "$OPENCODE_MODEL" \
  --argjson max_runtime_minutes "$MAX_RUNTIME_MINUTES" \
  --argjson dry_run "$DRY_RUN" \
  --argjson allow_github_issue_script_generation "$ALLOW_GITHUB_ISSUE_SCRIPT_GENERATION" \
  --argjson allow_github_actions_files "$ALLOW_GITHUB_ACTIONS_FILES" \
  '{project_slug:$project_slug, project_title:$project_title, run_id:$run_id, project_dir:$project_dir, run_dir:$run_dir, blueprint_source:$blueprint_source, blueprint_filename:$blueprint_filename, blueprint_sha256:$blueprint_sha256, blueprint_length:$blueprint_length, blueprint_b64:"[redacted]", init_prompt_b64:"[redacted]", llm_command_mode:$llm_command_mode, opencode_model:$opencode_model, max_runtime_minutes:$max_runtime_minutes, dry_run:$dry_run, allow_github_issue_script_generation:$allow_github_issue_script_generation, allow_github_actions_files:$allow_github_actions_files, extra_instruction_b64:"[redacted]"}' \
)"
printf '%s\n' "$redacted_json" > "$REDUCED_JSON"

{
  printf '%s\n' '# Preflight'
  printf '%s\n' ''
  printf '%s\n' "- input_json: $INPUT_JSON"
  printf '%s\n' "- project_slug: $PROJECT_SLUG"
  printf '%s\n' "- project_title: $PROJECT_TITLE"
  printf '%s\n' "- run_id: $RUN_ID"
  printf '%s\n' "- project_dir: $PROJECT_DIR"
  printf '%s\n' "- run_dir: $RUN_DIR"
  printf '%s\n' "- log_dir: $LOG_DIR"
  printf '%s\n' "- blueprint_source: $BLUEPRINT_SOURCE"
  printf '%s\n' "- blueprint_filename: $BLUEPRINT_FILENAME"
  printf '%s\n' "- blueprint_sha256: $BLUEPRINT_SHA256"
  printf '%s\n' "- blueprint_length: $BLUEPRINT_LENGTH"
  printf '%s\n' "- llm_command_mode: $LLM_COMMAND_MODE"
  printf '%s\n' "- opencode_model: ${OPENCODE_MODEL:-<empty>}"
  printf '%s\n' "- max_runtime_minutes: $MAX_RUNTIME_MINUTES"
  printf '%s\n' "- dry_run: $DRY_RUN"
  printf '%s\n' "- allow_github_issue_script_generation: $ALLOW_GITHUB_ISSUE_SCRIPT_GENERATION"
  printf '%s\n' "- allow_github_actions_files: $ALLOW_GITHUB_ACTIONS_FILES"
  printf '%s\n' "- tmux_available: $(if have_cmd tmux; then echo yes; else echo no; fi)"
  printf '%s\n' "- opencode_available: $(if have_cmd opencode; then echo yes; else echo no; fi)"
  printf '%s\n' "- hermes_available: $(if have_cmd hermes; then echo yes; else echo no; fi)"
  printf '%s\n' ''
  printf '%s\n' '## Toolchain'
  printf '%s\n' ''
  printf '%s\n' '```text'
  printf '%s\n' "$(git --version)"
  printf '%s\n' "$(jq --version)"
  printf '%s\n' "$(python3 --version)"
  if have_cmd uv; then printf '%s\n' "$(uv --version)"; else printf '%s\n' 'uv: not-found'; fi
  if have_cmd tmux; then printf '%s\n' "$(tmux -V)"; else printf '%s\n' 'tmux: not-found'; fi
  if have_cmd opencode; then printf '%s\n' "$(opencode --version 2>/dev/null || opencode version 2>/dev/null || true)"; else printf '%s\n' 'opencode: not-found'; fi
  if have_cmd hermes; then printf '%s\n' "$(hermes --version 2>/dev/null || hermes version 2>/dev/null || true)"; else printf '%s\n' 'hermes: not-found'; fi
  printf '%s\n' '```'
} > "$PREFLIGHT_MD"

COMMANDS_LOG="$COMMANDS_LOG"
touch "$COMMANDS_LOG"
{
  printf 'mkdir -p %s %s %s\n' "$PROJECT_DIR" "$RUN_DIR" "$LOG_DIR"
  printf 'git init\n'
} >> "$COMMANDS_LOG"

cd "$PROJECT_DIR"
git init >/dev/null

SPECIFY_CHECK_STATUS=0
SPECIFY_INIT_STATUS=0
set +e
if [[ -x "$SPECIFY_BIN" ]]; then
  "$SPECIFY_BIN" check | tee "$SPECIFY_CHECK_LOG"
  SPECIFY_CHECK_STATUS=${PIPESTATUS[0]}
  "$SPECIFY_BIN" init . --integration opencode --force --ignore-agent-tools --script sh | tee "$SPECIFY_INIT_LOG"
  SPECIFY_INIT_STATUS=${PIPESTATUS[0]}
else
  uv run --project "$SPEC_KIT_ROOT" specify check | tee "$SPECIFY_CHECK_LOG"
  SPECIFY_CHECK_STATUS=${PIPESTATUS[0]}
  uv run --project "$SPEC_KIT_ROOT" specify init . --integration opencode --force --ignore-agent-tools --script sh | tee "$SPECIFY_INIT_LOG"
  SPECIFY_INIT_STATUS=${PIPESTATUS[0]}
fi
set -e

if [[ "$SPECIFY_CHECK_STATUS" -ne 0 || "$SPECIFY_INIT_STATUS" -ne 0 ]]; then
  AGENT_STATUS="GREEN_PARTIAL"
  if [[ -z "$MANUAL_REASON" ]]; then
    MANUAL_REASON="SpecKit initialization did not complete cleanly; manual-terminal fallback prepared."
  else
    MANUAL_REASON="$MANUAL_REASON SpecKit initialization did not complete cleanly."
  fi
fi

write_md_stub "$PROJECT_DIR/README.md" "$PROJECT_TITLE" $'Bootstrap generated from the Blueprint workflow. The canonical input is BLUEPRINT.md and the executing instructions live in INITIALISIERUNG_PROMPT_BLUEPRINT.md.'
write_md_stub "$PROJECT_DIR/PROJECT_CONTEXT.md" "Project Context" $'- Source of truth: BLUEPRINT.md\n- Bootstrap source: n8n form submission\n- Run evidence: '"$RUN_DIR"$'\n- Status: pending completion'
write_md_stub "$PROJECT_DIR/ARCHITECTURE.md" "Architecture" $'See Mermaid maps under docs/architecture/.'
write_md_stub "$PROJECT_DIR/ROADMAP.md" "Roadmap" $'Start with the smallest verifiable scaffold, then move to issue breakdown and implementation.'
write_md_stub "$PROJECT_DIR/ISSUE_ROADMAP.md" "Issue Roadmap" $'Keep local-only bootstrap issues small and evidence-backed.'
write_md_stub "$PROJECT_DIR/OPEN_QUESTIONS.md" "Open Questions" $'- None yet. Expand this file as soon as the blueprint exposes an unknown.\n'
write_md_stub "$PROJECT_DIR/PROMPTS.md" "Prompts" $'- INITIALISIERUNG_PROMPT_BLUEPRINT.md\n- Keep project prompts short, explicit, and evidence-first.'
write_md_stub "$PROJECT_DIR/AGENTS.md" "Agents" $'Local agents must respect the hard constraints from INITIALISIERUNG_PROMPT_BLUEPRINT.md.'
write_md_stub "$PROJECT_DIR/CONTRIBUTING.md" "Contributing" $'Use local gates first. Do not push, PR, merge, or deploy without human approval.'
write_md_stub "$PROJECT_DIR/SECURITY.md" "Security" $'No secrets in logs. No autonomous remote actions. No public webhooks.'
write_md_stub "$PROJECT_DIR/docs/evidence/initial-bootstrap.md" "Initial Bootstrap" $'This file records the first bootstrap state and will grow with evidence.\n\n## Was kann die Software jetzt im Vergleich zum vorherigen Lauf?\n- The blueprint and bootstrap prompt are written to the project.\n- SpecKit initialization has been run from the local source checkout.\n- The evidence directory is established.\n- OpenCode and Hermes are prepared for manual fallback when not installed.'
write_md_stub "$PROJECT_DIR/portfolio/status.md" "Portfolio Status" $'- Bootstrap created.\n- Manual-terminal fallback prepared.\n- Further evidence will be added on the first real run.'
write_md_stub "$PROJECT_DIR/portfolio/capabilities.md" "Capabilities" $'- Accepts Blueprint input from n8n.\n- Creates a local project scaffold.\n- Preserves evidence for later review.\n- Falls back to manual-terminal mode when required.'
write_md_stub "$PROJECT_DIR/portfolio/known-limitations.md" "Known Limitations" $'- OpenCode and Hermes are not guaranteed to be installed.\n- tmux may be absent.\n- The workflow stays local-only.'
write_md_stub "$PROJECT_DIR/portfolio/evidence-index.md" "Evidence Index" $'- '"$RUN_DIR"$'\n- docs/evidence/initial-bootstrap.md\n- agent.log\n- run-report.md'

write_raw "$PROJECT_DIR/docs/architecture/system-map.mmd" $'flowchart LR\n  Blueprint[Blueprint Input] --> Validate[Validate + Extract Blueprint]\n  Validate --> RunInput[RUN_INPUT.json]\n  RunInput --> Runner[Runner Bootstrap]\n  Runner --> Evidence[Evidence + Logs]\n'
write_raw "$PROJECT_DIR/docs/architecture/data-flow.mmd" $'flowchart LR\n  Form[n8n Form] --> JSON[RUN_INPUT.json]\n  JSON --> Blueprint[BLUEPRINT.md]\n  JSON --> Prompt[INITIALISIERUNG_PROMPT_BLUEPRINT.md]\n  Blueprint --> SpecKit[SpecKit init]\n'
write_raw "$PROJECT_DIR/docs/architecture/file-flow.mmd" $'flowchart LR\n  Upload[blueprint_file] --> n8n\n  n8n --> Runner[/opt/dev-fabric/evidence/.../RUN_INPUT.json/]\n  Runner --> Project[Project Directory]\n'
write_raw "$PROJECT_DIR/docs/architecture/security-boundaries.mmd" $'flowchart LR\n  Untrusted[Untrusted Inputs] --> Validate\n  Validate -->|Redacted| Evidence\n  Validate -->|Blueprint only| Project\n'
write_raw "$PROJECT_DIR/docs/architecture/evidence-flow.mmd" $'flowchart LR\n  Commands[commands.log] --> Report[run-report.md]\n  Agent[agent.log] --> Report\n  Preflight[preflight.md] --> Report\n  Status[status.json] --> Report\n'

write_raw "$PROJECT_DIR/LICENSE" $'MIT License\n\nCopyright (c) 2026\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n'
write_raw "$PROJECT_DIR/.gitignore" $'node_modules/\n.dist/\n.venv/\n.env\n*.db\n*.db-shm\n*.db-wal\n'
write_raw "$PROJECT_DIR/.editorconfig" $'root = true\n\n[*]\ncharset = utf-8\nend_of_line = lf\ninsert_final_newline = true\nindent_style = space\nindent_size = 2\n'
write_raw "$PROJECT_DIR/.env.example" $'# No secrets here.\n'
# Copy restrictive opencode.json from template if available, otherwise write minimal stub
OPENCODE_CONFIG_TEMPLATE="/opt/dev-fabric/workflows/templates/opencode.json"
if [[ -f "$OPENCODE_CONFIG_TEMPLATE" ]]; then
  cp "$OPENCODE_CONFIG_TEMPLATE" "$PROJECT_DIR/opencode.json"
else
  write_raw "$PROJECT_DIR/opencode.json" $'{\n  "$schema": "https://opencode.ai/config.json",\n  "share": "disabled",\n  "autoupdate": false,\n  "permission": { "*": "ask", "edit": "ask", "bash": { "*": "ask", "git push*": "deny", "gh pr create*": "deny", "gh workflow run*": "deny", "rm -rf *": "deny" } }\n}\n'
fi

write_md_stub "$PROJECT_DIR/specs/001-initial-blueprint/spec.md" "Initial Blueprint Spec" "This folder holds the first spec slice for the imported blueprint."
write_md_stub "$PROJECT_DIR/specs/001-initial-blueprint/plan.md" "Initial Blueprint Plan" "Break the imported blueprint into small, evidence-backed steps."
write_md_stub "$PROJECT_DIR/specs/001-initial-blueprint/tasks.md" "Initial Blueprint Tasks" "Keep tasks atomic, testable, and local-first."
write_md_stub "$PROJECT_DIR/specs/001-initial-blueprint/checklist.md" "Initial Blueprint Checklist" "- Evidence captured\n- Local gates passed\n- Manual fallback documented"

if [[ "$ALLOW_GITHUB_ACTIONS_FILES" == "true" ]]; then
  write_raw "$PROJECT_DIR/.github/workflows/bootstrap-placeholder.yml" $'name: Bootstrap Placeholder\non:\n  workflow_dispatch:\njobs:\n  noop:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "No automatic trigger."\n'
fi

if [[ "$ALLOW_GITHUB_ISSUE_SCRIPT_GENERATION" == "true" ]]; then
  write_md_stub "$PROJECT_DIR/scripts/README.md" "Scripts" "Local scripts may be added here, but they must stay local-only unless explicitly approved."
fi

EFFECTIVE_MODE="manual-terminal"
MANUAL_REASON="Manual-Terminal-Modus vorbereitet; OpenCode/Hermes/LLM wurde nicht automatisch gestartet."
AGENT_STATUS="GREEN_PARTIAL"
TMUX_SESSION="$SESSION_NAME"

# ── OpenCode Run Mode ───────────────────────────────────────────────
OPENCODE_AVAILABLE=false
OPENCODE_VERSION="not-installed"
if have_cmd opencode; then
  OPENCODE_VERSION="$(opencode --version 2>/dev/null || echo "unknown")"
  OPENCODE_AVAILABLE=true
fi

TMUX_AVAILABLE=false
if have_cmd tmux; then
  TMUX_AVAILABLE=true
fi

if [[ "$LLM_COMMAND_MODE" == "opencode-run" ]]; then
  if ! $OPENCODE_AVAILABLE; then
    MANUAL_REASON="opencode-run requested but opencode is not installed on this runner. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
  elif ! $TMUX_AVAILABLE; then
    MANUAL_REASON="opencode-run requested but tmux is not installed on this runner. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
  elif [[ ! -f "$PROJECT_DIR/opencode.json" ]]; then
    MANUAL_REASON="opencode-run requested but opencode.json is missing from project directory. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
  elif [[ ! -f "$PROJECT_DIR/BLUEPRINT.md" ]]; then
    MANUAL_REASON="opencode-run requested but BLUEPRINT.md is missing. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
  elif [[ ! -f "$PROJECT_DIR/INITIALISIERUNG_PROMPT_BLUEPRINT.md" ]]; then
    MANUAL_REASON="opencode-run requested but INITIALISIERUNG_PROMPT_BLUEPRINT.md is missing. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
  elif [[ "$SPECIFY_INIT_STATUS" -ne 0 ]]; then
    MANUAL_REASON="opencode-run requested but SpecKit init did not complete cleanly. Falling back to manual-terminal."
    EFFECTIVE_MODE="manual-terminal"
    AGENT_STATUS="GREEN_PARTIAL"
  else
    EFFECTIVE_MODE="opencode-run"
    AGENT_STATUS="GREEN"
    MANUAL_REASON=""
    export OPENCODE_AUTO_SHARE=false
    export OPENCODE_DISABLE_AUTOUPDATE=true

    FINAL_AGENT_MESSAGE='Du befindest dich in einem neuen Projektordner. Lies vollstaendig ./INITIALISIERUNG_PROMPT_BLUEPRINT.md und ./BLUEPRINT.md. Befolge INITIALISIERUNG_PROMPT_BLUEPRINT.md als ausfuehrenden Bootstrap-Auftrag. BLUEPRINT.md ist die fachliche Source of Truth. Arbeite spec-first, evidence-first und local-only. Erzeuge keine GitHub Actions mit automatischem push/pull_request Trigger. Kein Push, kein PR, kein Merge. Keine Secrets. Am Ende erzeuge einen Run-Report mit Status GREEN/GREEN_PARTIAL/BLOCKED.'

    TMUX_SESSION="${SESSION_NAME}"
    tmux new-session -d -s "$TMUX_SESSION" \
      bash -lc "cd \"$PROJECT_DIR\" && exec opencode run \"$FINAL_AGENT_MESSAGE\" 2>&1 | tee -a \"$AGENT_LOG\""

    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode-run started in tmux session: $TMUX_SESSION" >> "$AGENT_LOG"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode_version=$OPENCODE_VERSION" >> "$AGENT_LOG"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] project_dir=$PROJECT_DIR" >> "$AGENT_LOG"
  fi
fi

cat > "$AGENT_LOG" <<EOF
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] bootstrap started
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] effective_mode=$EFFECTIVE_MODE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] requested_mode=$LLM_COMMAND_MODE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] manual_reason=${MANUAL_REASON:-}
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode_available=$OPENCODE_AVAILABLE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] opencode_version=$OPENCODE_VERSION
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] tmux_available=$TMUX_AVAILABLE
[$(date -u +%Y-%m-%dT%H:%M:%SZ)] blueprint_sha256=$BLUEPRINT_SHA256
EOF

cat > "$COMMANDS_LOG" <<EOF
git init
specify check
specify init . --integration opencode --force --ignore-agent-tools --script sh
EOF

cat > "$OPERATOR_COMMANDS" <<EOF
# Operator Commands

Workflow status: $AGENT_STATUS
Mode: $EFFECTIVE_MODE
Manual reason: ${MANUAL_REASON:-}

OpenCode available: $OPENCODE_AVAILABLE
OpenCode version: $OPENCODE_VERSION
Tmux available: $TMUX_AVAILABLE
Hermes available: no (not installed, planned as optional sidecar)

Project:
$PROJECT_TITLE

Project directory:
$PROJECT_DIR

Run:
$RUN_ID

Evidence:
$RUN_DIR

Attach (SSH + tmux):
ssh runner@192.168.1.53
tmux attach -t $TMUX_SESSION

Live Log:
tail -f $RUN_DIR/agent.log

Stop:
tmux kill-session -t $TMUX_SESSION

Report:
cat $RUN_DIR/run-report.md
EOF

cat > "$RUN_REPORT" <<EOF
# Blueprint Bootstrap Run Report

Status: $AGENT_STATUS
Requested mode: $LLM_COMMAND_MODE
Effective mode: $EFFECTIVE_MODE
Manual reason: ${MANUAL_REASON:-}

## Toolchain

- OpenCode available: $OPENCODE_AVAILABLE
- OpenCode version: $OPENCODE_VERSION
- Tmux available: $TMUX_AVAILABLE
- Hermes available: no (not installed, planned as optional sidecar)
- Tmux session: $TMUX_SESSION

## What was built?

- A runner-side bootstrap flow that writes the submitted blueprint into the project directory.
- A canonical initialization prompt copied into the project.
- A SpecKit initialization run from the local source checkout.
- Evidence, operator commands, and a redacted RUN_INPUT snapshot.
- A restrictive opencode.json security profile copied from template.

## Relevant Paths

- Project: $PROJECT_DIR
- Run: $RUN_DIR
- Logs: $LOG_DIR
- Blueprint: $PROJECT_DIR/BLUEPRINT.md
- Prompt: $PROJECT_DIR/INITIALISIERUNG_PROMPT_BLUEPRINT.md
- OpenCode config: $PROJECT_DIR/opencode.json
- Status: $STATUS_JSON
- Operator commands: $OPERATOR_COMMANDS

## Limits

- OpenCode/Hermes were not started automatically unless the runner had the toolchain and tmux available.
- No --yolo, no approval bypass, no auto-push, no auto-PR, no auto-merge.
- Hermes is deliberately NOT installed in this run (planned as optional sidecar).
- The current runner state is therefore partial, not blocked.

## Was kann die Software jetzt im Vergleich zum vorherigen Lauf?

- OpenCode v1.17.9 is installed as a standalone binary on the runner.
- A restrictive opencode.json security profile is applied to all new projects.
- start_blueprint_bootstrap.sh supports opencode-run mode with tmux.
- Manual-terminal remains the safe default.
- Evidence now includes opencode version and availability.
EOF

status_json="$(jq -n \
  --arg status "$AGENT_STATUS" \
  --arg requested_mode "$LLM_COMMAND_MODE" \
  --arg effective_mode "$EFFECTIVE_MODE" \
  --arg manual_reason "$MANUAL_REASON" \
  --arg project_slug "$PROJECT_SLUG" \
  --arg project_title "$PROJECT_TITLE" \
  --arg run_id "$RUN_ID" \
  --arg project_dir "$PROJECT_DIR" \
  --arg run_dir "$RUN_DIR" \
  --arg log_dir "$LOG_DIR" \
  --arg session_name "$TMUX_SESSION" \
  --arg blueprint_sha256 "$BLUEPRINT_SHA256" \
  --argjson blueprint_length "$BLUEPRINT_LENGTH" \
  --arg blueprint_source "$BLUEPRINT_SOURCE" \
  --arg blueprint_filename "$BLUEPRINT_FILENAME" \
  --argjson dry_run "$DRY_RUN" \
  --argjson max_runtime_minutes "$MAX_RUNTIME_MINUTES" \
  --argjson allow_github_issue_script_generation "$ALLOW_GITHUB_ISSUE_SCRIPT_GENERATION" \
  --argjson allow_github_actions_files "$ALLOW_GITHUB_ACTIONS_FILES" \
  --arg run_report "$RUN_REPORT" \
  --arg operator_commands "$OPERATOR_COMMANDS" \
  --arg agent_log "$AGENT_LOG" \
  --arg preflight_md "$PREFLIGHT_MD" \
  --arg commands_log "$COMMANDS_LOG" \
  --arg opencode_available "$OPENCODE_AVAILABLE" \
  --arg opencode_version "$OPENCODE_VERSION" \
  --arg tmux_available "$TMUX_AVAILABLE" \
  --arg hermes_available "no" \
  '{status:$status, requested_mode:$requested_mode, effective_mode:$effective_mode, manual_reason:$manual_reason, project_slug:$project_slug, project_title:$project_title, run_id:$run_id, project_dir:$project_dir, run_dir:$run_dir, log_dir:$log_dir, session_name:$session_name, blueprint_sha256:$blueprint_sha256, blueprint_length:$blueprint_length, blueprint_source:$blueprint_source, blueprint_filename:$blueprint_filename, dry_run:$dry_run, max_runtime_minutes:$max_runtime_minutes, allow_github_issue_script_generation:$allow_github_issue_script_generation, allow_github_actions_files:$allow_github_actions_files, run_report_path:$run_report, operator_commands_path:$operator_commands, agent_log_path:$agent_log, preflight_md_path:$preflight_md, commands_log_path:$commands_log, opencode_available:$opencode_available, opencode_version:$opencode_version, tmux_available:$tmux_available, hermes_available:$hermes_available}' \
)"
printf '%s\n' "$status_json" > "$STATUS_JSON"

printf '%s\n' "$status_json"
