#!/bin/bash
# validate_repo.sh — Full repo validation before commit/push
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================="
echo "  REPO VALIDATION"
echo "========================================="
echo ""

# 1. JSON validation
echo "--- 1. JSON Validation ---"
bash "$REPO_ROOT/tests/validate-json.sh"
echo ""

# 2. Shell script validation
echo "--- 2. Shell Script Validation ---"
bash "$REPO_ROOT/tests/validate-shell.sh"
echo ""

# 3. Smoke checks
echo "--- 3. Smoke Checks ---"
bash "$REPO_ROOT/tests/smoke-checks.sh"
echo ""

# 4. Secret scan
echo "--- 4. Secret Scan ---"
echo "Scanning for secrets..."
hits=$(grep -RInE "BEGIN (OPENSSH|RSA|EC|PRIVATE) KEY|N8N_ENCRYPTION_KEY|password\s*=|passwd\s*=|token\s*=|secret\s*=|api[_-]?key\s*=|authorization:" "$REPO_ROOT" \
    --exclude-dir=.git \
    --exclude=".gitignore" \
    --exclude="SECURITY.md" \
    --exclude="*.md" \
    --exclude="validate_repo.sh" 2>/dev/null || true)
if [ -z "$hits" ]; then
    echo "  No secrets detected"
else
    echo "  WARNING: Potential secrets found:"
    echo "$hits"
fi

echo ""
echo "--- 5. Forbidden files ---"
forbidden=$(find "$REPO_ROOT" -type f \( -name "*.sqlite" -o -name "*.sqlite-shm" -o -name "*.sqlite-wal" -o -name ".env" -o -name "*.pem" -o -name "*.key" -o -name "*credentials*" -o -name "*cookies*" -o -name "id_rsa" -o -name "id_ed25519" -o -name "storageState*" \) ! -path "*/.git/*" 2>/dev/null)
if [ -z "$forbidden" ]; then
    echo "  No forbidden files found"
else
    echo "  WARNING: Forbidden files found:"
    echo "$forbidden"
fi

echo ""
echo "--- 6. Git status ---"
cd "$REPO_ROOT"
git status --short

echo ""
echo "========================================="
echo "  VALIDATION COMPLETE"
echo "========================================="
