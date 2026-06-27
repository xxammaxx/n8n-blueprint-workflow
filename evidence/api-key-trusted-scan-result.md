# API Key Trusted Scan Result

Datum: 2026-06-26

## n8n-Basis

| Feld | Wert |
|---|---|
| n8n-Basis | http://192.168.1.52:5678 |
| Basis-Status | N8N_BASE_REACHABLE |
| API-Status | N8N_API_READY |
| API-Key vorhanden | ja |

## Workflow-Status

| Feld | Wert |
|---|---|
| Workflow-Status | MISSING |
| Erwarteter Name | Spec Kit OpenCode Proxmox Runner Orchestrator |
| Workflow aktiv | nein (nicht vorhanden) |
| API-Workflows gesamt | 8 |
| Vorhandene ähnliche Workflows | Blueprint -> SpecKit/OpenCode Bootstrap V2 (aktiv), Blueprint → SpecKit/OpenCode Bootstrap (aktiv), GitHub Ready Issue -> Runner Agent Dispatch (aktiv), +5 weitere |

## Webhook

| Feld | Wert |
|---|---|
| Webhook-Status | LOCAL_ONLY_DERIVED |
| Webhook-Methode | POST |
| Webhook-Path | spec-kit-opencode-proxmox-runner |
| Quelle | local_workflow_json |

## Credential

| Feld | Wert |
|---|---|
| Credential-Status | UNKNOWN |
| Erwarteter Name | Proxmox Docker Host SSH |
| SSH-Nodes geprüft | ja (aus local workflow JSON) |
| Secret-Werte gelesen | nein |
| Metadata-Only-Freigabe | ja (per env) |

## Entscheidung

| Feld | Wert |
|---|---|
| Entscheidung | GREEN_PARTIAL_TOOL_GAP |
| allowed_next_action | STOP_AND_DOCUMENT |
| API-Key ausgegeben | nein |

## Gründe für STOP

1. Workflow "Spec Kit OpenCode Proxmox Runner Orchestrator" nicht in n8n importiert (nicht via /api/v1/workflows auffindbar)
2. Webhook-URL nicht via API bestätigt (Workflow fehlt)
3. SSH-Credential-Zuordnung nicht bestätigt (Workflow fehlt)

## Nächster Schritt

Workflow in n8n importieren: `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json` via n8n UI oder API importieren und aktivieren. Danach erneuter Scan.
