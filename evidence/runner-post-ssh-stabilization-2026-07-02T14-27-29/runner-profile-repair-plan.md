# Runner Profile / su Hang Repair Plan

## Status: PROFILE_REPAIR_REQUIRES_REVIEW

## Root Cause
**NOT profile-related.** The `su - runner` hang is caused by:
1. `systemd-logind.service` is FAILED (status=226/NAMESPACE) in CT 102
2. PAM `common-session` includes `pam_systemd.so`
3. Any `su` call (even non-login `su runner`) triggers a PAM session
4. `pam_systemd.so` tries to register session with dead logind → hangs indefinitely

## Recommended Repair Plan (requires approval, NOT executed in this run)

### Option A: Restart systemd-logind (preferred, least invasive)
```bash
pct exec 102 -- systemctl restart systemd-logind
pct exec 102 -- systemctl status systemd-logind
```
Then verify: `pct exec 102 -- su - runner -c "echo OK"`

### Option B: Remove pam_systemd.so from su session (workaround)
Edit `/etc/pam.d/su` on CT 102, comment out or remove:
```
session    optional    pam_systemd.so
```
This is referenced via `@include common-session`.

### Option C: Use runuser for admin tasks (permanent workaround)
`runuser -u runner <command>` works without PAM and is sufficient for most admin needs.

## Prerequisites for Any Repair
1. Explicit user approval required
2. Backup of any modified PAM config
3. Re-verify `su - runner` after change
4. Document change in audit trail

## Current Workaround (available now)
- SSH directly as runner: `ssh runner@192.168.1.53`
- Use `runuser -u runner` for root-initiated commands in CT 102
- Avoid `su` command entirely until logind is restored

## Status
**PROFILE_REPAIR_PLAN_READY** (but repair targets systemd-logind, not profiles)
