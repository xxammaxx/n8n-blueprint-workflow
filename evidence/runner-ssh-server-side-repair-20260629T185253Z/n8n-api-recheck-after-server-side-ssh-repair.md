# n8n API Recheck After Server-Side SSH Repair

## Phase 8 — Read-Only

## Meta

- **Datum/Zeit UTC:** 2026-06-29T19:07:20Z
- **n8n Base URL:** 192.168.1.52:5678
- **API Key:** present (value not logged)

## Test

```bash
curl -sS -o "$tmpfile" -w "%{http_code}" \
  -H "X-N8N-API-KEY: [REDACTED]" \
  "${N8N_BASE_URL}/api/v1/workflows?limit=1"
```

## Ergebnis

- **HTTP Code:** 200
- **Response:** non-empty
- **n8n API Status:** 🟢 GREEN

## Status

`N8N_API_READY` — n8n API erreichbar und funktionsfähig.
