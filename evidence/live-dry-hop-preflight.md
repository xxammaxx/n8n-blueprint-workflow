# Live Dry Hop Preflight

## Runtime Context

- Timestamp: `2026-06-25T14:37:05.2063749+02:00`
- OS: `Windows`
- Shell: `powershell`
- Working directory: `C:\Spec-kit_n8n`
- Known Proxmox host: `192.168.1.136`

## Repository State

- `git status --short` exit code: `1`
- Result: `STALE`
- Relevant output:
  - `fatal: not a git repository (or any of the parent directories): .git`

Present project files verified:

- `README.md`
- `docs/proxmox-docker-runbook.md`
- `examples/payload.example.json`
- `examples/live-dry-hop-payload.example.json`
- `scripts/build-workflow.mjs`
- `scripts/container_pipeline.mjs`
- `scripts/dry-run-local.mjs`
- `scripts/validate-local.mjs`
- `scripts/remote_runner_orchestrator.sh`
- `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json`

## Tooling Evidence

- Node: `v24.14.0`
- npm: `11.9.0`
- Python: `Python 3.14.3`

## Documentation / Defaults Check

Verified in local files:

- Proxmox host `192.168.1.136` is documented as a host value only
- runner container default `n8n-runners` is documented
- workspace default `/workspace` is documented
- workflow JSON exists
- example payload exists
- live dry-hop payload exists
- workflow contains the webhook id `spec-kit-opencode-proxmox-runner`
- no concrete n8n base URL or webhook URL is stored in the repository

## Local Gates Before Live Hop

### 1. `node scripts/build-workflow.mjs`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`

### 2. `node scripts/dry-run-local.mjs`

- Exit code: `0`
- Result: `PASS`
- Relevant output summary:
  - `payload_defaults => ok`
  - `dangerous_project_slug_sanitized => ok`
  - `missing_blueprint_returns_controlled_error => ok`
  - `official_spec_kit_default_rendered => ok`
  - `opencode_integration_rendered => ok`
  - `taskstoissues_skips_without_remote => ok`
  - `runner_missing_container_error_path_present => ok`
  - `docker_unreachable_error_path_present => ok`
  - `spec_kit_plugin_module_not_required => ok`
  - `live_dry_hop_preview_rendered => ok`
  - `dry_run_blocks_implement => ok`
  - `live_dry_hop_only_blocks_spec_kit_commands => ok`
  - `missing_specify_policy_documented => ok`
  - `workflow_contains_required_hosts_and_defaults => ok`
  - `no_secrets_in_dry_run_output => ok`

### 3. `node scripts/validate-local.mjs`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `Local validation passed.`

## Live Decision Preflight

Conditions verified locally:

- local gates are green
- workflow JSON is importable as a file artifact
- live dry-hop payload exists and keeps `dry_run=true`
- live dry-hop payload keeps `live_dry_hop_only=true`
- live dry-hop payload keeps `enable_implement=false`
- live dry-hop payload keeps `enable_taskstoissues=false`

Conditions not verifiable from the repository alone:

- workflow is actually imported into a live n8n instance
- SSH credential `Proxmox Docker Host SSH` is present in n8n
- concrete webhook endpoint is known
- Docker target host is reachable through that n8n credential
- runner container `n8n-runners` is running remotely

Preflight classification:

- Local status: `GREEN`
- Live status: `TOOL_GAP`
- Prepared state: `GREEN_PARTIAL`
