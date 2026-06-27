# Authenticated n8n Scan Result

Date: `2026-06-26`
Result: `NOT_READY_FOR_LIVE_POST`

## Scanner Summary

- API-Key vorhanden: `nein`
- API erreichbar: `nein auth-bestaetigt`
- Workflow bestaetigt: `nein`
- Workflow aktiv: `nein`
- Webhook bestaetigt: `nein`
- Webhook-URL-Status: `LOCAL_ONLY_DERIVED`
- Credential-Status: `UNKNOWN`
- Scannerentscheidung: `GREEN_PARTIAL_TOOL_GAP`
- `allowed_next_action`: `STOP_AND_DOCUMENT`

## Important Notes

- `N8N_API_KEY` wurde nicht ausgegeben.
- Das Scanner-JSON ist valide und maschinenlesbar.
- Kein Live-POST wurde freigegeben.

## Cross-Check

Direkte PowerShell-Checks ausserhalb des Node-Scanners lieferten weiterhin:

- `GET /healthz -> 200`
- `GET /rest/settings -> 200`

Der eingebaute Scanner-HTTP-Pfad lieferte dagegen `N8N_BASE_UNREACHABLE`. Das ist ein Widerspruch und bleibt als Restriproblem fuer den Scanner dokumentiert.
