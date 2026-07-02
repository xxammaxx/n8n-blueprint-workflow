# PAM / systemd Diagnosis

## Date/UTC: 2026-07-02T16:04:31Z

## Root Cause Identified

### The Smoking Gun: `pam_systemd.so`

The hang is caused by `pam_systemd.so` in the PAM session stack. When `su`, `su -`, or `runuser -l` open a PAM session, `pam_systemd.so` attempts to register the session with `systemd-logind` via D-Bus. In this LXC container, logind is not fully functional (systemd is in "degraded" state, `loginctl` unavailable), causing the D-Bus call to hang indefinitely.

### PAM Config Chain Analysis

```
su ──@include common-session──► common-session ──► session optional pam_systemd.so  ◄── HANGS
su -l ──same as above─────────────────────────────────────────────────────────────────►  HANGS
runuser-l ──► -session optional pam_systemd.so ───────────────────────────────────────►  HANGS
runuser ──► NO pam_systemd.so ────────────────────────────────────────────────────────►  WORKS
```

### PAM File Details

#### `/etc/pam.d/su`
- `@include common-auth`
- `@include common-account`
- `@include common-session` ← includes pam_systemd.so

#### `/etc/pam.d/runuser` (WORKS)
- `auth sufficient pam_rootok.so`
- `session optional pam_keyinit.so revoke`
- `session required pam_limits.so`
- `session required pam_unix.so`
- **No pam_systemd.so** ← why it works

#### `/etc/pam.d/runuser-l` (HANGS)
- `auth include runuser`
- `session optional pam_keyinit.so force revoke`
- `-session optional pam_systemd.so` ← THE PROBLEM (even with `-` prefix and `optional`)
- `session include runuser`

#### `/etc/pam.d/common-session`
```
session [default=1]   pam_permit.so
session requisite     pam_deny.so
session required      pam_permit.so
session required      pam_unix.so
session optional      pam_systemd.so    ← BLOCKING
```

#### `/etc/pam.d/common-session-noninteractive`
```
session [default=1]   pam_permit.so
session requisite     pam_deny.so
session required      pam_permit.so
session required      pam_unix.so
# NO pam_systemd.so                    ← Clean!
```

### System Status

| Component | Status | Detail |
|-----------|--------|--------|
| systemd | degraded | `systemctl is-system-running` returns "degraded" |
| loginctl | unavailable | Not found in PATH |
| dbus-daemon | running | `/usr/bin/dbus-daemon` process exists |
| /run/dbus/system_bus_socket | exists | D-Bus socket available |
| /run/systemd/container | exists | Confirms this is an LXC container |
| /run/systemd/sessions/ | empty | No registered sessions |

### Why `runuser -u` Works

`runuser` bypasses PAM session registration entirely for the target user — it only does minimal PAM (rootok, limits, unix). No `pam_systemd.so` is invoked.

### Why `su` and `runuser -l` Hang

Both invoke `pam_systemd.so` which tries `CreateSession()` on logind via D-Bus. Even though marked `optional` (and `-` suppressed in runuser-l), the D-Bus synchronous call to an unresponsive logind blocks indefinitely before any error can be returned.

## Status: PAM_SYSTEMD_LXC_SUSPECTED → CONFIRMED

**Root cause confirmed:** `pam_systemd.so` in PAM session stack, combined with degraded systemd-logind in LXC container.

## Secrets: None exposed
