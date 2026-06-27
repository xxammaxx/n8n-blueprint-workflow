# n8n SSH Credential Assignment

**Generated:** 2026-06-26T09:44:45Z  
**Phase:** 5 — SSH-Credential zuordnen  
**Agent:** issue-orchestrator  

## Credential Status

| Property | Status |
|---|---|
| Credential existiert | **unbekannt** (kann nicht authentifiziert API-prüfen) |
| Credential den SSH-Nodes zugeordnet | **unbekannt** |
| Credential-Secret-Werte gelesen | **nein** |
| Credential geändert | **nein** |

## Erwartetes Credential

| Property | Value |
|---|---|
| Name | `Proxmox Docker Host SSH` |
| Typ | SSH |
| Ziel-Host | `192.168.1.136` (Proxmox Host) |
| Verwendung | SSH Proxmox Preflight + SSH Runner Execute |

## Manuelle Zuordnungsschritte

Falls Credential nicht existiert:

1. In n8n: **Credentials → Add Credential**
2. Typ: **SSH**
3. Name: **Proxmox Docker Host SSH**
4. Host: **192.168.1.136** (oder Docker-Host-IP)
5. SSH Key/Passwort eintragen (❗ nicht in dieses Dokument kopieren)
6. **Save**

Credential zuweisen:

1. Workflow **Spec Kit OpenCode Proxmox Runner Orchestrator** öffnen
2. **SSH Proxmox Preflight** Node doppelklicken
3. Im **Credential** Dropdown: **Proxmox Docker Host SSH** auswählen
4. **Save**
5. **SSH Runner Execute** Node doppelklicken
6. Gleiches Credential zuweisen
7. **Save**

## Metadata-Only Freigabe

| Bedingung | Status |
|---|---|
| Workflow eindeutig gefunden | ⏳ (nach Import) |
| SSH-Nodes vorhanden | ✅ (2 Nodes) |
| Credential-Metadaten an SSH-Nodes sichtbar | ⏳ (nach Import) |
| Credential-Secret-Werte gelesen | ❌ nein |
| Workflow-Änderung außerhalb Credential-Zuordnung | ❌ keine |

## Entscheidung

- **Credential-Status: UNKNOWN** (kann ohne API-Key nicht validiert werden)
- **Keine Secret-Werte gelesen**
- Wenn `SPEC_KIT_ACCEPT_CREDENTIAL_METADATA_ONLY=true` gesetzt: Metadata-Only-Freigabe möglich nach Import
- **Manuelle Credential-Erstellung/-Zuordnung erforderlich**
