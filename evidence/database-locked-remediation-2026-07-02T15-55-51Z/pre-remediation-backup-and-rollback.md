# Pre-Remediation Backup and Rollback Plan

**Timestamp (UTC):** 2026-07-02T15:55:51Z

## Affected Resources

### Process
| Detail | Value |
|--------|-------|
| PID | 7103 |
| Process | `/opt/dev-fabric/opencode/opencode providers login --provider opencode` |
| Location | CT 102 (lxc-dev-runner) |
| Status | Stale/orphaned since Jun28 |
| User | root |

### Database Files (CT 102)
| File | Size |
|------|------|
| `/root/.local/share/opencode/opencode.db` | 323,584 bytes |
| `/root/.local/share/opencode/opencode.db-wal` | 1,314,312 bytes |
| `/root/.local/share/opencode/opencode.db-shm` | 32,768 bytes |

## Metadata Backup (executed)
- Process list captured via `ps aux`
- DB file metadata captured via `find -printf`
- No DB content read — privacy preserved

## DB Content Access
- **DB content read:** NO — metadata only
- **DB files copied:** NO
- **WAL/SHM touched:** NO

## Planned Remediation
1. Send SIGTERM to PID 7103
2. Wait 5 seconds
3. Check if process terminated
4. No SIGKILL under any circumstances
5. No CT restart

## Rollback
- No file changes planned
- Only process termination (SIGTERM)
- SQLite will handle WAL checkpointing on clean shutdown (if process responds to SIGTERM)
- If SIGTERM fails to stop the process: document and stop (no further action)
- CT remains unchanged in all scenarios

## Pre-Remediation Evidence

### CT 102 State (captured)
```
PID 7103: /opt/dev-fabric/opencode/opencode providers login --provider opencode
STATE: S (sleeping)
START: Jun28
CPU: 31:43
PID 7103 THREADS: 7104, 7106, 7109, 7110, 7111
DB: /root/.local/share/opencode/opencode.db (316 KiB)
WAL: /root/.local/share/opencode/opencode.db-wal (1.3 MiB)
SHM: /root/.local/share/opencode/opencode.db-shm (32 KiB)
```
