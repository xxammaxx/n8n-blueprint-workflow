#!/usr/bin/env bash
# evidence_write.sh — Standardized evidence writing utility
# Writes structured JSON evidence to the run directory.

set -euo pipefail

EVIDENCE_DIR="${1:-}"
STATUS="${2:-UNKNOWN}"
MESSAGE="${3:-}"

if [[ -z "$EVIDENCE_DIR" ]]; then
  echo "Usage: evidence_write.sh <evidence_dir> <status> [message]"
  exit 1
fi

mkdir -p "$EVIDENCE_DIR"

TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$EVIDENCE_DIR/evidence-entry.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "status": "$STATUS",
  "message": "$MESSAGE",
  "script": "$(basename "$0")",
  "pid": $$
}
EOF

echo "[$TIMESTAMP] evidence: status=$STATUS message=$MESSAGE" >> "$EVIDENCE_DIR/evidence.log" 2>/dev/null || true
echo "Evidence written: $EVIDENCE_DIR/evidence-entry.json"
