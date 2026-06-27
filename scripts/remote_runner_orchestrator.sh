#!/bin/sh
set -eu

contains_secret_like() {
  if command -v grep >/dev/null 2>&1; then
    printf '%s' "$1" | grep -E 'ghp_|github_pat_|sk-[A-Za-z0-9]{20,}|xox[baprs]-|BEGIN [A-Z ]*PRIVATE KEY|AIza[0-9A-Za-z_-]{20,}' >/dev/null 2>&1
    return $?
  fi
  return 1
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\r/\\r/g; s/\t/\\t/g; :a;N;$!ba;s/\n/\\n/g'
}

emit_json() {
  ok_flag=$1
  error_code=$2
  message=$3
  detail=${4:-}

  if [ -n "$detail" ] && contains_secret_like "$detail"; then
    detail='[redacted secret-like output]'
  fi

  printf '{'
  printf '"ok":%s,' "$ok_flag"
  printf '"error_code":"%s",' "$(json_escape "$error_code")"
  printf '"message":"%s"' "$(json_escape "$message")"
  if [ -n "$detail" ]; then
    printf ',"detail":"%s"' "$(json_escape "$detail")"
  fi
  printf '}\n'
}

finish_with_json() {
  printf '%s\n' "$1"
  exit 0
}

fail_json() {
  emit_json false "$1" "$2" "${3:-}"
  exit 0
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail_json "TOOL_GAP" "Required host command is not available." "$1"
  fi
}

PAYLOAD_FILE=${1:-}
RUNNER_CONTAINER_NAME=${2:-}

if [ -z "$PAYLOAD_FILE" ]; then
  fail_json "USAGE" "Payload file argument missing."
fi

if [ -z "$RUNNER_CONTAINER_NAME" ]; then
  fail_json "USAGE" "Runner container name argument missing."
fi

if [ ! -f "$PAYLOAD_FILE" ]; then
  fail_json "INPUT_MISSING" "Payload file does not exist." "$PAYLOAD_FILE"
fi

if [ -z "${CONTAINER_PIPELINE_B64:-}" ]; then
  fail_json "INPUT_MISSING" "Container pipeline payload is missing."
fi

require_command docker
require_command base64
require_command mktemp

if ! docker version >/dev/null 2>&1; then
  fail_json "DOCKER_UNREACHABLE" "Docker is not reachable on the Docker target host."
fi

if ! docker inspect "$RUNNER_CONTAINER_NAME" >/dev/null 2>&1; then
  fail_json "RUNNER_CONTAINER_NOT_FOUND" "Runner container is not available on the Docker target host." "$RUNNER_CONTAINER_NAME"
fi

RUNNER_IS_RUNNING=$(docker inspect -f '{{.State.Running}}' "$RUNNER_CONTAINER_NAME" 2>/dev/null || true)
if [ "$RUNNER_IS_RUNNING" != "true" ]; then
  fail_json "RUNNER_CONTAINER_NOT_RUNNING" "Runner container exists but is not running." "$RUNNER_CONTAINER_NAME"
fi

TMP_DIR=$(mktemp -d /tmp/spec-kit-opencode-remote-XXXXXX)
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT INT TERM

CONTAINER_HELPER_LOCAL="$TMP_DIR/container_pipeline.mjs"
CONTAINER_HELPER_REMOTE="/tmp/spec-kit-opencode-container-pipeline.mjs"
PAYLOAD_REMOTE="/tmp/spec-kit-opencode-payload.json"

if ! printf '%s' "$CONTAINER_PIPELINE_B64" | base64 -d >"$CONTAINER_HELPER_LOCAL" 2>/dev/null; then
  fail_json "DECODE_FAILED" "Failed to decode container pipeline helper."
fi

if ! docker cp "$PAYLOAD_FILE" "$RUNNER_CONTAINER_NAME:$PAYLOAD_REMOTE" >/dev/null 2>&1; then
  fail_json "DOCKER_COPY_FAILED" "Failed to copy payload file into the runner container."
fi

if ! docker cp "$CONTAINER_HELPER_LOCAL" "$RUNNER_CONTAINER_NAME:$CONTAINER_HELPER_REMOTE" >/dev/null 2>&1; then
  fail_json "DOCKER_COPY_FAILED" "Failed to copy container helper into the runner container."
fi

RUNNER_OUTPUT=$(docker exec "$RUNNER_CONTAINER_NAME" node "$CONTAINER_HELPER_REMOTE" "$PAYLOAD_REMOTE" 2>&1 || true)

case "$RUNNER_OUTPUT" in
  *'"ok"'*)
    finish_with_json "$RUNNER_OUTPUT"
    ;;
  *)
    fail_json "RUNNER_EXEC_FAILED" "Runner container returned unexpected output." "$RUNNER_OUTPUT"
    ;;
esac
