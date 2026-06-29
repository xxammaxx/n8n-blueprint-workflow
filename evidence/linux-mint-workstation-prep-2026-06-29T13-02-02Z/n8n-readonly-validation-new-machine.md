# n8n Read-Only Validation — New Machine

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **n8n URL:** http://192.168.1.52:5678
- **Machine:** Linux Mint 22.1 (xxammaxx-desktop)

## HTTP Checks

| Check | Result | Details |
|-------|--------|---------|
| /healthz | PASS | HTTP 200, `{"status":"ok"}` |
| / (base page) | PASS | HTTP 200, n8n web UI served, 18893 bytes |
| Content-Type | OK | text/html; charset=utf-8 |

## API Check

| Check | Result |
|-------|--------|
| API key available | NO — placeholder only |
| API tests run | NO — `N8N_API_KEY_NOT_READY` |
| API key displayed | NO |

## Summary
- n8n is reachable and serving normally from the new Linux Mint workstation
- API-level validation deferred until real API key is saved locally
