# Live Dry Hop Report

## Outcome

- Executed: `no`
- Classification: `TOOL_GAP`

## Why It Was Not Executed

The repository proves only the importable workflow artifact and the payload examples. It does not prove all live prerequisites:

- no evidence that the workflow is already imported into a running n8n instance
- no evidence that the n8n credential `Proxmox Docker Host SSH` is configured
- no concrete webhook URL is present; only the workflow id/path `spec-kit-opencode-proxmox-runner` is stored

Because these conditions were not met, no SSH call, no Docker call, and no remote canary write were attempted.

## What Was Verified Instead

- local workflow rebuild succeeded
- local dry-run validation succeeded
- local validation succeeded
- the workflow now supports `dry_run=true` and `live_dry_hop_only=true`
- the runner pipeline now returns machine-readable `DOCKER_UNREACHABLE`, `RUNNER_CONTAINER_NOT_FOUND`, `WORKSPACE_NOT_FOUND`, and `MISSING_TOOL` outcomes
- the live dry-hop path blocks Spec Kit, GitHub issue creation, and implementation steps

## Next Manual Action

1. Import `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json` into the target n8n instance.
2. Set the SSH credential `Proxmox Docker Host SSH` in n8n.
3. Determine the concrete webhook URL for the imported workflow.
4. Send `examples/live-dry-hop-payload.example.json` to that webhook.
5. Save the returned JSON as `evidence/live-dry-hop-response.json`.
