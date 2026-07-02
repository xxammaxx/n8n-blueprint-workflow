# Runner Profile Repair Plan

## Metadata
- **Date:** 2026-07-02
- **Status:** PLAN ONLY — NO REPAIR EXECUTED

## Diagnosis
- `.profile` and `.bashrc` are vanilla Debian/Ubuntu defaults — PROFILE_SAFE
- No interactive or blocking commands detected
- `su - runner` hang is NOT caused by profile content
- Likely cause: PAM/systemd user session issue with `su` binary

## Repair Options (NOT EXECUTED)

### Option 1 — PAM Investigation
- Check `/etc/pam.d/su` for problematic modules
- Check if `pam_systemd` is causing user session hang
- Requires root access and PAM knowledge

### Option 2 — Workaround Acceptable
- `runuser -u runner` works perfectly as non-login alternative
- SSH as runner works (this uses a different PAM path)
- For most operational needs, these workarounds are sufficient

### Option 3 — Systemd User Service Check
- `su` may trigger systemd `user@1000.service` which could hang
- Check `loginctl` / `systemctl` for runner session status
- This is a container-specific issue (LXC + systemd interaction)

## Status
- **NO_PROFILE_REPAIR_NEEDED** — profiles are clean
- Root cause is NOT in profile files
- Workaround (`runuser`, SSH) is sufficient
- PAM/systemd investigation deferred

## Actions This Run
- [x] Profile files analyzed
- [x] `su` behavior classified
- [x] Workaround identified
- [ ] NO profile changes
- [ ] NO PAM changes
