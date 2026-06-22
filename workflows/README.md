# Workflows Directory

n8n workflow JSON exports (credentials scrubbed).

## Files

| File | Source | Status |
|------|--------|--------|
| `debug-minimal-form-ui.export.json` | n8n export 2026-06-22 | Working — 1 node form trigger |
| `blueprint-old-broken.export.json` | Runner `/opt/dev-fabric/workflows/` | Broken V1 — 8 nodes |
| `blueprint-v2.clean.export.json` | To be created | V2 reconstruction |
| `speckit-smoke-workflow.json` | Runner `/opt/dev-fabric/workflows/` | Smoke-test workflow |

## Export Commands

```bash
# Export all workflows
n8n export:workflow --all --output=all-before.json

# Export published only
n8n export:workflow --all --published --output=published-before.json

# Export single workflow by ID
n8n export:workflow --id=<WORKFLOW_ID> --output=single.json
```

## Import Commands

```bash
# Import a workflow
n8n import:workflow --input=workflow.json

# Import and activate
n8n import:workflow --input=workflow.json --active=true
```
