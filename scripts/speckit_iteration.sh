#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
usage: speckit_iteration.sh <repo-path> [iteration] [task_text]
       speckit_iteration.sh <repo-path> [iteration] --task-text "..."
       speckit_iteration.sh <repo-path> [iteration] --task-file /path/to/task.md
USAGE
}

fail() {
  echo "error: $*" >&2
  exit 1
}

probe_version() {
  local label="$1"
  local cmd="$2"
  shift 2
  if command -v "$cmd" >/dev/null 2>&1; then
    local value
    value="$("$cmd" "$@" 2>&1 | head -n 1 || true)"
    printf '%s=%s\n' "$label" "$value"
  else
    printf '%s=not-found\n' "$label"
  fi
}

repo_path=""
iteration="1"
task_text=""
task_file=""
task_source="none"
positionals=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task-text)
      task_text="${2:-}"
      shift 2
      ;;
    --task-text=*)
      task_text="${1#*=}"
      shift
      ;;
    --task-file)
      task_file="${2:-}"
      shift 2
      ;;
    --task-file=*)
      task_file="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      while [[ $# -gt 0 ]]; do
        positionals+=("$1")
        shift
      done
      ;;
    *)
      positionals+=("$1")
      shift
      ;;
  esac
done

repo_path="${positionals[0]:-}"
iteration="${positionals[1]:-1}"
if [[ ${#positionals[@]} -ge 3 && -z "$task_text" && -z "$task_file" ]]; then
  task_text="${positionals[2]}"
  task_source="positional"
fi

if [[ -z "$repo_path" ]]; then
  usage
  exit 64
fi

if [[ ! -d "$repo_path/.git" ]]; then
  fail "not a git repo: $repo_path"
fi

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
base="/opt/dev-fabric"
repo_name="$(basename "$repo_path")"
outdir="$base/evidence/${repo_name}/iter-${iteration}-${stamp}"

mkdir -p "$outdir"

preflight="$outdir/preflight.txt"
git_status="$outdir/git-status.txt"
git_diff="$outdir/git-diff.txt"
report_md="$outdir/report.md"
report_json="$outdir/report.json"
task_md="$outdir/task.md"

if [[ -n "$task_file" ]]; then
  [[ -f "$task_file" ]] || fail "task file not found: $task_file"
  task_text="$(cat "$task_file")"
  task_source="file"
fi

if [[ -n "$task_text" ]]; then
  printf '%s\n' "$task_text" > "$task_md"
  task_summary="$(printf '%s' "$task_text" | tr '\r\n' ' ' | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//' | cut -c1-220)"
else
  task_summary="No task_text provided"
  printf '%s\n' "$task_summary" > "$task_md"
fi

task_source_json="$(printf '%s' "$task_source" | jq -Rs .)"
task_summary_json="$(printf '%s' "$task_summary" | jq -Rs .)"
task_text_json="$(printf '%s' "$task_text" | jq -Rs .)"

{
  echo "timestamp=$stamp"
  echo "host=$(hostname)"
  echo "user=$(id -un)"
  echo "repo=$repo_path"
  echo "iteration=$iteration"
  probe_version node node --version
  probe_version npm npm --version
  probe_version python python3 --version
  probe_version uv uv --version
  probe_version pnpm pnpm --version
  probe_version git git --version
  probe_version jq jq --version
  probe_version tmux tmux -V
  probe_version opencode opencode --version
  probe_version hermes hermes --version
  echo "task_source=$task_source"
  echo "task_summary=$task_summary"
  echo "task_md=$task_md"
} > "$preflight"

cd "$repo_path"
git status --short --branch > "$git_status"
git diff --stat > "$git_diff"

{
  printf '%s\n' '# Spec Kit Iteration Evidence'
  printf '%s\n' ''
  printf '%s\n' "- timestamp: $stamp"
  printf '%s\n' "- repo: $repo_path"
  printf '%s\n' "- iteration: $iteration"
  printf '%s\n' "- host: $(hostname)"
  printf '%s\n' "- user: $(id -un)"
  printf '%s\n' "- task_source: $task_source"
  printf '%s\n' "- task_summary: $task_summary"
  printf '%s\n' "- task_md: $task_md"
  printf '%s\n' "- preflight: $preflight"
  printf '%s\n' "- git status: $git_status"
  printf '%s\n' "- git diff: $git_diff"
  printf '%s\n' ''
  printf '%s\n' '## Task Text'
  if [[ -n "$task_text" ]]; then
    printf '%s\n' ''
    printf '%s\n' '```text'
    printf '%s\n' "$task_text"
    printf '%s\n' '```'
  else
    printf '%s\n' ''
    printf '%s\n' 'No task_text provided'
  fi
} > "$report_md"

cat > "$report_json" <<JSON
{
  "timestamp": "$stamp",
  "repo": "$repo_path",
  "iteration": "$iteration",
  "host": "$(hostname)",
  "user": "$(id -un)",
  "task_source": $task_source_json,
  "task_summary": $task_summary_json,
  "task_text": $task_text_json,
  "task_md": "$task_md",
  "preflight": "$preflight",
  "git_status": "$git_status",
  "git_diff": "$git_diff"
}
JSON

printf 'evidence_dir=%s\n' "$outdir"
