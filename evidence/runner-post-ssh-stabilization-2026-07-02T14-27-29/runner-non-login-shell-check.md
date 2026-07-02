# Runner Non-Login Shell Check

## Tests Performed

### runuser -u runner (non-login, PAM-independent)
- **Command:** `runuser -u runner whoami`
- **Result:** OK — output: `runner`, exit 0
- **Notes:** Does NOT use PAM session, bypasses systemd-logind

### runuser -u runner -- sh -c "whoami; pwd"
- **Result:** OK — output: `runner /root`, exit 0

### runuser -l runner (login shell)
- **Command:** `runuser -l runner -c "whoami; pwd"`
- **Result:** TIMEOUT (20s) — HANGS
- **Notes:** `-l` flag triggers full PAM session including pam_systemd.so

## Key Findings

| Method | Login? | PAM? | Result |
|--------|--------|------|--------|
| `runuser -u runner` | NO | NO | OK |
| `runuser -l runner` | YES | YES (systemd) | HANG |
| `su - runner` | YES | YES (systemd) | HANG |
| `su runner` | NO | YES (systemd) | HANG |
| SSH as runner | - | SSH-PAM | OK (separate PAM path) |

## Root Cause Isolated

**systemd-logind.service is FAILED** (status=226/NAMESPACE). Any PAM session that includes `pam_systemd.so` hangs because it tries to communicate with the dead logind daemon.

- **Non-login execution works:** via `runuser -u runner` (bypasses systemd PAM)
- **Login execution hangs:** via any path using PAM session with systemd module
- **SSH works:** because SSH uses its own PAM service (`sshd`) which doesn't include `pam_systemd.so` for command execution

## Conclusion
**Login shell problem isolated:** NOT profile-related. Caused by dead systemd-logind + pam_systemd.so interaction.
