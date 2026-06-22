#!/bin/bash
# validate-json.sh — Validate all workflow JSON files in this repo
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOW_DIR="$REPO_ROOT/workflows"

echo "=== JSON Validation ==="
errors=0

for f in "$WORKFLOW_DIR"/*.json; do
    if [ ! -f "$f" ]; then
        echo "SKIP: No JSON files found in $WORKFLOW_DIR"
        exit 0
    fi
    echo -n "Checking: $(basename "$f") ... "
    if python3 -m json.tool "$f" > /dev/null 2>&1; then
        echo "OK"
    elif python -m json.tool "$f" > /dev/null 2>&1; then
        echo "OK"
    elif node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('OK')" 2>/dev/null; then
        echo ""
    else
        echo "FAILED"
        errors=$((errors + 1))
    fi
done

echo ""
if [ "$errors" -eq 0 ]; then
    echo "Result: ALL JSON VALID"
    exit 0
else
    echo "Result: $errors file(s) INVALID"
    exit 1
fi
