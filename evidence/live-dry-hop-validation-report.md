# Live Dry Hop Validation Report

## Command Results

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

## Live Dry Hop Execution Status

- Executed: `no`
- Reason: `TOOL_GAP`
- Evidence:
  - workflow artifact exists locally, but imported workflow state in n8n is not verifiable from this environment
  - SSH credential `Proxmox Docker Host SSH` is not verifiable from this environment
  - no concrete webhook URL is stored in the repository

## Response Artifact Check

- `evidence/live-dry-hop-response.json`: `NOT_CREATED`
- Reason:
  - no live webhook call was performed

## Red-Test Coverage

- Empty blueprint -> covered by `scripts/dry-run-local.mjs`
- Dangerous `project_slug` -> covered by `scripts/dry-run-local.mjs`
- `dry_run=true` plus `enable_implement=true` -> blocked in preview
- `live_dry_hop_only=true` -> no Spec Kit commands in preview
- Missing runner container -> guarded by host script
- Missing Docker access -> guarded by host script
- Missing SSH credentials -> documented in README and runbook
- Secret-like runtime values -> blocked by `scripts/validate-local.mjs`
- Destructive runtime commands -> blocked by `scripts/validate-local.mjs`
- Missing `specify` in runner -> documented as `MISSING_TOOL` policy in live dry-hop preview

## Validation Outcome

- Local status: `GREEN`
- Live dry-hop status: `GREEN_PARTIAL`
- No secrets found in generated local evidence
- No implementation or GitHub issue execution was triggered
