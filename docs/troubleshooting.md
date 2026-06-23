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

## Symptom: Code node error — `SyntaxError: missing ) after argument list`

### Root cause: Corrupted JS code
The V2 workflow export/import process corrupts single quotes in JavaScript:
```javascript
// WRONG after import:
const crypto = require(''crypto'');  // doubled quotes!
Buffer.from(data, ''base64'').toString(''utf8'');
```

**Fix:** Replace `''word''` with `'word'` in all JS Code nodes. Use the targeted fix script:
```python
text = text.replace("''crypto''", "'crypto'")
text = text.replace("''utf8''", "'utf8'")
text = text.replace("''base64''", "'base64'")
text = text.replace("''hex''", "'hex'")
```

## Symptom: Code node error — `Module 'crypto' is disallowed`

### Root cause: n8n task runner blocks crypto
n8n v2.26.8's JS Task Runner blocks `require('crypto')`. The `crypto` built-in Node.js module is not in the allowed list.

**Fix:** Replace `crypto` calls with pure-JavaScript alternatives:
- Instead of `require('crypto')`: remove the line entirely
- Instead of `crypto.randomBytes(3).toString('hex')`: use `Math.floor(Math.random()*16777216).toString(16).padStart(6,'0')`
- Instead of `crypto.createHash('sha256')...`: use a simple hash via `TextEncoder`

## Symptom: Form submission returns HTTP 200 but all fields are null

### Root cause: curl multipart parsing bug
n8n v2.26.8 Form Trigger V2 does not correctly parse fields from curl's multipart/form-data submissions. The server accepts the request (HTTP 200) but all form field values are `null`.

**Workaround:** Submit through the browser-rendered HTML form at the production URL. Browser-based submissions work correctly.

**Diagnosis:** Check execution data for null field values:
```sql
SELECT data FROM execution_data WHERE executionId=<ID>;
-- Look for: "project_slug":null,"project_title":null,...
```

## Symptom: SSH nodes work but evidence not created — `Permission denied`

### Root cause: Runner user lacks write permissions
The `runner` user on LXC 102 cannot create directories under `/opt/dev-fabric/`.

**Fix:**
```bash
ssh root@192.168.1.136 'pct exec 102 -- chown -R runner:runner /opt/dev-fabric/evidence /opt/dev-fabric/logs /opt/dev-fabric/workspaces'
```

### Check SSH credential
Verify `dev-runner-ssh` credential exists in n8n credential store and is not expired.

### Code node issues
- **Doubled quotes in JS:** See syntax error section above
- **`crypto` module blocked:** See module disallowed section above
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
