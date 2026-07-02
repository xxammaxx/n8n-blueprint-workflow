# Database Locked — Read-Only Diagnosis

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z

## Phase 6a: Local Repo Search
- **Result:** NO_DATABASE_LOCKED_MESSAGES_IN_REPO (only references in evidence docs)
- **Status:** No code-level database locked errors stored locally

## Phase 6b: Runner CT 102 (192.168.1.53)

### Processes of Interest
| PID | User | Process | Started |
|-----|------|---------|---------|
| 7103 | root | `/opt/dev-fabric/opencode/opencode providers login --provider opencode` | Jun28 |

### OpenCode SQLite Database
- **Main DB:** `/root/.local/share/opencode/opencode.db` — 323,584 bytes
- **WAL:** `/root/.local/share/opencode/opencode.db-wal` — 1,314,312 bytes (~1.3MB)
- **SHM:** `/root/.local/share/opencode/opencode.db-shm` — 32,768 bytes

### Open DB Handles
- **Process PID 7103 (opencode):** Multiple threads (7104, 7106, 7109, 7110, 7111) all holding:
  - FD 14ur (read-only) → opencode.db
  - FD 15u (write) → opencode.db-wal
  - FD 16ur (read-only) → opencode.db-shm
- **Total thread count with DB handles:** 5+ threads
- The WAL file is 1.3MB — indicates significant pending write operations

### No other DB files found
No `.db`, `.sqlite` files under `/opt/dev-fabric` or `/home/runner`

### Assessment
- The OpenCode provider login session (PID 7103, running since Jun 28) holds an active SQLite database with a large WAL
- Multiple threads contending on the same SQLite DB via WAL mode
- This is the most likely source of "database locked" — the OpenCode binary/agent runtime on CT 102

## Phase 6c: n8n CT 101 (192.168.1.52)

### Processes
| PID | User | Process | Started |
|-----|------|---------|---------|
| 7035 | n8n | `node /usr/bin/n8n start` | Jun29 |
| 7048 | n8n | `node ... @n8n/task-runner/dist/start.js` | Jun29 |

### n8n SQLite Database
- **Main DB:** `/opt/dev-fabric/n8n/data/.n8n/database.sqlite` — 16,543,744 bytes (~15.8MB)
- **WAL:** `/opt/dev-fabric/n8n/data/.n8n/database.sqlite-wal` — 4,173,592 bytes (~4MB)
- **SHM:** `/opt/dev-fabric/n8n/data/.n8n/database.sqlite-shm` — 32,768 bytes

### Other n8n DBs
- `/root/.n8n/database.sqlite` — 1,585,152 bytes
- `/opt/dev-fabric/n8n/.n8n/database.sqlite` — 1,540,096 bytes
- Multiple backups (~1.6MB each)

### Open DB Handles
- Process 7035 with 10+ worker threads (DelayedTask, libuv-worker, node) all holding handles
- This is normal for n8n's connection pool model
- The WAL file is 4MB — normal for actively used n8n

### Assessment
- n8n DB handles are expected behavior (connection pooling/multi-threaded)
- No indication of abnormal locking on CT 101
- However, high WAL size + many threads could cause transient locks during heavy operations

## CT Status
| CT ID | Name | Status | Lock |
|-------|------|--------|------|
| 101 | lxc-n8n-local | running | — |
| 102 | lxc-dev-runner | running | **mounted** |
| 103 | pihole | running | — |
| 105 | heimdall-dashboard | running | — |
| 107 | docvault-ai | running | — |
| 110 | paperless-ai | running | — |
| 120 | positron-dev | stopped | — |
| 122 | paperless-ngx | running | — |

**NOTE:** CT 102 shows "mounted" lock status — this is likely from the Proxmox backup process.

## Final Assessment

| Finding | Status |
|---------|--------|
| Local repo "database locked" | NOT FOUND (code-free) |
| Runner CT 102 OpenCode DB | **SUSPECTED** — active WAL with multi-thread contention |
| n8n CT 101 DB | Normal operation, but large WAL |
| Source Identified | **DATABASE_LOCK_RUNNER_CT102_SUSPECTED** |
| n8n CT 101 Suspected | SECONDARY — normal multi-thread operation |

### Primary Suspect
The OpenCode instance on CT 102 (PID 7103, running since Jun 28 as `opencode providers login --provider opencode`) with:
- Large WAL (1.3MB — uncommitted writes)
- 5+ threads contending on same DB
- Running as root (not runner)
- Potential conflict if multiple OpenCode sessions or health checks try to access simultaneously

## Actions
- [ ] NO database files modified
- [ ] NO locks deleted
- [ ] NO processes killed
- [ ] NO restarts
- [x] Diagnosis complete
