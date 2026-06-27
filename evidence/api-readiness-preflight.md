# API Readiness Preflight

Date/Time: `2026-06-26T06:59:11.8303915+02:00`
OS: `Microsoft Windows [Version 10.0.19045.6466]`
Architecture: `AMD64`
Shell: `PowerShell 5.1.19041.6456`
Working Directory: `C:\Spec-kit_n8n`

## Environment

- `scripts/scan-n8n-live-readiness.mjs` exists: `true`
- `N8N_BASE_URL` set in current shell: `false`
- `n8n_api_key_present`: `false`

## Git Status

- Command: `git status --short`
- Exit Code: `1`
- Ergebnis: Git-Status in diesem Arbeitsverzeichnis nicht nutzbar
- Relevante Ausgabe:
  - `fatal: not a git repository (or any of the parent directories): .git`

## Local Gates

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
  - `official_spec_kit_default_rendered = ok`
  - `opencode_integration_rendered = ok`
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

## Preflight Summary

- Lokale Gates: `gruen`
- Scanner vorhanden: `ja`
- Authentifizierter API-Scan sofort moeglich: `nein`, weil `N8N_API_KEY` in dieser Shell nicht gesetzt ist
