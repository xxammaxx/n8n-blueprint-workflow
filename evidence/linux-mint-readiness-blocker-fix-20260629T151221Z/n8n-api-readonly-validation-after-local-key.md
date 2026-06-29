# n8n API Read-Only Validation (After Local Key)

**Timestamp:** 2026-06-29T15:12:21Z

## Test Execution

| Check | Result |
|---|---|
| API-Test executed | yes |
| HTTP Code | **200** |
| Success (200) | yes |
| API-Key value emitted | **no** |
| Temporary response file deleted | yes |
| `N8N_API_KEY` unset after test | yes |

## Test Details

- **Endpoint:** `${N8N_BASE_URL}/api/v1/workflows?limit=1`
- **Method:** GET (read-only)
- **Header:** `X-N8N-API-KEY` with API key from `secrets/n8n-api.env`
- **Response:** Non-empty, HTTP 200

## Status

`N8N_API_READY`
