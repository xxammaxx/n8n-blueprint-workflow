# Windows HTTP Scanner Preflight

- Date/time: `2026-06-26T07:35:09.5987282+02:00`
- OS: `Microsoft Windows [Version 10.0.19045.6466]`
- Shell: `powershell 5.1.19041.6456`
- Node: `v24.14.0`
- npm: `11.9.0`
- Working directory: `C:\Spec-kit_n8n`
- Git status usable: `no`
- Git note: `fatal: not a git repository (or any of the parent directories): .git`
- `scripts/scan-n8n-live-readiness.mjs` exists: `true`
- `N8N_BASE_URL` set: `false`
- `N8N_API_KEY` set: `false`
- Proxy env booleans:
  - `HTTP_PROXY=false`
  - `HTTPS_PROXY=false`
  - `NO_PROXY=false`
  - `http_proxy=false`
  - `https_proxy=false`
  - `no_proxy=false`

## Local Gates

- `node scripts/build-workflow.mjs` -> exit `0`
  - Output: `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`
- `node scripts/dry-run-local.mjs` -> exit `0`
  - Result: `ok=true`
  - Relevant output: local dry-run remained non-destructive and kept guarded error paths such as `RUNNER_CONTAINER_NOT_FOUND` and `DOCKER_UNREACHABLE`
- `node scripts/validate-local.mjs` -> exit `0`
  - Output: `Local validation passed.`

## Direct HTTP Comparison

- Direct PowerShell check:
  - `Invoke-WebRequest http://192.168.1.52:5678/healthz` -> `200`
  - `Invoke-WebRequest http://192.168.1.52:5678/rest/settings` -> `200`
- Inline stdin-based Node probes:
  - `fetch('/healthz')` -> `200`
  - `http.request('/healthz')` -> `200`
  - `spawnSync('powershell', Invoke-WebRequest '/healthz')` -> `200`
- Contradiction observed before fix:
  - direct `node scripts/diagnose-n8n-http.mjs`
  - direct `node scripts/scan-n8n-live-readiness.mjs`
  - both could still produce false `N8N_BASE_UNREACHABLE` in this managed agent runtime
