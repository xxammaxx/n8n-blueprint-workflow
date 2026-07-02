# Runner Read-Only Check After Admin Repair

## Metadata
- **UTC:** 2026-07-01T08:50:53Z
- **Runner CT:** 102 (lxc-dev-runner, 192.168.1.53)
- **Method:** Proxmox `pct exec` (direct SSH via `su - runner` hangs due to .profile)

## System Checks

| Item | Value | Status |
|------|-------|--------|
| Hostname | lxc-dev-runner | ✅ |
| User (runner) | uid=1000, gid=1000 | ✅ |
| Home | /home/runner | ✅ |
| Shell | /bin/bash | ✅ |
| Node.js | v22.23.0 | ✅ |
| npm | 10.9.8 | ✅ |
| Git | 2.39.5 | ✅ |
| OpenCode (direct) | not in PATH | ⚠️ |

## Runner Infrastructure

| Item | Path | Exists |
|------|------|--------|
| Loader Script | /opt/dev-fabric/bin/load-opencode-provider-env.sh | ✅ |
| Secret File | /opt/dev-fabric/secrets/opencode-provider.env | ✅ |
| Dispatch Script | /opt/dev-fabric/scripts/start_github_issue_run.sh | ✅ |
| Evidence Dir | /opt/dev-fabric/evidence | ✅ |

## Notes

1. OpenCode is not directly in PATH — loader script is needed to set up the provider environment.
2. Direct SSH via `su - runner` hangs — likely due to an interactive profile script. Proxmox `pct exec` as root works fine.
3. Secret file exists but was NOT read/dumped — file existence only confirmed.
4. Runner is a standard LXC container with all required infrastructure present.

## Secret Hygiene

- [x] Secret files NOT read or displayed
- [x] No provider keys output
- [x] No private keys output
- [x] File existence check only (read-only)
