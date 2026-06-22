# UI Reconstruction Runbook — Blueprint Workflow V2

## Overview

This runbook describes how to reconstruct the Blueprint → SpecKit/OpenCode Bootstrap workflow from the broken V1 state.

## Preconditions

- [ ] n8n service running on container 101
- [ ] SSH access to Proxmox (192.168.1.136) available
- [ ] Debug form (`/form/debug-minimal-form-ui`) returns HTTP 200
- [ ] `dev-runner-ssh` credential present in n8n credential store
- [ ] Backup created before any changes

## Step-by-Step Reconstruction

### 1. Create Backup

```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "BACKUP_DIR=/opt/dev-fabric/n8n/backups/blueprint-clean-reconstruct-\$(date -u +%Y%m%dT%H%M%SZ); mkdir -p \$BACKUP_DIR; cp -a /opt/dev-fabric/n8n/data/.n8n/database.sqlite* \$BACKUP_DIR/; ls -lah \$BACKUP_DIR"'
```

### 2. Create New Workflow in n8n UI

1. Open n8n editor at `http://192.168.1.52:5678`
2. Create new workflow named: `Blueprint → SpecKit/OpenCode Bootstrap V2`
3. Add Form Trigger node with path: `blueprint-speckit-bootstrap-v2`
4. Configure form fields (see `workflows/blueprint-v2.clean.export.json` for reference)
5. Save, then Publish/Activate
6. Verify: `curl -i http://192.168.1.52:5678/form/blueprint-speckit-bootstrap-v2`

### 3. Add Processing Nodes

After initial Form Trigger validation:

1. **Validate + Extract Blueprint** (Code node)
   - Parse file/text input
   - Validate `project_slug` format
   - Generate `run_id`, `project_dir`, `run_dir`
   - Output structured data for downstream nodes

2. **Prepare RUN_INPUT** (Code node)
   - Assemble all form inputs into RUN_INPUT structure
   - Redact sensitive fields

3. **Write RUN_INPUT to Runner** (SSH node)
   - credential: `dev-runner-ssh`
   - target: container 102
   - write RUN_INPUT to project directory

4. **Start Blueprint Bootstrap** (SSH node)
   - Execute `start_blueprint_bootstrap.sh` on runner
   - Pass run_id and project_dir

5. **Wait/Delay** (Wait node)
   - Poll or fixed delay for bootstrap completion

6. **Read Status** (SSH node)
   - Check status.json on runner

7. **Format Result** (Code node)
   - Return structured result to form user

### 4. Validation Checklist

- [ ] Form loads at `/form/blueprint-speckit-bootstrap-v2`
- [ ] File upload accepts `.md`, `.markdown`, `.txt`
- [ ] Textarea input accepted when no file
- [ ] All dropdown options render
- [ ] SSH connections succeed
- [ ] Evidence written to runner at `/opt/dev-fabric/evidence/blueprint-bootstrap/<project_slug>/`
- [ ] RUN_INPUT.redacted.json present in evidence
- [ ] No credentials or secrets in workflow JSON

### 5. Export and Archive

```bash
n8n export:workflow --all --published --output=published-after-v2.json
```

Copy V2 workflow to Git repo:
```bash
cp published-after-v2.json workflows/blueprint-v2.clean.export.json
```

### 6. Optional Path Switch (requires new approval)

```text
Do NOT perform automatically:
1. Unpublish old broken workflow
2. Change V2 form path to `blueprint-speckit-bootstrap`
3. Publish V2 on old path
```
