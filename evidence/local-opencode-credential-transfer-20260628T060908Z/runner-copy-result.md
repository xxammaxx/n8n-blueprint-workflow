# Runner Copy Result — Evidence

## Copy Execution
- **Timestamp**: 2026-06-28T06:15:30Z
- **Mode**: VerifyOnly (no actual copy)
- **Script**: `scripts/copy-opencode-provider-credentials.ps1 -VerifyOnly`

## VerifyOnly Results

### Local Check
| Check | Result |
|-------|--------|
| Local file exists | yes |
| Required keys present | 6 of 6 |
| Real credential values | 0 of 3 credential keys (all PASTE_* placeholders) |
| Safety default values | 3 of 3 (real) |

### Proxmox Connectivity
| Check | Result |
|-------|--------|
| Proxmox Host (192.168.1.136) reachable | yes |
| SSH authentication | OK |

### Container Status
| Check | Result |
|-------|--------|
| Container 102 status | running |
| RootFS accessible | yes |
| Target directory (/opt/dev-fabric/secrets/) | exists |

## Real Copy Status
- **Copy executed**: no (blocked by placeholder detection)
- **Reason**: All three credential values are PASTE_* placeholders
- **No real credentials to transfer**

## Remote State (pre-existing)
| Check | Result |
|-------|--------|
| Remote file exists | yes (/opt/dev-fabric/secrets/opencode-provider.env) |
| Remote file content | not inspected (security policy) |

## Conclusion
VerifyOnly passed — infrastructure is ready for transfer when real credentials are provided. Currently no real credentials available locally.
