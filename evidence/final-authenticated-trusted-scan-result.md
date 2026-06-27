# Final Authenticated Trusted Scan Result (Phase 3)

Generated: 2026-06-26

## Source: trusted-readiness-scan.json (trusted_imported_functions)

| Feld | Wert |
|---|---|
| n8n-Basis | `N8N_BASE_REACHABLE` |
| API-Status | `N8N_API_AUTH_MISSING` |
| Workflow-Status | `UNKNOWN` |
| Workflow aktiv | nein |
| Webhook-Methode | `POST` (aus lokaler Workflow-JSON) |
| Webhook-Path | `spec-kit-opencode-proxmox-runner` (aus lokaler Workflow-JSON) |
| Webhook-URL-Status | `LOCAL_ONLY_DERIVED` |
| Credential-Status | `UNKNOWN` |
| Credential-Secret-Werte gelesen | nein |
| Entscheidung | `GREEN_PARTIAL_TOOL_GAP` |
| allowed_next_action | `STOP_AND_DOCUMENT` |

## Entrypoint-Vergleich (scanner-entrypoint-comparison.json)

| Check | Status |
|---|---|
| Entrypoint-Status | `ENTRYPOINTS_CONSISTENT` |
| Direct CLI | `DIRECT_CLI_OK` |
| Trusted Import | `TRUSTED_IMPORT_OK` |
| Field Match | Alle 4 Felder konsistent |

## Safety

| Check | Status |
|---|---|
| API-Key vorhanden | nein |
| API-Key geloggt | nein |
| Secret-Werte gelesen | nein |

## Gründe für STOP_AND_DOCUMENT

1. `N8N_API_KEY` ist in dieser Shell nicht gesetzt → authentifizierte API-Evidence nicht möglich.
2. Workflow-Import-Status kann nicht per API bestätigt werden.
3. Exakte Webhook-URL kann nicht per API bestätigt werden (nur lokal abgeleitet).
4. SSH-Credential-Zuordnung kann nicht per API bestätigt werden.
5. Playwright MCP nicht verfügbar → keine UI-Evidence.

## Bewertung

Lokale Gates: GRÜN
Entrypoints: KONSISTENT
n8n-Basis: ERREICHBAR
API: NICHT AUTHENTIFIZIERT

→ **Status: GREEN_PARTIAL** — API-Key fehlt, Live-POST blockiert.
→ **Kein Live-POST gesendet.**
