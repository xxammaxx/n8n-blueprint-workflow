# su-runner PAM Remediation — Repair Application

## Date/UTC: 2026-07-02T16:08:00Z

## Repair Authorization: YES (user explicitly authorized)

## Repair Applied: YES

### What Was Changed

#### File 1: `/etc/pam.d/common-session` (CT 102)
- **Backup:** `/etc/pam.d/common-session.bak-20260702T160431Z`
- **Change:** Line 24 — `session optional pam_systemd.so` → `#session optional pam_systemd.so  # DISABLED: hangs in LXC (degraded logind)`
- **Reason:** `pam_systemd.so` tries to register session with `systemd-logind` via D-Bus, which hangs in LXC with degraded systemd

#### File 2: `/etc/pam.d/runuser-l` (CT 102)
- **Backup:** `/etc/pam.d/runuser-l.bak-20260702T160431Z`
- **Change:** Line 4 — `-session optional pam_systemd.so` → `#-session optional pam_systemd.so  # DISABLED: hangs in LXC (degraded logind)`
- **Reason:** Same D-Bus hang issue via `runuser-l`

### Restoration (if needed)
```bash
# On Proxmox Host:
pct exec 102 -- cp /etc/pam.d/common-session.bak-20260702T160431Z /etc/pam.d/common-session
pct exec 102 -- cp /etc/pam.d/runuser-l.bak-20260702T160431Z /etc/pam.d/runuser-l
```

### No Secrets Exposed
