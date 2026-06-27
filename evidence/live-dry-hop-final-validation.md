# Live Dry Hop Final Validation

## Local Commands

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

## Response Artifact

- `evidence/live-dry-hop-response.json`: `NOT_PRESENT`
- Reason:
  - live webhook POST was not allowed in this run

## Red-Test Confirmation

- Empty blueprint -> covered
- Dangerous `project_slug` -> covered
- `dry_run=true` plus `enable_implement=true` -> blocked
- `live_dry_hop_only=true` -> no Spec Kit commands in preview
- Missing runner container -> guarded
- Missing Docker access -> guarded
- Missing SSH credentials -> documented in runbook
- Secret-like values in workflow/payload -> blocked
- Destructive commands -> blocked
- Missing `specify` in runner -> `MISSING_TOOL` policy documented
- Missing `opencode` in runner -> `MISSING_TOOL` policy documented

## Final Validation Decision

- Local validation status: `GREEN`
- Live execution status: `GREEN_PARTIAL`
- Security status: `GREEN`
