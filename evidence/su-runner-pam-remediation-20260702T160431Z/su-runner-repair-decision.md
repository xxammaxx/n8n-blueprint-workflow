# su-runner Repair Decision

## Date/UTC: 2026-07-02T16:04:31Z

## Root Cause Summary

`pam_systemd.so` in `/etc/pam.d/common-session` and `/etc/pam.d/runuser-l` hangs when trying to register a session with `systemd-logind` via D-Bus. The container's systemd is in "degraded" state and logind is not fully functional — a well-known LXC limitation.

## Evidence Chain

| Phase | Finding | Confidence |
|-------|---------|------------|
| Phase 2 | Both `su -` and `su` hang (exit 124) | HIGH |
| Phase 3 | `runuser -u` works, `runuser -l` hangs | HIGH |
| Phase 4 | User account, shell, home all valid | HIGH |
| Phase 5 | No blocking profile scripts | HIGH |
| Phase 6 | `pam_systemd.so` in common-session, systemd degraded | HIGH |

## Decision: C — PAM_SYSTEMD_REPAIR_RECOMMENDED

### Rationale
- Root cause is unambiguous
- Repair is minimal (comment out one line in two files)
- No side effects in LXC container (no logind sessions needed)
- User has explicitly authorized minimal PAM repair
- `runuser -u` workaround already exists but fixing `su` is better for interactive use

### Repair Plan

#### File 1: `/etc/pam.d/common-session`
- **Backup:** Copy to `/etc/pam.d/common-session.bak-20260702T160431Z`
- **Change:** Comment out `session optional pam_systemd.so`
- **Effect:** Fixes `su` and `su -`

#### File 2: `/etc/pam.d/runuser-l`
- **Backup:** Copy to `/etc/pam.d/runuser-l.bak-20260702T160431Z`
- **Change:** Comment out `-session optional pam_systemd.so`
- **Effect:** Fixes `runuser -l`

### Safety Assessment
- `pam_systemd.so` is `optional` — removing it cannot break authentication
- Container already degrades systemd — no session management needed
- Standard fix documented in LXC/PVE community
- Backups created before any change
- Changes are trivially reversible

### Alternative Considered

**Option A (NO_REPAIR_USE_RUNUSER_WORKAROUND):** Rejected because root cause is clear, repair is minimal, and authorization is given. The workaround is available as fallback.

**Option B (PROFILE_REPAIR):** Not applicable — profiles are clean.

**Option D (SHELL_OR_ACCOUNT_REPAIR):** Not applicable — account is valid.

**Option E (UNKNOWN_NO_REPAIR):** Not applicable — root cause is confirmed.

## Authorization Status

**REPAIR AUTHORIZED:** User provided explicit authorization for minimal PAM repair with clear root cause and backup requirement. All conditions met.

## Secrets: None exposed
