# Trusted Runner Final Gates

Date: `2026-06-26T08:47:25.3151324+02:00`

- Command: `node scripts/build-workflow.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json wurde erzeugt`

- Command: `node scripts/dry-run-local.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `dry_run_local ok=true`, sichere Dry-Hop-Flags und Guardrails weiter vorhanden

- Command: `node scripts/validate-local.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `Local validation passed.`

- Command: `node scripts/test-scanner-entrypoints.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `ENTRYPOINTS_CONSISTENT`, `DIRECT_CLI_OK`, `TRUSTED_IMPORT_OK`
  Hinweis: genehmigter LAN-Read-only-Zugriff auf `192.168.1.52:5678`

- Command: `node scripts/run-trusted-readiness-scan.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `N8N_BASE_REACHABLE`, `N8N_API_AUTH_MISSING`, `GREEN_PARTIAL_TOOL_GAP`, `STOP_AND_DOCUMENT`
  Hinweis: genehmigter LAN-Read-only-Zugriff auf `192.168.1.52:5678`
