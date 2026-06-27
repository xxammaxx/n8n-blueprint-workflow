# Workflow JSON Validation Before Import

**Generated:** 2026-06-26T09:43:30Z  
**Phase:** 3 — Workflow-JSON vor Import prüfen  
**Agent:** issue-orchestrator  

## File

`C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`  
(61749 Bytes, last modified 2026-06-26 09:33:55)

## Validation Results

| Check | Result | Notes |
|---|---|---|
| Valid JSON | ✅ PASS | Parse success |
| Workflow name matches expected | ✅ PASS | `Spec Kit OpenCode Proxmox Runner Orchestrator` |
| Webhook node present | ✅ PASS | `Webhook Trigger` (n8n-nodes-base.webhook) |
| Webhook method | ✅ PASS | `POST` |
| Webhook path | ✅ PASS | `spec-kit-opencode-proxmox-runner` |
| Response mode | ✅ PASS | `responseNode` |
| Respond-to-Webhook node present | ✅ PASS | `Respond To Webhook` (typeVersion 1.1) |
| SSH nodes present | ✅ PASS | 2 nodes: `SSH Proxmox Preflight`, `SSH Runner Execute` |
| Credential reference in JSON | ℹ️ Empty | n8n stores credentials separately; no inline credential refs in export JSON |
| Credentials visible in JSON | ✅ PASS | `false` — no embedded credentials |

## Nodes in Workflow

| # | Name | Type | Purpose |
|---|---|---|---|
| 1 | Webhook Trigger | n8n-nodes-base.webhook | POST /spec-kit-opencode-proxmox-runner |
| 2 | Normalize Input | n8n-nodes-base.set | Normalize incoming webhook payload |
| 3 | Validate And Prepare | n8n-nodes-base.code | Build SSH commands, validate payload, base64-encode scripts |
| 4 | Needs Proxmox Preflight | n8n-nodes-base.if | Conditional: skip preflight if final_response exists |
| 5 | SSH Proxmox Preflight | n8n-nodes-base.ssh | Run preflight on Proxmox host |
| 6 | Evaluate Preflight | n8n-nodes-base.code | Parse/output preflight results |
| 7 | Should Execute Runner | n8n-nodes-base.if | Conditional: execute runner or skip |
| 8 | SSH Runner Execute | n8n-nodes-base.ssh | Execute runner script in Docker container |
| 9 | Result Parser | n8n-nodes-base.code | Parse runner output, redact secrets |
| 10 | Respond To Webhook | n8n-nodes-base.respondToWebhook | Return JSON response |

## Security Checks

| Check | Result | Detail |
|---|---|---|
| Secret-like content found | ✅ PASS | None found in raw JSON |
| Destructive patterns | ✅ PASS | False positive only — `docker.*rm` and `rm.*rf` patterns are part of grep/redact logic in Code nodes |
| API keys in JSON | ✅ PASS | None found |
| SSH keys in JSON | ✅ PASS | None found |
| Passwords in JSON | ✅ PASS | None found |
| Auto-build commands | ✅ PASS | No `/speckit.implement` or `/speckit.taskstoissues` in Dry-Hop path |
| GitHub issue creation | ✅ PASS | No issue creation commands in workflow |
| Proxmox/Docker destructive ops | ✅ PASS | No destroy/delete/format commands in execution path |

## SSH Node Details

| Node | Type | Credential | Command |
|---|---|---|---|
| SSH Proxmox Preflight | ssh | (stored in n8n, expected: `Proxmox Docker Host SSH`) | Builds preflight script, runs on 192.168.1.136 |
| SSH Runner Execute | ssh | (stored in n8n, expected: `Proxmox Docker Host SSH`) | `docker exec n8n-runners /bin/sh -c "<base64>"` |

## Flow Diagram

```
POST /spec-kit-opencode-proxmox-runner
  → Normalize Input (set node)
    → Validate And Prepare (code: build SSH commands)
      → Needs Proxmox Preflight? (if)
        → YES → SSH Proxmox Preflight → Evaluate Preflight
          → Should Execute Runner? (if)
            → YES → SSH Runner Execute
            → NO → Result Parser
        → NO → Result Parser
      → Respond To Webhook
```

## Entscheidung

- Workflow-JSON: **VALIDE UND SICHER**
- Keine Secrets im JSON
- Keine destruktiven Befehle
- Alle erwarteten Nodes vorhanden
- **Workflow kann importiert werden**
- ⚠️ Credential `Proxmox Docker Host SSH` muss in n8n vor Aktivierung zugeordnet werden
