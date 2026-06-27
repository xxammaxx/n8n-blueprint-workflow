# API Key — Finale Gates

Datum: 2026-06-26

## Gate-Ergebnisse

| Command | Exit Code | Status |
|---|---|---|
| `node scripts/build-workflow.mjs` | 0 | ✅ GREEN |
| `node scripts/dry-run-local.mjs` | 0 | ✅ GREEN |
| `node scripts/validate-local.mjs` | 0 | ✅ GREEN |
| `node scripts/test-scanner-entrypoints.mjs` | 0 | ✅ GREEN |
| `node scripts/run-trusted-readiness-scan.mjs` | 0 | ✅ GREEN (Entscheidung: GREEN_PARTIAL_TOOL_GAP) |

## Fazit

Lokale Pipeline: **GREEN**.
Trusted-Runner: **GREEN** (Exit Code 0, aber Entscheidung: `GREEN_PARTIAL_TOOL_GAP`).
API-Status: **N8N_API_READY**.
Workflow-Status: **MISSING** — nicht in n8n importiert.
Live-POST: **BLOCKED** — 7 von 20 Bedingungen nicht erfüllt.
