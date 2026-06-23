#!/usr/bin/env bash
# opencode_adapter.sh — Controlled OpenCode runner adapter
# Starts OpenCode in tmux with restrictive security profile.
# No --yolo, no auto-push, no auto-PR, no auto-merge.

set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

# ── Preflight ────────────────────────────────────────────────
echo "=== OpenCode Adapter ==="

if ! have_cmd opencode; then
  echo "STATUS: opencode_not_found"
  echo "OpenCode is not installed on this runner."
  echo "Install with: curl -fsSL https://opencode.ai/install | bash"
  echo "Or download from: https://github.com/anomalyco/opencode/releases"
  exit 0
fi

OPENCODE_VERSION="$(opencode --version 2>/dev/null || echo "unknown")"
echo "OpenCode version: $OPENCODE_VERSION"

if ! have_cmd tmux; then
  echo "STATUS: tmux_not_found"
  echo "tmux is required for opencode-run mode but is not installed."
  exit 0
fi

TM_VERSION="$(tmux -V)"
echo "Tmux version: $TM_VERSION"

# ── Project Validation ───────────────────────────────────────
PROJECT_DIR="${1:-}"
if [[ -z "$PROJECT_DIR" ]]; then
  fail "Usage: opencode_adapter.sh <project_dir>"
fi

if [[ ! -d "$PROJECT_DIR" ]]; then
  fail "Project directory not found: $PROJECT_DIR"
fi

if [[ ! -f "$PROJECT_DIR/opencode.json" ]]; then
  echo "WARNING: opencode.json not found in project directory."
  echo "Copying restrictive template..."
  if [[ -f /opt/dev-fabric/workflows/templates/opencode.json ]]; then
    cp /opt/dev-fabric/workflows/templates/opencode.json "$PROJECT_DIR/opencode.json"
  else
    fail "No opencode.json template available and no config in project."
  fi
fi

if [[ ! -f "$PROJECT_DIR/BLUEPRINT.md" ]]; then
  fail "BLUEPRINT.md not found in project directory."
fi

if [[ ! -f "$PROJECT_DIR/INITIALISIERUNG_PROMPT_BLUEPRINT.md" ]]; then
  fail "INITIALISIERUNG_PROMPT_BLUEPRINT.md not found in project directory."
fi

# ── Security Environment ─────────────────────────────────────
export OPENCODE_AUTO_SHARE=false
export OPENCODE_DISABLE_AUTOUPDATE=true

# ── Start OpenCode in tmux ───────────────────────────────────
SESSION_NAME="bp-$(basename "$PROJECT_DIR")-$(date -u +%Y%m%dT%H%M%SZ)"
SESSION_NAME="${SESSION_NAME:0:60}"

AGENT_PROMPT="Du befindest dich in einem neuen Projektordner. Lies vollstaendig ./INITIALISIERUNG_PROMPT_BLUEPRINT.md und ./BLUEPRINT.md. Befolge INITIALISIERUNG_PROMPT_BLUEPRINT.md als ausfuehrenden Bootstrap-Auftrag. BLUEPRINT.md ist die fachliche Source of Truth. Arbeite spec-first, evidence-first und local-only. Kein Push, kein PR, kein Merge. Keine Secrets."

echo "Starting OpenCode in tmux session: $SESSION_NAME"
tmux new-session -d -s "$SESSION_NAME" \
  bash -lc "cd '$PROJECT_DIR' && exec opencode run '$AGENT_PROMPT' 2>&1 | tee -a '$RUN_DIR/agent.log'"

echo ""
echo "=== OpenCode Started ==="
echo "Session: $SESSION_NAME"
echo "Attach:  tmux attach -t $SESSION_NAME"
echo "Log:     tail -f ${RUN_DIR:-/opt/dev-fabric/evidence}/agent.log"
echo "Stop:    tmux kill-session -t $SESSION_NAME"
echo ""

# ── Evidence ─────────────────────────────────────────────────
EVIDENCE_DIR="${RUN_DIR:-/opt/dev-fabric/evidence/blueprint-bootstrap/$(basename "$PROJECT_DIR")/$(date -u +run-%Y%m%dT%H%M%SZ)}"
mkdir -p "$EVIDENCE_DIR"

cat > "$EVIDENCE_DIR/opencode-status.json" <<EOF
{
  "status": "opencode_started",
  "opencode_version": "$OPENCODE_VERSION",
  "tmux_version": "$TM_VERSION",
  "session_name": "$SESSION_NAME",
  "project_dir": "$PROJECT_DIR",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "attach_command": "tmux attach -t $SESSION_NAME",
  "stop_command": "tmux kill-session -t $SESSION_NAME",
  "log_command": "tail -f $EVIDENCE_DIR/agent.log"
}
EOF

echo "Evidence written to: $EVIDENCE_DIR/opencode-status.json"
echo "=== Done ==="
