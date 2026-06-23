#!/usr/bin/env bash
# manual_terminal_adapter.sh — Safe default: no agent autonomy
# This adapter runs when llm_command_mode=manual-terminal
# It prepares the project but does NOT start any AI agent.

set -euo pipefail

echo "=== Manual Terminal Adapter ==="
echo "Mode: manual-terminal (safe default)"
echo "No AI agent will be started."
echo ""
echo "Project directory: ${PROJECT_DIR:-<not set>}"
echo "Run directory: ${RUN_DIR:-<not set>}"
echo ""
echo "To work on this project manually:"
echo "  ssh runner@192.168.1.53"
echo "  cd ${PROJECT_DIR:-/opt/dev-fabric/workspaces/projects/<slug>}"
echo ""
echo "To start OpenCode in tmux (if available):"
echo "  tmux new-session -s bp-<project>"
echo "  opencode run"
echo ""
echo "=== Manual Terminal Ready ==="

exit 0
