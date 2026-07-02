# n8n API Recheck After su Diagnosis

## Date/UTC: 2026-07-02T16:08:00Z

## Result

```
n8n api http_code=401
n8n api response: non-empty
secrets unset: yes
```

## Assessment

- **Server reachable:** Yes (response received)
- **Authentication:** 401 Unauthorized
- **Prior status:** Was GREEN HTTP 200 (from preflight baseline)

## Root Cause Analysis

The 401 is NOT related to the `su - runner` PAM repair. The PAM change only affects local container authentication — it cannot affect n8n API authentication.

Possible causes (not investigated per constraints):
- API key rotation / change
- n8n service restart with new credentials
- Configuration drift

## Impact

This is a pre-existing or coincidental issue. The n8n API endpoint is reachable but authentication fails. This should be addressed in the scheduled "n8n MCP Activation" task.

## Secrets: None exposed (API key and URL properly unset after use)
