# Trusted Scanner Runner Gates

Date: `2026-06-26T08:47:25.3151324+02:00`

- Command: `node scripts/build-workflow.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json wurde erzeugt`

- Command: `node scripts/dry-run-local.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `dry_run_local ok=true`, Dry-Hop-Guards aktiv, `RUNNER_CONTAINER_NOT_FOUND` und `DOCKER_UNREACHABLE` weiter als kontrollierte Fehlerpfade vorhanden

- Command: `node scripts/validate-local.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `Local validation passed.`

- Command: `node scripts/test-scanner-entrypoints.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: `ENTRYPOINTS_CONSISTENT`, `DIRECT_CLI_OK`, `TRUSTED_IMPORT_OK`, Basisentscheidung `N8N_BASE_REACHABLE`, Scanentscheidung `GREEN_PARTIAL_TOOL_GAP`
  Hinweis: fuer LAN-Zugriff auf `192.168.1.52:5678` mit genehmigter Escalation ausgefuehrt

- Command: `node scripts/run-trusted-readiness-scan.mjs`
  Exit Code: `0`
  Ergebnis: `PASS`
  Relevante Ausgabe: autoritativer Runner schrieb `trusted-readiness-scan.json/.md`, Diagnose `N8N_BASE_REACHABLE`, Scan `GREEN_PARTIAL_TOOL_GAP`, `allowed_next_action=STOP_AND_DOCUMENT`
  Hinweis: fuer LAN-Zugriff auf `192.168.1.52:5678` mit genehmigter Escalation ausgefuehrt
