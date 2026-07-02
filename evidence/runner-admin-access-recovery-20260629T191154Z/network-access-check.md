# Network & Port Access Check

## Metadata
- **UTC:** 2026-06-29T19:11:54Z
- **Local Host:** xxammaxx-desktop (Linux Mint 22.1)

## Ping Results

| Host | IP | Status | Latency (avg) |
|------|-----|--------|---------------|
| Runner | 192.168.1.53 | ✅ Reachable | 1.70 ms |
| Proxmox | 192.168.1.136 | ✅ Reachable | 1.30 ms |
| n8n | 192.168.1.52 | ✅ Reachable | 2.15 ms |

## Port Scan Results

| Host | IP | Port | Service | Status |
|------|-----|------|---------|--------|
| Runner SSH | 192.168.1.53 | 22 | SSH | ✅ Open |
| Proxmox SSH | 192.168.1.136 | 22 | SSH | ✅ Open |
| Proxmox Web/API | 192.168.1.136 | 8006 | HTTP/API | ✅ Open |
| n8n API | 192.168.1.52 | 5678 | HTTP | ✅ Open |

## Summary

- **Runner SSH Port 22:** Reachable ✅
- **Proxmox SSH Port 22:** Reachable ✅
- **Proxmox Web/API Port 8006:** Reachable ✅
- **n8n Port 5678:** Reachable ✅

All network-layer checks passed. The SSH authorization issue is at the application layer, not the network layer.

## Secret Hygiene
- No secrets output
- No passwords output
- No private keys output
