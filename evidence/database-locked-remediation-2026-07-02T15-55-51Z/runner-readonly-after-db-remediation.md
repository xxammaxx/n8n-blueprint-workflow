# Runner Read-Only Check After DB Remediation

**Timestamp (UTC):** 2026-07-02T15:55:51Z

## Direct SSH to runner@192.168.1.53
- **Result:** TIMEOUT (15s)
- **Status:** KNOWN ISSUE — `su - runner` hängt, vermutlich PAM/systemd-containerbedingt

## CT 102 Access via pct exec
- **Result:** GREEN ✅
- **Access:** root@192.168.1.136 → pct exec 102 → shell

## Runner Status Summary
| Check | Status |
|-------|--------|
| CT 102 running | GREEN |
| Direct SSH | TIMEOUT (known issue) |
| pct exec access | GREEN |
| PID 7103 (stale opencode) | STOPPED |
| Open DB handles | NONE (released) |

## Open Issue
- `su - runner` / PAM issue remains — not addressed in this remediation
- Workaround: use `pct exec` from Proxmox or `runuser` on CT 102
