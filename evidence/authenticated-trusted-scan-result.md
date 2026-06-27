# Authenticated Trusted Scan Result

Date: `2026-06-26T06:57:13Z`

## Trusted-Runner

- Autoritativer Runner: `scripts/run-trusted-readiness-scan.mjs`
- Entscheidung: `GREEN_PARTIAL_TOOL_GAP`
- `allowed_next_action`: `STOP_AND_DOCUMENT`

## Pruefpunkte

- n8n-Basis: `N8N_BASE_REACHABLE`
- API-Status: `N8N_API_AUTH_MISSING`
- Workflow-Status: `UNKNOWN`
- Workflow aktiv: `nein`
- Webhook-Methode: `POST`
- Webhook-Path: `spec-kit-opencode-proxmox-runner`
- Webhook-URL-Status: `LOCAL_ONLY_DERIVED`
- Webhook-URL-Type: `production`
- Credential-Status: `UNKNOWN`
- Credential-Secret-Werte gelesen: `nein`
- Payload sicher: `ja`
- Entrypoints konsistent: `ja`
- Credential-Metadata-only akzeptiert: `nein`

## Befund

- `READY_FOR_LIVE_POST`: `nein`
- `POST_LIVE_DRY_HOP`: `nein`
- Live-POST ausgefuehrt: `nein`

## Gruende fuer den Stopp

- `N8N_API_KEY` fehlt in der aktuellen Shell, daher blieb der API-Status bei `N8N_API_AUTH_MISSING`.
- Workflow wurde nicht authentifiziert per n8n API bestaetigt.
- Webhook-URL wurde nicht aus API oder UI bestaetigt; sie ist nur lokal aus dem Workflow-JSON abgeleitet.
- SSH-Credential-Zuordnung wurde nicht per API oder UI bestaetigt.

## Payload-Pruefung

- `project_slug`: `speckit-live-dry-hop-canary`
- `proxmox_host`: `192.168.1.136`
- `docker_target_host`: `192.168.1.136`
- `docker_target_mode`: `direct-proxmox-docker`
- `runner_container_name`: `n8n-runners`
- `project_root`: `/workspace`
- `enable_optional_quality_gates`: `false`
- `enable_taskstoissues`: `false`
- `enable_implement`: `false`
- `enable_converge`: `false`
- `dry_run`: `true`
- `live_dry_hop_only`: `true`
- Verbotene Felder/Inhalte gefunden: `nein`

## Statusentscheidung

- Klassifikation: `GREEN_PARTIAL`
- Begruendung: lokale Gates und Trusted-Runner sind gruen, aber die autoritative Live-Freigabe fehlt eindeutig. Daher kein POST.
