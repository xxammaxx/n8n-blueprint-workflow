# Playwright MCP n8n UI E2E

Date: `2026-06-26`
Result: `SKIPPED`
Classification: `PLAYWRIGHT_MCP_TOOL_GAP`

## Reason

In diesem Lauf wurde kein direkt aufrufbares Playwright-MCP-Browser-Tool verfuegbar. Deshalb wurde kein echter UI-E2E-Scan gegen n8n ausgefuehrt.

## What Is Still Known

- n8n-Basis `http://192.168.1.52:5678` ist erreichbar
- `GET /healthz` -> `200`
- `GET /rest/settings` -> `200`
- `GET /rest/workflows` und `GET /rest/credentials` waren bereits als `401` belegt
- lokale Hilfsartefakte existieren weiterhin, ersetzen aber keinen echten MCP-UI-Lauf:
  - `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json`
  - `C:\Users\xxammaxx\pw-n8n-login-server.js`

## What Is Not Proven In This File

- Login-Zustand in der UI
- Workflow-Liste im eingeloggten Zustand
- Workflow `Spec Kit OpenCode Proxmox Runner Orchestrator` in der UI
- SSH-Credential-Zuordnung `Proxmox Docker Host SSH`
- exakte Test- oder Production-Webhook-URL aus der UI
- letzte Execution in der UI

## Consequence

Playwright liefert in diesem Lauf keine Freigabe fuer Phase 6. Der Scan bleibt deshalb auf lokale und HTTP-Evidence begrenzt.
