#!/usr/bin/env bash
# security_guard.sh — Pre-execution security checks
# Blocks dangerous operations before they happen.

set -euo pipefail

PROJECT_DIR="${1:-}"

echo "=== Security Guard ==="

# Check 1: No secrets in environment
if env | grep -qiE 'N8N_ENCRYPTION_KEY|PRIVATE_KEY|API_KEY|AUTH_TOKEN|PASSWORD|SECRET'; then
  echo "BLOCKED: Sensitive environment variables detected!"
  exit 1
fi
echo "PASS: No secrets in environment"

# Check 2: No .env files in project
if [[ -n "$PROJECT_DIR" ]] && [[ -d "$PROJECT_DIR" ]]; then
  if find "$PROJECT_DIR" -name ".env" -o -name "*.pem" -o -name "*.key" 2>/dev/null | grep -q .; then
    echo "BLOCKED: Secret files found in project directory!"
    exit 1
  fi
  echo "PASS: No secret files in project"
fi

# Check 3: No root execution
if [[ "$(id -u)" -eq 0 ]]; then
  echo "WARNING: Running as root! This is discouraged."
fi

# Check 4: No force-push in git config
if git config --get push.default 2>/dev/null | grep -qi force; then
  echo "BLOCKED: Force-push configured in git!"
  exit 1
fi
echo "PASS: No force-push git config"

# Check 5: OpenCode safety
if command -v opencode >/dev/null 2>&1; then
  if [[ -f "$PROJECT_DIR/opencode.json" ]]; then
    if grep -q '"git push\*": "deny"' "$PROJECT_DIR/opencode.json" 2>/dev/null; then
      echo "PASS: opencode.json blocks git push"
    else
      echo "WARNING: opencode.json does not explicitly block git push"
    fi
  fi
fi

echo "=== Security Guard: ALL CHECKS PASSED ==="
exit 0
