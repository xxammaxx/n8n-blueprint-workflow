# Entrypoint Stable Final Gates

- `node scripts/build-workflow.mjs` -> exit `0`
  - Output: `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`
- `node scripts/dry-run-local.mjs` -> exit `0`
  - Result: `ok=true`
- `node scripts/validate-local.mjs` -> exit `0`
  - Output: `Local validation passed.`
- `node scripts/test-scanner-entrypoints.mjs` -> exit `0`
  - Result: `ENTRYPOINTS_INCONSISTENT`

Final gate interpretation:

- Local artifact gates stayed green.
- Entrypoint consistency stayed unresolved in the direct `node scripts/*.mjs` path.
- Live POST remained blocked.
