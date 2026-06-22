# Troubleshooting Guide

## Symptom: Form returns HTTP 404 / "Problem loading form"

### Check n8n service
```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "systemctl status n8n --no-pager"'
```

### Check workflow activation
Look for "No webhook path could be found" in n8n logs:
```bash
ssh root@192.168.1.136 'pct exec 101 -- bash -lc "journalctl -u n8n --no-pager | grep -i webhook"'
```

### Verify workflow is published
```bash
n8n export:workflow --all --published
```
The workflow should appear in the export output.

### Common root cause: workflow_published_version = 0
Even after successful publish, some workflows get stuck with `workflow_published_version = 0`.
This prevents webhook registration.

**Workaround:** Create a NEW workflow with a NEW form path. Do not attempt to repair the broken one.

## Symptom: SSH node fails

### Check SSH credential
Verify `dev-runner-ssh` credential exists in n8n credential store and is not expired.

### Test SSH manually
```bash
ssh -i /path/to/key runner@192.168.1.136 -p 22
```

### Check runner container
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "whoami; hostname"'
```

## Symptom: Code node error

### Check node logs
In n8n UI, open the failed execution and inspect the Code node output.

### Common issues
- File not parsed correctly (check mimetype)
- Blueprint text empty when file missing (add validation)
- Invalid project_slug (must match `^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$`)
- Template file not found on runner

## Symptom: Runner script fails

### Check runner logs
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "find /opt/dev-fabric/evidence -name commands.log -exec tail -50 {} \;"'
```

### Check disk space
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "df -h /opt"'
```

### Check permissions
```bash
ssh root@192.168.1.136 'pct exec 102 -- bash -lc "ls -lah /opt/dev-fabric/scripts/"'
```
