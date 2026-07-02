# Dispatcher Workflow UI Smoke

## Datum/Zeit
- **UTC**: 2026-07-02T21:51:43Z

## Ergebnis
- **Status**: `DISPATCHER_UI_SMOKE_GREEN` :white_check_mark:

## Workflow-Identifikation
- **Workflow ID**: `Sv12QTo56NoPUu2D`
- **Name**: "GitHub Ready Issue -> Runner Agent Dispatch"
- **URL**: `http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D`
- **Seitentitel**: "▶️ GitHub Ready Issue -> Runner Agent Dispatch - n8n[DEV]"
- **URL enthält Workflow-ID**: ja

## Read-Only Checks
| Check | Wert | Status |
|-------|------|--------|
| Workflow existiert | ja | :white_check_mark: |
| Workflow-ID passt | ja (Sv12QTo56NoPUu2D) | :white_check_mark: |
| Active/Published sichtbar | ja ("Published" im Body) | :white_check_mark: |
| Node-Anzahl sichtbar | ja (Canvas sichtbar, 18 Nodes per API) | :white_check_mark: |
| Schedule Trigger sichtbar | ja ("Schedule Trigger (15 min)") | :white_check_mark: |
| Manual Trigger sichtbar | ja ("Manual Trigger (Smoke Test)") | :white_check_mark: |
| Keine Error-Banner | ja (`hasErrorText: false`) | :white_check_mark: |
| Kein Dirty/Unsaved State | ja (`hasDirtyState: false`) | :white_check_mark: |

## Workflow-Struktur (aus Body-Text extrahiert)
1. Schedule Trigger (15 min)
2. Manual Trigger (Smoke Test)
3. GitHub Search Issues (agent:ready)
4. Fetch Issue from GitHub
5. Guardrails & Validate
6. Remove agent:ready Label
7. Add agent:running Label
8. Prepare RUN_INPUT.json
9. SSH Write RUN_INPUT to Runner
10. SSH Start Runner Script
11. Wait (5s)
12. SSH Read status.json
13. Format Evidence Comment
14. Create GitHub Comment on Issue
15. Add Labels (agent:needs-review, evidence:attached)
16. Remove agent:running Label (404-tolerant)
17. Format Final Result

= 17 visible steps (18 total with additional node per API)

## Sicherheits-Checks
- **Keine Workflow-Änderung**: ja (nur read-only)
- **Keine Credentials geöffnet**: ja
- **Kein Save/Publish/Execute geklickt**: ja
- **Kein Active Toggle**: ja
- **Keine Executions gelöscht/gestartet**: ja
- **Keine Secrets sichtbar**: ja
- **Keine Screenshots gespeichert**: ja (keine gespeichert)

## Login
- Neuer Browser-Context (keine alten Cookies)
- Manuelles Login durch Nutzer erforderlich und durchgeführt
- Login automatisch per URL-Änderung erkannt (12 Polls, ~24s)
