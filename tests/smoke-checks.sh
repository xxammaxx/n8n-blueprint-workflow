#!/bin/bash
# smoke-checks.sh — Quick smoke tests for the repo
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Smoke Checks ==="
errors=0

# Check required files exist
required_files=(
    "README.md"
    "STATUS.md"
    "CHANGELOG.md"
    "SECURITY.md"
    ".gitignore"
    "workflows/README.md"
    "workflows/speckit-smoke-workflow.json"
    "workflows/blueprint-old-broken.export.json"
    "workflows/debug-minimal-form-ui.export.json"
    "scripts/start_blueprint_bootstrap.sh"
    "scripts/speckit_iteration.sh"
    "templates/INITIALISIERUNG_PROMPT_BLUEPRINT.md"
    "docs/import-publish-guide.md"
    "docs/ui-reconstruction-runbook.md"
    "docs/troubleshooting.md"
    "docs/architecture.md"
    "docs/security-boundaries.md"
    "tests/validate-json.sh"
    "tests/validate-shell.sh"
    "tests/smoke-checks.sh"
)

for f in "${required_files[@]}"; do
    echo -n "Checking: $f ... "
    if [ -f "$REPO_ROOT/$f" ]; then
        echo "EXISTS"
    else
        echo "MISSING"
        errors=$((errors + 1))
    fi
done

# Check .gitignore blocks critical files
echo ""
echo -n "Checking .gitignore critical patterns ... "
patterns=("*.sqlite" "*.pem" "*.key" ".env" "credentials" "cookies" "backups/")
missing=0
for p in "${patterns[@]}"; do
    if ! grep -qF "$p" "$REPO_ROOT/.gitignore" 2>/dev/null; then
        missing=$((missing + 1))
        echo -n "[MISSING:$p] "
    fi
done
if [ "$missing" -eq 0 ]; then
    echo "OK"
else
    echo "WARN: $missing pattern(s) missing from .gitignore"
fi

# Check no forbidden files committed
echo ""
echo -n "Checking no forbidden files present ... "
forbidden=$(find "$REPO_ROOT" -type f \( -name "*.sqlite" -o -name "*.sqlite-shm" -o -name "*.sqlite-wal" -o -name ".env" -o -name "*.pem" -o -name "*.key" -o -name "*credentials*" -o -name "*cookies*" -o -name "id_rsa" -o -name "id_ed25519" \) ! -path "*/.git/*" 2>/dev/null)
if [ -z "$forbidden" ]; then
    echo "OK"
else
    echo "FAILED"
    echo "$forbidden"
    errors=$((errors + 1))
fi

echo ""
if [ "$errors" -eq 0 ]; then
    echo "Result: ALL SMOKE CHECKS PASSED"
    exit 0
else
    echo "Result: $errors check(s) FAILED"
    exit 1
fi
