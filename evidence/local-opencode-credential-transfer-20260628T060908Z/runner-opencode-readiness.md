# Runner OpenCode Readiness — Evidence

## Remote Checks (non-destructive, no provider calls)

| Tool | Path | Version | Status |
|------|------|---------|--------|
| OpenCode | /opt/dev-fabric/opencode/opencode | 1.17.9 | ✅ |
| Node.js | (PATH) | v22.23.0 | ✅ |
| Git | (PATH) | 2.39.5 | ✅ |
| Bash | (PATH) | 5.2.15 | ✅ |

## Runner Components

| Component | Path | Status |
|-----------|------|--------|
| Loader Script | /opt/dev-fabric/bin/load-opencode-provider-env.sh | ✅ present |
| Smoke Test | /opt/dev-fabric/bin/opencode-provider-smoke-test.sh | ✅ present |
| Secrets Dir | /opt/dev-fabric/secrets/ | ✅ exists |
| Credential File | /opt/dev-fabric/secrets/opencode-provider.env | ✅ exists |

## Container Info
- **Runner**: lxc-dev-runner (Container 102)
- **Proxmox Host**: 192.168.1.136
- **Status**: running
- **RootFS**: accessible via /var/lib/lxc/102/rootfs

## Readiness Assessment
**Infrastructure ready**: All required tools and scripts are present and functional on the runner. The runner is ready to accept real OpenCode credentials when they become available.
