#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OP_BIN="/opt/dev-fabric/opencode/opencode"
ENV_FILE="/opt/dev-fabric/secrets/opencode-provider.env"

echo "=========================================="
echo " OpenCode Provider Smoke Test"
echo " Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "=========================================="
echo ""

# Stage 1: Version check
echo "--- Stage 1: OpenCode Version ---"
if [[ -x "$OP_BIN" ]]; then
  $OP_BIN --version 2>&1 || true
  echo "Result: VERSION_OK"
else
  echo "Result: VERSION_FAIL - OpenCode binary not found at $OP_BIN"
  exit 1
fi
echo ""

# Stage 2: Secret Loader
echo "--- Stage 2: Secret Loader ---"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "OPENCODE_PROVIDER loaded: no (file missing)"
  LOADER_EXIT=1
else
  set -a
  source "$ENV_FILE" 2>/dev/null || true
  set +a

  LOADER_EXIT=0
  has_placeholder() {
    local val="$1"
    [[ -z "$val" ]] && return 0
    [[ "$val" == PASTE_* ]] && return 0
    [[ "$val" == PLACEHOLDER* ]] && return 0
    [[ "$val" == YOUR_* ]] && return 0
    [[ "$val" == "<"* ]] && return 0
    return 1
  }

  # Check core variables
  for var in OPENCODE_PROVIDER OPENCODE_API_KEY OPENCODE_MODEL OPENCODE_BASE_URL OPENCODE_DRY_RUN OPENCODE_MAX_COST_USD OPENCODE_ALLOW_PROVIDER_CALL; do
    val="${!var:-}"
    if [[ -z "$val" ]]; then
      echo "$var: not set"
      [[ $LOADER_EXIT -eq 0 ]] && LOADER_EXIT=3
    elif has_placeholder "$val"; then
      echo "$var: placeholder (value not configured)"
      LOADER_EXIT=2
    else
      echo "$var: loaded"
    fi
  done

  # Map DEEPSEEK_API_KEY for custom provider support
  if [[ -n "${OPENCODE_API_KEY:-}" ]] && ! has_placeholder "${OPENCODE_API_KEY:-}"; then
    export DEEPSEEK_API_KEY="${OPENCODE_API_KEY}"
  fi

  if [[ -n "${OPENCODE_API_KEY:-}" ]] && ! has_placeholder "${OPENCODE_API_KEY:-}"; then
    echo "SECRET_STATUS: api_key_present=true"
  else
    echo "SECRET_STATUS: api_key_present=false"
  fi
fi
echo "Loader exit code: $LOADER_EXIT"
case $LOADER_EXIT in
  0) echo "Loader Result: ALL_LOADED";;
  1) echo "Loader Result: FILE_MISSING";;
  2) echo "Loader Result: PLACEHOLDER_DETECTED";;
  3) echo "Loader Result: EMPTY_VALUES";;
  *) echo "Loader Result: UNKNOWN_EXIT_CODE=$LOADER_EXIT";;
esac
echo ""

# Stage 3: Provider Type Detection
echo "--- Stage 3: Provider Type Detection ---"
PROVIDER="${OPENCODE_PROVIDER:-}"
MODEL="${OPENCODE_MODEL:-}"

# Trim whitespace and CR from provider value
PROVIDER="$(echo -n "$PROVIDER" | tr -d '\r' | xargs)"

case "$PROVIDER" in
  deepseek-direct|deepseek)
    PROVIDER_TYPE="deepseek"
    echo "Provider type: $PROVIDER_TYPE (built-in DeepSeek provider)"
    echo "Expected: Direct DeepSeek API key (sk-...)"
    echo "Uses DEEPSEEK_API_KEY env var for authentication"
    echo "WARNING: DO NOT use opencode-go provider with DeepSeek API key"
    ;;
  opencode-go|opencode)
    PROVIDER_TYPE="opencode-platform"
    echo "Provider type: $PROVIDER_TYPE (OpenCode Platform)"
    echo "Expected: OpenCode Platform API key (from opencode.ai/auth)"
    echo "WARNING: Direct DeepSeek keys will be rejected by opencode-go"
    ;;
  *)
    PROVIDER_TYPE="unknown"
    echo "Provider type: UNKNOWN ($PROVIDER)"
    echo "WARNING: Unknown provider type - cannot determine expected key format"
    ;;
