# Authenticated n8n Local Gates

Date: `2026-06-26`
Result: `GREEN_PRECHECK`

## Commands

### 1. Build workflow

- Command: `node scripts/build-workflow.mjs`
- Exit Code: `0`
- Ergebnis: Workflow-Build erfolgreich
- Relevante Ausgabe:
  - `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`

### 2. Dry-run local

- Command: `node scripts/dry-run-local.mjs`
- Exit Code: `0`
- Ergebnis: Lokaler Dry-Run erfolgreich
- Relevante nicht-sensitive Befunde:
  - `phase = dry_run_local`
  - `live_dry_hop_preview_rendered = ok`
  - `dry_run_blocks_implement = ok`
  - `live_dry_hop_only_blocks_spec_kit_commands = ok`
  - `no_secrets_in_dry_run_output = ok`

### 3. Validate local

- Command: `node scripts/validate-local.mjs`
- Exit Code: `0`
- Ergebnis: Lokale Vollvalidierung erfolgreich
- Relevante Ausgabe:
  - `Local validation passed.`
