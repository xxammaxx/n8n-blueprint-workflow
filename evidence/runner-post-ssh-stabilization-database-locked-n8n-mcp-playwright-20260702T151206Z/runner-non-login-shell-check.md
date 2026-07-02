# Runner Non-Login Shell Check

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z

## Test Results

| Method | Works? | User | PWD | Notes |
|--------|--------|------|-----|-------|
| `su - runner` (login) | NO | — | — | Exit 124 (timeout) |
| `su runner` (no dash) | NO | — | — | Hangs |
| `su -s /bin/sh runner` | NO | — | — | Hangs |
| `runuser -u runner -- bash -c` | **YES** | runner | /root | Works instantly |
| `sudo -u runner` | NO | — | — | `sudo` not installed |

## Key Finding
- **Login shell (`su -`) hangs** — times out after 5 seconds
- **Non-login shell works** via `runuser` — confirms the system/user is operational
- The hang is specific to `su` command, regardless of login/non-login mode
- `sudo` is not installed (minimal container)

## Root Cause Analysis

Since:
1. `.profile` and `.bashrc` are clean (PROFILE_SAFE)
2. `su -` hangs but `runuser -u runner` works
3. All `su` variants hang (with and without `-`)

The likely cause is:
- **PAM configuration issue** — `su` uses PAM, `runuser` does not
- **Systemd user session hang** — `su` may trigger `pam_systemd` which tries to create a user session that blocks
- **Filesystem/lock contention** — `/var/run/utmp` or similar files may be locked

## Workaround
Use `runuser -u runner` for executing commands as the runner user. This bypasses PAM/login and works correctly:
```bash
runuser -u runner -- <command>
```

## Status
- Login-shell problem: **ISOLATED TO `su`/PAM**
- Non-login execution: **FUNCTIONAL**
- Runner usability: **NOT IMPACTED** (SSH works, runuser works)
- Severity: **LOW** — workaround exists

## Secrets
- None exposed