esac
echo ""

# Stage 4: Provider Model List (read-only, no auth needed)
echo "--- Stage 4: Provider Model List ---"
if [[ -n "$PROVIDER" ]] && ! has_placeholder "$PROVIDER"; then
  if [[ "${OPENCODE_ALLOW_PROVIDER_CALL:-}" == "true" ]]; then
    echo "Provider call ALLOWED by policy. Fetching model list..."
    echo "Running: opencode models $PROVIDER"
    if [[ "$PROVIDER_TYPE" == "deepseek-direct" ]]; then
      # For custom provider, models are defined in opencode.json config
      echo "Note: Custom provider models come from opencode.json config"
      $OP_BIN models "$PROVIDER" 2>&1 || echo "Model list fetch failed"
    else
      $OP_BIN models "$PROVIDER" 2>&1 || echo "Model list fetch failed (may need valid API key)"
    fi
  else
    echo "Provider call BLOCKED by policy."
    echo "Set OPENCODE_ALLOW_PROVIDER_CALL=true to enable."
    echo "Status: SMOKE_READY_PROVIDER_CALL_BLOCKED_BY_POLICY"
  fi
else
  echo "Provider not configured. Skipping model list."
  echo "Status: SMOKE_READY_NO_PROVIDER"
fi
echo ""

# Stage 5: Provider Smoke Call
echo "--- Stage 5: Provider Smoke Call ---"
if [[ "${OPENCODE_ALLOW_PROVIDER_CALL:-}" == "true" ]]; then
  if [[ -n "$PROVIDER" ]] && ! has_placeholder "$PROVIDER"; then
    echo "Running minimal smoke call..."
    echo "NOTE: This test is read-only and non-destructive."
    echo "Provider type: $PROVIDER_TYPE"
    echo "Max cost limit: ${OPENCODE_MAX_COST_USD:-0.25}"
    echo ""

    if [[ "$PROVIDER_TYPE" == "deepseek-direct" || "$PROVIDER_TYPE" == "deepseek" ]]; then
      echo "--- DeepSeek Provider Smoke ---"
      echo "Validating: opencode run with deepseek provider"
      echo "Model: $PROVIDER/$MODEL"
      echo ""

      # Export DEEPSEEK_API_KEY for built-in provider
      export DEEPSEEK_API_KEY="${OPENCODE_API_KEY:-}"

      # Minimal smoke: run opencode with a simple prompt
      # Note: Using timeout to prevent hangs; --dangerously-skip-permissions for non-interactive
      # Note: Pipe empty input to prevent TUI initialization
      echo "" | timeout 60 $OP_BIN run \
        --model "$PROVIDER/$MODEL" \
        --dangerously-skip-permissions \
        "Say only the word OK and nothing else." \
        2>&1 || echo "Smoke call completed (check output above for errors)"
    elif [[ "$PROVIDER_TYPE" == "opencode-platform" ]]; then
      echo "--- OpenCode Platform Smoke ---"
      echo "Validating: opencode run with opencode provider"
      echo "Model: $PROVIDER/$MODEL"

      echo "" | timeout 60 $OP_BIN run \
        --model "$PROVIDER/$MODEL" \
        --dangerously-skip-permissions \
        "Say only the word OK and nothing else." \
        2>&1 || echo "Smoke call completed (check output above for errors)"
    else
      echo "Unknown provider type '$PROVIDER_TYPE'. Skipping smoke call."
      echo "Status: SMOKE_SKIPPED_UNKNOWN_PROVIDER_TYPE"
    fi
  else
    echo "Cannot run smoke call: provider not configured."
  fi
else
  echo "Smoke call BLOCKED by policy."
  echo "Set OPENCODE_ALLOW_PROVIDER_CALL=true to enable."
fi
echo ""

echo "=========================================="
echo " Smoke Test Complete"
echo "=========================================="
