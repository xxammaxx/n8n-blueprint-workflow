# n8n Live Readiness Scan

Date: `2026-06-26T08:01:00.220Z`
Decision: `GREEN_PARTIAL_TOOL_GAP`
Allowed next action: `STOP_AND_DOCUMENT`

## Sources

- local_workflow_json: `checked`
- n8n_base_http: `checked`
- n8n_public_api: `auth_missing`
- playwright_mcp_ui: `tool_gap`
- manual_env: `skipped`

## n8n

- Base URL: `http://192.168.1.52:5678`
- Base status: `N8N_BASE_REACHABLE`
- API status: `N8N_API_AUTH_MISSING`
- API key present: `false`

## Workflow

- Status: `UNKNOWN`
- Expected name: `Spec Kit OpenCode Proxmox Runner Orchestrator`
- ID: ``
- Active: `false`

## Webhook

- URL status: `LOCAL_ONLY_DERIVED`
- URL type: `production`
- Method: `POST`
- Path: `spec-kit-opencode-proxmox-runner`
- Source: `local_workflow_json`
- URL: `http://192.168.1.52:5678/webhook/spec-kit-opencode-proxmox-runner`

## Credential

- Status: `UNKNOWN`
- Expected name: `Proxmox Docker Host SSH`
- SSH nodes checked: `true`
- Secret values accessed: `false`

## Payload

- Safe: `true`
- dry_run: `true`
- live_dry_hop_only: `true`
- enable_implement: `false`
- enable_taskstoissues: `false`
- enable_converge: `false`

## Local Gates

- `node scripts/build-workflow.mjs` -> Exit `0`
- `node scripts/dry-run-local.mjs` -> Exit `0`
- `node scripts/validate-local.mjs` -> Exit `0`

## Reasons

- N8N_API_KEY is missing, so authenticated workflow and credential evidence could not be collected.
- Workflow import state is not confirmed by authenticated n8n API or UI evidence.
- Exact webhook URL is not confirmed from n8n API or UI evidence.
- SSH credential assignment is not confirmed by API or UI evidence.

