# Runner Profile Files Structural Check

## Files Checked

| File | Lines | Status |
|------|-------|--------|
| `/home/runner/.profile` | 27 | STANDARD (default Debian) |
| `/home/runner/.bashrc` | 113 | STANDARD (default Debian) |
| `/home/runner/.bash_profile` | - | MISSING |
| `/home/runner/.bash_login` | - | MISSING |
| `/home/runner/.bash_aliases` | - | MISSING |
| `/etc/profile` | - | STANDARD |
| `/etc/bash.bashrc` | - | STANDARD |
| `/etc/profile.d/` | 1 file | bash_completion.sh (standard) |

## Assessment: PROFILE_SAFE

The runner's profile files are completely standard default Debian/Ubuntu files. No suspicious interactive commands, no blocking operations, no secret-like values.

## ROOT CAUSE: NOT PROFILE-RELATED

The `su - runner` hang is caused by **systemd-logind failure**, not by profile files.

### Evidence Chain
1. `su - runner` hangs (all variants: login, non-login, different shells)
2. `runuser -u runner` works immediately (bypasses PAM session)
3. `systemd-logind.service` is FAILED (exit-code, status=226/NAMESPACE)
4. PAM `common-session` includes `pam_systemd.so`
5. PAM `runuser` config does NOT include `pam_systemd.so`

### Root Cause
`pam_systemd.so` in the PAM session stack tries to register the session with `systemd-logind`. Since `systemd-logind` has crashed, this registration call hangs, causing `su` to block indefinitely.

## Status
**PROFILE_SAFE** — the profile files are not the problem.
