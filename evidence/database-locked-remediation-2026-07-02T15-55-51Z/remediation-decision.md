# Remediation Decision

**Timestamp (UTC):** 2026-07-02T15:55:51Z

## Selected Option: B — SOFT_STOP_STALE_OPENCODE_PROCESS

## Rationale

### Evidence Supporting Option B
1. **PID 7103 confirmed stale**: Running since Jun28 (4 days) — a `providers login` command should complete in seconds
2. **Orphaned**: PPID=0, no parent to manage it
3. **No TTY**: Not attached to any terminal
4. **No tmux session**: Not running in any tmux window
5. **CPU time mismatch**: Only 31 minutes of CPU over 4 days of wall time → process is sleeping/idle, not doing work
6. **DB handles confirmed**: lsof shows PID 7103 (and all its threads) holding open handles to opencode.db, .db-wal, .db-shm
7. **Large WAL**: 1.3 MB un-checkpointed WAL — the source of the lock

### Why NOT Other Options
| Option | Reason Rejected |
|--------|-----------------|
| A (NO_ACTION) | Lock confirmed; action needed |
| C (TMUX_REVIEW) | No tmux session detected |
| D (N8N_SUSPECTED) | n8n on CT 101 has its own separate DB; no cross-CT lock conflict |
| E (UNKNOWN) | Cause is clearly identified |

## Action Plan
1. Send SIGTERM to PID 7103 on CT 102
2. Wait 5 seconds for clean shutdown
3. Check if process terminated
4. If still running: document — STOP HERE (no SIGKILL)
5. Post-remediation DB check
6. Validate DB lock is resolved

## Risk Assessment
- **Risk level**: LOW
- SQLite is crash-safe by design; SIGTERM allows clean WAL checkpoint
- No SIGKILL → no risk of DB corruption
- The `providers login` process has no state worth preserving after 4 days of being stale
- OpenCode can be re-run at any time
