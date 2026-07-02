# Runner Container/VM Identification

## Metadata
- **UTC:** 2026-06-29T19:11:54Z
- **Proxmox Host:** pve (192.168.1.136)

## Identification Results

| Field | Value |
|-------|-------|
| **Runner Type** | LXC Container |
| **CTID** | 102 |
| **Name** | lxc-dev-runner |
| **Hostname** | lxc-dev-runner |
| **IP** | 192.168.1.53 |
| **Status** | running |
| **Lock** | mounted |

## Confirmed

- [x] Runner is a CT (container)
- [x] CTID: 102
- [x] Hostname: lxc-dev-runner
- [x] IP 192.168.1.53 confirmed: Yes ✅

## Additional Infrastructure Map

| CTID | Name | IP | Role |
|------|------|-----|------|
| 101 | lxc-n8n-local | 192.168.1.52 | n8n |
| 102 | lxc-dev-runner | 192.168.1.53 | Runner (TARGET) |
| 103 | pihole | 192.168.1.171 | DNS/AdBlock |
| 105 | heimdall-dashboard | 192.168.1.222 | Dashboard |
| 107 | docvault-ai | 192.168.1.160 | DocVault |
| 110 | paperless-ai | 192.168.1.46 | Paperless AI |
| 120 | positron-dev | — | Stopped |
| 122 | paperless-ngx | 192.168.1.231 | Paperless NGX |

## Secret Hygiene
- No secrets output
- No passwords output
