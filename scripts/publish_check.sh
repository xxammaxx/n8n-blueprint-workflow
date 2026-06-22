#!/bin/bash
# publish_check.sh — Check which workflows are published and active
# Run on the n8n container (101)
set -euo pipefail

echo "=== n8n Publish Status Check ==="
echo ""

# Source .env if present
if [ -f /opt/dev-fabric/n8n/.env ]; then
    set -a
    . /opt/dev-fabric/n8n/.env
    set +a
fi

# Export published workflows
TMPFILE=$(mktemp)
n8n export:workflow --all --published --output="$TMPFILE" 2>/dev/null

echo "Published workflows:"
python3 -c "
import json
with open('$TMPFILE') as f:
    data = json.load(f)
for w in data:
    active = 'ACTIVE' if w.get('active') else 'INACTIVE'
    nodes = len(w.get('nodes', []))
    print(f'  [{active}] {w[\"name\"]} (id={w[\"id\"]}) nodes={nodes}')
" 2>/dev/null || echo "  (could not parse)"

echo ""

# Check webhook registrations
echo "Webhook paths (from service logs):"
journalctl -u n8n --no-pager -n 200 2>/dev/null | grep -i "webhook.*registered\|webhook path" | tail -10 || echo "  (no webhook entries found)"

echo ""

# Check service status
echo "Service status:"
systemctl is-active n8n 2>/dev/null || echo "  (n8n service not found)"

rm -f "$TMPFILE"
