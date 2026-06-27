# n8n Workflow Import Confirmation

**Generated:** 2026-06-26T09:44:30Z  
**Phase:** 4 — Workflow in n8n importieren  
**Agent:** issue-orchestrator  

## Import Attempt

| Property | Status |
|---|---|
| Import durchgeführt | **nein** (automatisiert) |
| Grund | N8N_API_KEY nicht gesetzt + Playwright MCP nicht verfügbar |
| Methode | Manuell über n8n WebUI erforderlich |

## Manuelle Import-Schritte

Führe folgende Schritte im Browser aus:

1. **n8n öffnen**: `http://192.168.1.52:5678`
2. **Workflows → Neu** oder **Workflows öffnen**
3. **Import from File** wählen
4. Datei auswählen: `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`
5. Workflow speichern (Strg+S oder Save Button)
6. Workflow-Name prüfen: **Spec Kit OpenCode Proxmox Runner Orchestrator**
7. Webhook-Node prüfen:
   - Methode: **POST**
   - Path: **spec-kit-opencode-proxmox-runner**
   - Response Mode: **Respond to Webhook**
8. SSH-Nodes prüfen:
   - **SSH Proxmox Preflight** (ssh)
   - **SSH Runner Execute** (ssh)
9. Credential an SSH-Nodes zuweisen: **Proxmox Docker Host SSH** (siehe Phase 5)

## Workflow-JSON Validierung (vor Import)

| Check | Ergebnis |
|---|---|
| JSON valide | ✅ ja |
| Workflow-Name korrekt | ✅ ja |
| Webhook-Node (POST) | ✅ ja |
| Webhook-Path | ✅ ja |
| Respond-to-Webhook-Node | ✅ ja |
| SSH-Nodes sichtbar | ✅ (2 Nodes) |
| Secrets angezeigt/kopiert | ❌ nein |

## Entscheidung

- **Workflow kann manuell importiert werden** — JSON ist valide und sicher
- Automatisierter Import nicht möglich wegen fehlendem Playwright MCP und API-Key
- **Status: GREEN_PARTIAL/TOOL_GAP**
- Nach manuellem Import: Phase 5 (Credential-Zuordnung) ausführen
