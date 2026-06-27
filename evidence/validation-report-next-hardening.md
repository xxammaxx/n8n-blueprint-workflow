# Validation Report Next Hardening

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
  - `spec_kit_plugin_module_not_required => ok`
  - `workflow_contains_required_hosts_and_defaults => ok`
  - `no_secrets_in_dry_run_output => ok`

### 3. `node scripts/validate-local.mjs`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `Local validation passed.`

## Supporting CLI Evidence

### 4. `uvx --from git+https://github.com/github/spec-kit.git specify --help`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - top-level commands include `init`, `check`, `version`, `integration`

### 5. `uvx --from git+https://github.com/github/spec-kit.git specify init --help`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `--integration-options` is supported by this CLI
  - example syntax includes `specify init --here --integration codex --integration-options="--skills"`

### 6. `uvx --from git+https://github.com/github/spec-kit.git specify version`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `CLI Version 0.11.9.dev0`
  - platform shown as `Windows`

### 7. Probe: `specify init --here --integration opencode --script sh --force --ignore-agent-tools`

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `Selected coding agent integration: opencode`
  - `Install integration (opencode)`
  - `Project ready.`
  - `.opencode/commands/speckit.*.md` created

### 8. Probe: `specify init --here --integration opencode --integration-options="--skills" --script sh --force --ignore-agent-tools`

- Exit code: `1`
- Result: `EXPECTED_FALLBACK`
- Relevant output:
  - `Unknown integration option '--skills'.`
- Interpretation:
  - current local `opencode` path should stay on slash-command mode

### 9. Probe: `specify integration list` inside initialized opencode project

- Exit code: `0`
- Result: `PASS`
- Relevant output:
  - `opencode` shown as `installed (default)`

### 10. `bash --version`

- Exit code: `1`
- Result: `TOOL_GAP`
- Relevant output:
  - no WSL distribution installed

## Red-Test Coverage

- Empty blueprint -> covered by `dry-run-local.mjs`
- Dangerous `project_slug` -> covered by `dry-run-local.mjs`
- Missing GitHub remote -> covered by `dry-run-local.mjs`
- Missing runner container -> guarded by host script and asserted in dry-run
- Missing SSH credentials -> documented in README and runbook
- Missing `spec_kit_plugin_module` -> standard path still works by default
- Missing `spec_kit_install_command` -> official `uv` default is rendered
- Secret-like runtime values -> blocked by `validate-local.mjs`
- Destructive runtime commands -> blocked by `validate-local.mjs`
- Docker not directly on Proxmox -> documented in Runbook variants A/B/C

## Validation Outcome

- Local status: `GREEN`
- Live SSH/Proxmox/Docker status: `NOT_EXECUTED`
- Overall prepared state: `REAL_E2E_READY_PREPARED`
