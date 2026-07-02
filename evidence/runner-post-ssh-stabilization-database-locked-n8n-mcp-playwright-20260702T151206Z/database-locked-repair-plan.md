# Database Locked — Repair Plan

## Metadata
- **Date:** 2026-07-02
- **Status:** PLAN ONLY — NO REPAIR EXECUTED

## Diagnosis Summary
The primary suspect is the OpenCode instance on CT 102:
- **Process:** `opencode providers login --provider opencode` (PID 7103, root)
- **Running since:** Jun 28
- **DB:** `/root/.local/share/opencode/opencode.db` (323KB + 1.3MB WAL)
- **Affected DB:** OpenCode internal SQLite database
- **WAL size:** 1.3MB — indicates significant uncommitted/uncheckpointed writes
- **Threads:** 5+ threads all with open DB handles

Secondary note: n8n CT 101 has 10+ worker threads on its 16.5MB SQLite DB with 4MB WAL — normal for n8n's connection pool but could experience transient locks under heavy load.

## Repair Options (NOT EXECUTED)

### Option A — Observe Only
- If "database locked" is transient and not reproducible
- No action needed
- Re-diagnose if error recurs

### Option B — Healthcheck Decoupling
- If an aggressive healthcheck is causing parallel SQLite access
- Review healthcheck scripts for concurrent DB access patterns
- No change without approval

### Option C — Controlled n8n Restart
- Only if n8n DB lock is persistent (not the primary suspect)
- Requires explicit approval
- Pre-restart: backup verification, status check
- No DB file manipulation

### Option D — Runner Process Investigation
- Primary suspect: OpenCode PID 7103 on CT 102
- Process has been running since Jun 28 with a stale provider login session
- If confirmed as lock source: controlled process restart after approval
- No kill without approval

### Option E — SQLite WAL Checkpoint
- WAL files are large (1.3MB on runner, 4MB on n8n)
- This is NORMAL — SQLite auto-checkpoints
- **Do NOT manually delete WAL/SHM files** — catastrophic data loss risk
- Only checkpoint via clean service stop/start if needed

### Option F — Stale Session Cleanup
- The opencode provider login session (PID 7103) has been running since Jun 28
- This may be a stale session that should be cleaned up
- Restart the opencode process cleanly after approval

## Required Approval
Any remediation requires explicit approval:
```
Ich autorisiere eine kontrollierte database-locked Remediation gemäß Plan. Kein DB-Datei-Löschen ohne Backup.
```

## Actions This Run
- [x] Identify active DBs and handles
- [x] Identify suspect process
- [x] Document WAL sizes
- [x] Create repair plan
- [ ] NO repair executed
- [ ] NO processes killed
- [ ] NO DB files modified
- [ ] NO locks deleted
