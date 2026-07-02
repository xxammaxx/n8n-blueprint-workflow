# Database Lock — Current Diagnosis

**Timestamp (UTC):** 2026-07-02T15:55:51Z  
**Status:** DATABASE_LOCK_OPENCODE_PID_SUSPECTED ✅ CONFIRMED

## CT 102 (lxc-dev-runner) — Database Lock Source

### Process Suspect: PID 7103

| Field | Value |
|-------|-------|
| PID | 7103 |
| PPID | 0 (orphaned, init-adopted) |
| Command | `/opt/dev-fabric/opencode/opencode providers login --provider opencode` |
| User | root |
| Started | Jun28 (~4 days ago) |
| CPU Time | 31:43 (minutes:seconds) |
| State | S (sleeping) |
| TTY | none |
| tmux Session | none |

### Open DB Handles (from lsof)

| File | Size | FDs |
|------|------|-----|
| `/root/.local/share/opencode/opencode.db` | 323,584 bytes | fd 14 |
| `/root/.local/share/opencode/opencode.db-wal` | 1,314,312 bytes | fd 15 |
| `/root/.local/share/opencode/opencode.db-shm` | 32,768 bytes | fd 16 |

### Threads Holding DB Handles
- PID 7104 (opencode)
- PID 7106 (HeapHelper)
- PID 7109 (Bun Pool)
- PID 7110 (Bun Pool)
- PID 7111 (HTTP Client)

**All threads share the same DB/WAL/SHM file descriptors.**

### Assessment
- The process is a stale `providers login` command running for 4 days
- It's orphaned (PPID=0)
- No TTY, no tmux session — unattended
- 1.3 MB WAL accumulated — never checkpointed
- **This is the confirmed source of the database locked condition**

## CT 101 (lxc-n8n-local) — n8n Database

| Detail | Value |
|--------|-------|
| n8n PID | 7035 |
| Started | Jun29 |
| DB File | `/opt/dev-fabric/n8n/data/.n8n/database.sqlite` |
| DB Size | 16,543,744 bytes |
| WAL Size | 4,173,592 bytes |
| DB Open | yes (multiple worker threads) |

**n8n has its own separate SQLite database on CT 101. Not conflicting with CT 102 OpenCode DB.**

## Status Decision

**DATABASE_LOCK_OPENCODE_PID_SUSPECTED** — PID 7103 on CT 102 confirmed as the lock source. The `providers login` command has been stale/hung for 4 days, holding the OpenCode SQLite database with a large un-checkpointed WAL.

## Next Step

Proceed to Phase 5: Remediation Decision → Option B: SOFT_STOP_STALE_OPENCODE_PROCESS
