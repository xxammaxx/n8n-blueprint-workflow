#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/opt/dev-fabric/secrets/opencode-provider.env"
EXIT_OK=0
EXIT_MISSING=1
EXIT_PLACEHOLDER=2
EXIT_EMPTY=3

# Check if file exists
if [[ ! -f "$ENV_FILE" ]]; then
  echo "OPENCODE_PROVIDER loaded: no (file missing)"
  echo "OPENCODE_API_KEY loaded: no (file missing)"
  echo "OPENCODE_MODEL loaded: no (file missing)"
  echo "OPENCODE_DRY_RUN loaded: no (file missing)"
  echo "OPENCODE_MAX_COST_USD loaded: no (file missing)"
  exit $EXIT_MISSING
fi

# Source the file safely
set -a
source "$ENV_FILE" 2>/dev/null || {
  echo "OPENCODE_PROVIDER loaded: no (source failed)"
  exit $EXIT_MISSING
}
set +a

has_placeholder() {
  local val="$1"
  [[ -z "$val" ]] && return 0
  [[ "$val" == "PASTE_"* ]] && return 0
  [[ "$val" == "PLACEHOLDER"* ]] && return 0
  [[ "$val" == "YOUR_"* ]] && return 0
  [[ "$val" == "<"* ]] && return 0
  return 1
}

declare -a LOADED=()
declare -a MISSING=()
PLACEHOLDER_FOUND=false

check_var() {
  local name="$1"
  local val="${!name:-}"
  if [[ -z "$val" ]]; then
    MISSING+=("${name}: not set")
  elif has_placeholder "$val"; then
    MISSING+=("${name}: placeholder (value not configured)")
    PLACEHOLDER_FOUND=true
  else
    LOADED+=("${name}: loaded")
  fi
}

check_var OPENCODE_PROVIDER
check_var OPENCODE_API_KEY
check_var OPENCODE_MODEL
check_var OPENCODE_BASE_URL
check_var OPENCODE_DRY_RUN
check_var OPENCODE_MAX_COST_USD
check_var OPENCODE_ALLOW_PROVIDER_CALL

# Report results
for msg in "${LOADED[@]}"; do
  echo "$msg"
done
for msg in "${MISSING[@]}"; do
  echo "$msg"
done

# Map OPENCODE_API_KEY to DEEPSEEK_API_KEY for @ai-sdk/openai-compatible custom provider
if [[ -n "${OPENCODE_API_KEY:-}" ]] && ! has_placeholder "${OPENCODE_API_KEY:-}"; then
  export DEEPSEEK_API_KEY="${OPENCODE_API_KEY}"
  echo "DEEPSEEK_API_KEY loaded: yes (mapped from OPENCODE_API_KEY)"
else
  echo "DEEPSEEK_API_KEY loaded: no"
fi

# Set API_KEY_PRESENT as boolean for external consumption
if [[ -n "${OPENCODE_API_KEY:-}" ]] && ! has_placeholder "${OPENCODE_API_KEY:-}"; then
  echo "SECRET_STATUS: api_key_present=true"
else
  echo "SECRET_STATUS: api_key_present=false"
fi

# Determine exit code
if [[ ${#MISSING[@]} -gt 0 ]]; then
  if $PLACEHOLDER_FOUND; then
    exit $EXIT_PLACEHOLDER
  fi
  exit $EXIT_EMPTY
fi

exit $EXIT_OK
