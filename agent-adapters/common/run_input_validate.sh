#!/usr/bin/env bash
# run_input_validate.sh — Validates RUN_INPUT.json structure
# Checks required fields, types, and security constraints.

set -euo pipefail

INPUT_JSON="${1:-}"
if [[ -z "$INPUT_JSON" ]]; then
  echo "Usage: run_input_validate.sh <RUN_INPUT.json>"
  exit 1
fi

if [[ ! -f "$INPUT_JSON" ]]; then
  echo "FAIL: Input file not found: $INPUT_JSON"
  exit 1
fi

errors=0

check_field() {
  local field="$1"
  local type="$2"
  local value
  value="$(jq -r ".${field} // empty" "$INPUT_JSON" 2>/dev/null)"
  if [[ -z "$value" ]]; then
    echo "FAIL: Missing required field: $field"
    errors=$((errors + 1))
  fi
}

check_field ".project_slug" "string"
check_field ".project_title" "string"
check_field ".blueprint_source" "string"
check_field ".blueprint_b64" "string"
check_field ".blueprint_length" "number"
check_field ".llm_command_mode" "string"
check_field ".project_dir" "string"
check_field ".run_dir" "string"

# Security: No secrets in input
if jq -e '.blueprint_b64 | test("BEGIN.*PRIVATE KEY")' "$INPUT_JSON" >/dev/null 2>&1; then
  echo "FAIL: Private key detected in blueprint_b64!"
  errors=$((errors + 1))
fi

if jq -e '.init_prompt_b64 | test("password|token|secret|api_key")' "$INPUT_JSON" >/dev/null 2>&1; then
  echo "WARNING: Potential secret keywords found in init_prompt_b64"
fi

if [[ $errors -gt 0 ]]; then
  echo "Validation FAILED with $errors error(s)"
  exit 1
fi

echo "OK: RUN_INPUT.json is valid"
exit 0
