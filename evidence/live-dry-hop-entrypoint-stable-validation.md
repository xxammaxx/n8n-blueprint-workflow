# Live Dry-Hop Entrypoint Stable Validation

- Live POST executed: `no`
- Reason: `scanner-entrypoint-comparison.json` reports `ENTRYPOINTS_INCONSISTENT`
- Trusted scan result: `N8N_BASE_REACHABLE`, `N8N_API_AUTH_MISSING`, `GREEN_PARTIAL_TOOL_GAP`, `STOP_AND_DOCUMENT`
- Direct CLI scan result in this agent context: `N8N_BASE_UNREACHABLE`
- Response file present: `false`
- Validation outcome: no webhook POST was allowed because the direct CLI entrypoint still diverges from the trusted stdin-based imported baseline
