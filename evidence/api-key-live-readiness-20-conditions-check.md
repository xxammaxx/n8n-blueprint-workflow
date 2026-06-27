# 20-Bedingungen-Check für Live-Dry-Hop POST

Datum: 2026-06-26

## Bedingungen

| # | Bedingung | Soll | Ist | Status |
|---|---|---|---|---|
| 1 | Lokale Gates grün | ok=true | ok=true | ✅ PASS |
| 2 | Trusted-Runner grün | READY_FOR_LIVE_POST | GREEN_PARTIAL_TOOL_GAP | ❌ FAIL |
| 3 | Entrypoints konsistent | ENTRYPOINTS_CONSISTENT | ENTRYPOINTS_CONSISTENT | ✅ PASS |
| 4 | N8N_API_KEY vorhanden, nicht geloggt | true | true | ✅ PASS |
| 5 | n8n-Basis: N8N_BASE_REACHABLE | N8N_BASE_REACHABLE | N8N_BASE_REACHABLE | ✅ PASS |
| 6 | API-Status: N8N_API_READY | N8N_API_READY | N8N_API_READY | ✅ PASS |
| 7 | Workflow-Status: CONFIRMED_IMPORTED | CONFIRMED_IMPORTED | MISSING | ❌ FAIL |
| 8 | Webhook-URL-Status: CONFIRMED_FROM_UI_OR_API | CONFIRMED_FROM_UI_OR_API | LOCAL_ONLY_DERIVED | ❌ FAIL |
| 9 | Webhook-Methode: POST | POST | POST | ✅ PASS |
| 10 | Webhook-URL-Type: test/production | test/production | production | ✅ PASS |
| 11 | Credential-Status: CONFIRMED_ASSIGNED/METADATA_ONLY | CONFIRMED_ASSIGNED oder METADATA_ONLY | UNKNOWN | ❌ FAIL |
| 12 | Payload sicher | safe=true | safe=true | ✅ PASS |
| 13 | dry_run: true | true | true | ✅ PASS |
| 14 | live_dry_hop_only: true | true | true | ✅ PASS |
| 15 | enable_implement: false | false | false | ✅ PASS |
| 16 | enable_taskstoissues: false | false | false | ✅ PASS |
| 17 | Keine Secrets | secret_like_found=false | secret_like_found=false | ✅ PASS |
| 18 | Keine destruktiven Kommandos | 0 patterns | 0 patterns | ✅ PASS |
| 19 | Trusted-Runner: READY_FOR_LIVE_POST | READY_FOR_LIVE_POST | GREEN_PARTIAL_TOOL_GAP | ❌ FAIL |
| 20 | Trusted-Runner: POST_LIVE_DRY_HOP | POST_LIVE_DRY_HOP | STOP_AND_DOCUMENT | ❌ FAIL |

## Ergebnis

| Metrik | Wert |
|---|---|
| PASS | 13 |
| FAIL | 7 |
| Entscheidung | STOP_AND_DOCUMENT |

## Grund für STOP

Der Ziel-Workflow "Spec Kit OpenCode Proxmox Runner Orchestrator" ist nicht in der n8n-Instanz importiert. Ohne importierten und aktiven Workflow können Webhook-URL und Credential-Zuordnung nicht per API bestätigt werden. Der Live-POST würde ins Leere laufen.

## Nächster Schritt

Workflow in n8n importieren und aktivieren, dann erneuten Scan starten.
