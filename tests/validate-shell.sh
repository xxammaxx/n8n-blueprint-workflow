#!/bin/bash
# validate-shell.sh — Validate all shell scripts in this repo
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts"

echo "=== Shell Script Validation ==="
errors=0

for f in "$SCRIPTS_DIR"/*.sh "$REPO_ROOT/tests"/*.sh; do
    if [ ! -f "$f" ]; then
        continue
    fi
    echo -n "Checking: $(basename "$f") ... "
    
    # Check for shebang
    if head -1 "$f" | grep -q '^#!/'; then
        echo -n "shebang "
    else
        echo -n "NO_SHEBANG "
    fi
    
    # Check syntax
    if bash -n "$f" 2>&1; then
        echo -n "syntax-ok "
    else
        echo -n "SYNTAX_ERR "
        errors=$((errors + 1))
    fi
    
    echo ""
done

echo ""
if [ "$errors" -eq 0 ]; then
    echo "Result: ALL SHELL SCRIPTS VALID"
    exit 0
else
    echo "Result: $errors script(s) FAILED"
    exit 1
fi
