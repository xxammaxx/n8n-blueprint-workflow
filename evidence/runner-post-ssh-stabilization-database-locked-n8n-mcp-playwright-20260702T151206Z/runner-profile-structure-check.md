# Runner Profile Structure Check

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z

## Profile Files

| File | Exists | Lines |
|------|--------|-------|
| `/home/runner/.profile` | yes | 27 |
| `/home/runner/.bashrc` | yes | 113 |
| `/home/runner/.bash_profile` | no | — |
| `/home/runner/.bash_login` | no | — |
| `/home/runner/.bash_aliases` | no | — |

## .profile Analysis
- Standard Debian/Ubuntu default `.profile`
- Sources `.bashrc` on line 15
- Standard PATH setup
- **No suspicious commands:** no `read`, `sleep`, `tail -f`, `while true`, `ssh`, `tmux`, `opencode`, `n8n`, `curl`, `wget`
- **Rating: PROFILE_SAFE**

## .bashrc Analysis
- Standard Debian/Ubuntu `.bashrc` (113 lines)
- Sources `.bash_aliases` on line 101 (but file does NOT exist)
- Sources `/usr/share/bash-completion/bash_completion` on line 109
- Standard aliases and prompt configuration
- **No suspicious commands detected**
- **Rating: PROFILE_SAFE**

## Summary
- Both `.profile` and `.bashrc` are vanilla Debian/Ubuntu defaults
- No interactive or blocking commands found
- `su - runner` hang is NOT caused by profile content
- The hang must be caused by something else (PAM, systemd user session, `su` binary issue, or filesystem condition)

## Status
- **PROFILE_SAFE** — no suspicious interactive commands
- **NO_PROFILE_REPAIR_NEEDED** — profiles are clean
- Root cause of `su - runner` hang is NOT in profile files

## Secrets
- None exposed
