# Trusted Readiness Scan

Date: `2026-06-26T08:01:05.134Z`
Runner: `run-trusted-readiness-scan.mjs`
Mode: `trusted_imported_functions`
Repo root: `C:\Spec-kit_n8n`
Decision: `GREEN_PARTIAL_TOOL_GAP`
Allowed next action: `STOP_AND_DOCUMENT`

## Diagnosis

- Base URL: `http://192.168.1.52:5678`
- Decision: `N8N_BASE_REACHABLE`
- Summary: ok=`5`, failed=`0`, timeout=`0`

## Scan

- Base status: `N8N_BASE_REACHABLE`
- API status: `N8N_API_AUTH_MISSING`
- Workflow status: `UNKNOWN`
- Workflow active: `false`
- Credential status: `UNKNOWN`
- Webhook URL status: `LOCAL_ONLY_DERIVED`
- Webhook method: `POST`

## Safety

- API key present: `false`
- API key logged: `false`
- Secret values accessed: `false`
- Entrypoint tool gap accepted: `false`

## Notes

- none

