#!/bin/bash
# export_n8n_workflows.sh — Export all n8n workflows safely
# Run on the n8n container (101)
set -euo pipefail

EXPORT_DIR="${1:-/tmp/n8n-blueprint-export-$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$EXPORT_DIR"

echo "=== Exporting n8n Workflows ==="
echo "Output dir: $EXPORT_DIR"

# Source .env if present
if [ -f /opt/dev-fabric/n8n/.env ]; then
    set -a
    . /opt/dev-fabric/n8n/.env
    set +a
fi

# Export all workflows (no credential decryption)
echo ""
echo "1/3: Exporting ALL workflows..."
n8n export:workflow --all --output="$EXPORT_DIR/all-workflows.json"
echo "   Done: $(python3 -c "import json; print(len(json.load(open('$EXPORT_DIR/all-workflows.json'))))" 2>/dev/null || echo "?") workflows"

# Export published only
echo ""
echo "2/3: Exporting PUBLISHED workflows..."
n8n export:workflow --all --published --output="$EXPORT_DIR/published-workflows.json"
echo "   Done: $(python3 -c "import json; print(len(json.load(open('$EXPORT_DIR/published-workflows.json'))))" 2>/dev/null || echo "?") workflows"

echo ""
echo "3/3: Export complete"
echo ""
ls -lah "$EXPORT_DIR/"
echo ""
echo "Files ready for Git repo at: $EXPORT_DIR"
echo "Copy to repo: cp $EXPORT_DIR/*.json /path/to/repo/workflows/"
