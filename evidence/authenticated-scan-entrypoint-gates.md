# Authenticated Scan Entrypoint Gates

- `node scripts/build-workflow.mjs` -> exit `0`
  - Output: `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`
- `node scripts/dry-run-local.mjs` -> exit `0`
  - Result: `ok=true`
  - Relevant output: local non-destructive checks remained green and still documented guarded paths such as `RUNNER_CONTAINER_NOT_FOUND`, `DOCKER_UNREACHABLE`, and blocked implement/taskstoissues actions in dry-hop mode
- `node scripts/validate-local.mjs` -> exit `0`
  - Output: `Local validation passed.`
- `node scripts/diagnose-n8n-http.mjs` -> exit `0`
  - Result: evidence files written
  - Relevant output: direct CLI path completed, but trusted baseline comparison later showed its HTTP decision diverges from the stable stdin-based import path in this managed agent context
- `node scripts/scan-n8n-live-readiness.mjs` -> exit `0`
  - Result: evidence files written
  - Relevant output: direct CLI path completed, but direct file execution can still misclassify `base_status` compared with the trusted stdin-based baseline
- `node scripts/test-scanner-entrypoints.mjs` -> exit `0`
  - Result: `ENTRYPOINTS_INCONSISTENT`
  - Relevant output: direct CLI reported `N8N_BASE_UNREACHABLE`, trusted imported baseline reported `N8N_BASE_REACHABLE`, while `api_status`, `decision`, and `allowed_next_action` still matched

Gate interpretation:

- Local gates: `green`
- Entrypoint comparison: `inconsistent`
- Live POST: `blocked`
