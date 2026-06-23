# Security Boundaries — Blueprint Bootstrap Workflow

## Trust Zones

```
Zone 0: User Browser (untrusted)
  ↓ HTTP (internal network only)
Zone 1: n8n Instance (LXC 101)
  ↓ SSH (key-based auth)
Zone 2: Runner (LXC 102)
  ↓ Filesystem
Zone 3: Evidence / Workspace (read-only for n8n)
```

## Credential Flow

```
[dev-runner-ssh credential]
  stored in n8n credential store (encrypted)
       ↓ n8n credential reference
  SSH Node (never exposes key)
       ↓ SSH protocol
  Runner (accepts key-based auth)
```

### NEVER:
- Hardcode private key in workflow JSON
- Export decrypted credential
- Log SSH output containing keys
- Expose port 22 to public internet

## Input Validation Boundaries

| Boundary | Validation |
|----------|------------|
| Form → n8n | n8n built-in validation |
| Code Node | project_slug regex, file type check |
| SSH → Runner | Filesystem path sanitization |
| Runner → Script | Template variable escaping |

## OpenCode Security Profile

| Permission | Policy | Rationale |
|-----------|--------|-----------|
| `*` (default) | ask | No silent operations |
| read, grep, glob | allow | Read-only inspection safe |
| edit | ask | File modifications require approval |
| git push* | deny | No remote writes |
| gh pr create* | deny | No pull requests |
| gh workflow run* | deny | No CI/CD triggers |
| rm -rf * | deny | No destructive operations |
| docker * | deny | No container manipulation |
| webfetch/websearch | ask | External access needs approval |
| task/skill | deny | No subagent delegation |
| external_directory | deny | No filesystem escape |

### OpenCode Safe Defaults
- `share`: disabled (no remote sharing)
- `autoupdate`: false (no automatic updates)
- `mcp`: {} (no MCP servers configured)
- `--yolo`: never (approval always required)
- Provider/Auth: explicitly NOT configured (requires separate approval)

## Audit Trail

See `evidence-index/` for known evidence paths and `evidence-index/latest.md` for current session report.

## Network Isolation

- n8n (192.168.1.52:5678) — internal only
- Runner (container 102) — internal only
- Proxmox (192.168.1.136) — management interface
- No DMZ, no public exposure
