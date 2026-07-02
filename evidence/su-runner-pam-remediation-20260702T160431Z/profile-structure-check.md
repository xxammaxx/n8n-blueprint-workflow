# Profile Structure Check

## Date/UTC: 2026-07-02T16:04:31Z

## Profile Files Scanned

| File | Exists | Lines | Suspicious |
|------|--------|-------|------------|
| `/home/runner/.profile` | YES | 27 | No |
| `/home/runner/.bashrc` | YES | 113 | No |
| `/home/runner/.bash_profile` | NO | — | — |
| `/home/runner/.bash_login` | NO | — | — |
| `/etc/profile` | YES | 34 | No |
| `/etc/bash.bashrc` | YES | 58 | No |

## Suspicious Pattern Check

Searched for: `read `, `sleep `, `tail -f`, `while true`, `tmux`, `opencode`, `n8n`, `curl`, `wget`, `source `, `. `, `systemctl`, `loginctl`, `dbus`, `keychain`, `ssh-agent`

### /home/runner/.profile
```
Line 2:  # This file is not read by bash(1), if ~/.bash_profile or ~/.bash_login
Line 15: . "$HOME/.bashrc"
```
Both are standard — comment and bashrc sourcing. Not blocking.

### /home/runner/.bashrc
```
Line 51:  # (ISO/IEC-6429). (Lack of such support is extremely rare, and such
Line 101: . ~/.bash_aliases
Line 109: . /usr/share/bash-completion/bash_completion
Line 111: . /etc/bash_completion
```
Comment and standard source lines. Not blocking.

### /etc/profile
```
Line 16: . /etc/bash.bashrc
Line 30: . $i
```
Standard sourcing. Not blocking.

### /etc/bash.bashrc
```
Line 37: #    . /usr/share/bash-completion/bash_completion
Line 39: #    . /etc/bash_completion
```
Commented-out completion. Not blocking.

## Assessment

**No blocking lines found in any profile.** No `read`, `sleep`, `tail -f`, `while true`, interactive prompts, or network-dependent operations.

## Status: PROFILE_SAFE

The `su` hang is NOT caused by shell profile scripts. The profiles are standard Debian/Ubuntu defaults.

## Secrets: None exposed
