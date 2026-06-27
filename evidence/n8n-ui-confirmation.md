# n8n UI Confirmation

Date: `2026-06-25`
Result: `TOOL_GAP_WEBHOOK_URL_UNKNOWN`

## Fallback Mode

Playwright MCP war fuer diesen Lauf nicht nutzbar. Deshalb gilt die manuelle UI-Checkliste als erforderlicher Fallback.

## Confirmed From Local / Prior Non-UI Evidence

- n8n-Basis erreichbar: `ja`
- Basis-URL: `http://192.168.1.52:5678`
- Workflow-Datei im Repo vorhanden: `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json`
- Workflow-Datei definiert:
  - Workflow-Name: `Spec Kit OpenCode Proxmox Runner Orchestrator`
  - Webhook-Methode: `POST`
  - Webhook-Path im Workflow-JSON: `spec-kit-opencode-proxmox-runner`
  - Response-Modus im Workflow-JSON: `responseNode`

## Not Confirmed In The Real n8n UI

1. Workflow ist importiert: `unbestaetigt`
2. Erwarteter Workflow in UI sichtbar: `unbestaetigt`
3. Webhook-Node in UI sichtbar: `unbestaetigt`
4. Webhook-Methode `POST` im UI-Node sichtbar: `unbestaetigt`
5. Exakter sichtbarer Webhook-Path in UI: `unbestaetigt`
6. Response-Modus passend konfiguriert: `unbestaetigt`
7. Credential `Proxmox Docker Host SSH` gesetzt: `unbestaetigt`
8. Credential den SSH-Nodes zugeordnet: `unbestaetigt`
9. Exakte Test- oder Production-Webhook-URL aus der UI kopiert: `nein`
10. Workflow aktiv/published oder Test-Listening aktiv: `unbestaetigt`

## Hard Stop

Der Live-POST wurde nicht ausgefuehrt, weil die exakte Webhook-URL nicht aus der realen n8n-UI kopiert oder anderweitig eindeutig belegt wurde.

## Manual Checklist To Unblock The Next Run

1. n8n unter `http://192.168.1.52:5678` oeffnen
2. Workflow `Spec Kit OpenCode Proxmox Runner Orchestrator` suchen und oeffnen
3. Webhook-Node oeffnen und `POST` + Path pruefen
4. `Proxmox Docker Host SSH` als Credential-Zuordnung der SSH-Nodes bestaetigen
5. exakte Test- oder Production-Webhook-URL aus der UI kopieren
6. Bei Test-URL zuerst `Listen for test event` aktivieren

## Classification

- `PLAYWRIGHT_MCP_TOOL_GAP`
- `TOOL_GAP_WEBHOOK_URL_UNKNOWN`
