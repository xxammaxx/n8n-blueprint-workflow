# n8n Workflow Activation

**Generated:** 2026-06-26T09:45:00Z  
**Phase:** 6 — Workflow Aktivierung  
**Agent:** issue-orchestrator  

## Activation Conditions

| Bedingung | Status | Anmerkung |
|---|---|---|
| Workflow importiert | **unbekannt** | Manueller Import erforderlich |
| Webhook-Node korrekt | ✅ | POST /spec-kit-opencode-proxmox-runner (laut JSON) |
| SSH-Nodes korrekt | ✅ | 2 SSH Nodes vorhanden (laut JSON) |
| Credential zugeordnet | **unbekannt** | Manuelle Zuordnung erforderlich |
| Metadata-Only akzeptiert | ⚠️ | `SPEC_KIT_ACCEPT_CREDENTIAL_METADATA_ONLY` nicht gesetzt |
| Secrets sichtbar | ❌ nein | Keine Secrets im JSON |
| Payload-Dry-Hop sicher | ✅ | `dry_run: true`, `live_dry_hop_only: true` |
| Gefährliche Befehle | ✅ | Keine destruktiven Befehle |

## Aktivierungs-Entscheidung

**Workflow NICHT aktiviert** — folgende Bedingungen fehlen:

1. ❌ Workflow-Import nicht bestätigt
2. ❌ Credential-Zuordnung nicht bestätigt
3. ❌ Metadata-Only-Freigabe nicht gesetzt

## Manuelle Aktivierung (nach Import und Credential-Zuordnung)

1. Workflow in n8n öffnen
2. **Inactive** → **Active** umschalten
3. Prüfen: Webhook wird aktiv, URL wird erzeugt
4. Workflow-URL notieren: `http://192.168.1.52:5678/webhook/spec-kit-opencode-proxmox-runner`

## Sicherheitshinweise

- Nur aktivieren, wenn SSH-Credential korrekt konfiguriert ist
- Vor erstem Live-Test: `dry_run: true` im Payload setzen
- Keine echten Blueprint-Daten im ersten Test

## Entscheidung

**Aktivierung: NEIN** (Vorbedingungen nicht erfüllt)
- **Status: GREEN_PARTIAL/TOOL_GAP**
- Nächster Schritt: Manueller Import + Credential-Zuordnung + Aktivierung durch Benutzer
