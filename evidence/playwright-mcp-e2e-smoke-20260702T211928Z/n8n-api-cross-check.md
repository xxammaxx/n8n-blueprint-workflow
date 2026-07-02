# n8n API Cross-Check

## Date/Time (UTC)
2026-07-02T21:20:XX

## API Endpoint
- **URL:** `$N8N_BASE_URL/api/v1/workflows?limit=50`
- **Auth:** X-N8N-API-KEY (sourced from secrets/n8n-api.env)
- **HTTP Code:** 200 ✅

## API Status
- **API lesbar:** JA ✅
- **Key-Wert ausgegeben:** NEIN ✅
- **Response:** non-empty JSON

## Dispatcher Workflow (`Sv12QTo56NoPUu2D`)
| Feld | Wert |
|------|------|
| **Gefunden** | YES ✅ |
| **ID** | `Sv12QTo56NoPUu2D` |
| **Name** | `GitHub Ready Issue -> Runner Agent Dispatch` |
| **Active** | `True` ✅ |
| **Node Count** | `18` ✅ (erwartet ~18) |

## Cross-Check mit UI Smoke
- API bestätigt: Workflow existiert, ist active, hat 18 Nodes
- UI Smoke konnte dies nicht visuell validieren (Login-Gate)
- API-Cross-Check ersetzt UI-Visual-Check für diese Fakten

## Security
- `secrets/n8n-api.env` hat `chmod 600` (rw-------)
- API Key nicht ausgegeben
- Tempfile gelöscht
