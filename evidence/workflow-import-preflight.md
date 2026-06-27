# Workflow Import Preflight

**Generated:** 2026-06-26T09:35:00Z  
**Phase:** 1 — Setup-Preflight  
**Agent:** issue-orchestrator

## Environment Variables

| Variable | Status |
|---|---|
| `N8N_BASE_URL` gesetzt | ja (`http://192.168.1.52:5678`) |
| `N8N_API_KEY` gesetzt | **nein** |
| `SPEC_KIT_EXPECTED_WORKFLOW_NAME` gesetzt | ja |
| `SPEC_KIT_EXPECTED_WEBHOOK_PATH` gesetzt | ja |
| `SPEC_KIT_EXPECTED_CREDENTIAL_NAME` gesetzt | ja |
| API-Key ausgegeben | nein |
| Secret-Werte ausgegeben | nein |

## Workflow JSON

| Property | Value |
|---|---|
| Workflow-Datei existiert | ja |
| Pfad | `C:/Spec-kit_n8n/workflows/spec-kit-opencode-proxmox-runner-orchestrator.json` |
| Dateigröße | 61749 Bytes |
| Letzte Änderung | 2026-06-26 09:33:55 |

## n8n Base Reachability

| Check | Status |
|---|---|
| `GET /healthz` | 200 OK |
| `GET /rest/settings` | 200 OK |

## Entscheidung

Da `N8N_API_KEY` nicht gesetzt ist:
- Lokale Preflight- und Gate-Prüfungen werden ausgeführt
- API-gestützter Importstatus kann nicht bewertet werden
- Kein Live-POST wird gesendet
- Vorläufiger Status: **GREEN_PARTIAL**

## Nächster Schritt

Phase 2 — Lokale Gates vor Import ausführen.
