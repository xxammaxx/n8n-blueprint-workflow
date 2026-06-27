# Scanner Entrypoint Comparison

Date: `2026-06-26T08:01:05.147Z`
Status: `ENTRYPOINTS_CONSISTENT`
Direct CLI status: `DIRECT_CLI_OK`
Trusted import status: `TRUSTED_IMPORT_OK`
Entrypoint tool gap accepted: `false`

## Diagnose

- Direct CLI exit: `0`
- Imported function available: `true`
- Direct CLI decision: `N8N_BASE_REACHABLE`
- Imported decision: `N8N_BASE_REACHABLE`

## Scan

- Direct CLI exit: `0`
- Imported function available: `true`
- Direct base status: `N8N_BASE_REACHABLE`
- Imported base status: `N8N_BASE_REACHABLE`
- Trusted diagnosis decision: `N8N_BASE_REACHABLE`
- Direct API status: `N8N_API_AUTH_MISSING`
- Imported API status: `N8N_API_AUTH_MISSING`
- Direct decision: `GREEN_PARTIAL_TOOL_GAP`
- Imported decision: `GREEN_PARTIAL_TOOL_GAP`
- Direct allowed_next_action: `STOP_AND_DOCUMENT`
- Imported allowed_next_action: `STOP_AND_DOCUMENT`

## Field Comparison

- base_status: match=`true`
- api_status: match=`true`
- decision: match=`true`
- allowed_next_action: match=`true`

## Reasons

- Trusted runner evidence was used as the authoritative baseline for live readiness decisions.

