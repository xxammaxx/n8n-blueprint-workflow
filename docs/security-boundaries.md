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

## Audit Trail

See `evidence-index/` for known evidence paths and `evidence-index/latest.md` for current session report.

## Network Isolation

- n8n (192.168.1.52:5678) — internal only
- Runner (container 102) — internal only
- Proxmox (192.168.1.136) — management interface
- No DMZ, no public exposure
