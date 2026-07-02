# Runner User / Shell / Home / Lock Status

## Date/UTC: 2026-07-02T16:04:31Z

## User Identity
```
uid=1000(runner) gid=1000(runner) groups=1000(runner)
```
- User exists, valid UID/GID
- No supplementary groups

## Passwd Entry
```
runner:x:1000:1000::/home/runner:/bin/bash
```
- Shell: /bin/bash
- Home: /home/runner
- No GECOS field (empty)

## Shadow Entry
```
runner:REDACTED_HASH_OR_LOCK
```
- Account exists in shadow
- Hash redacted — no secrets exposed
- Account does NOT appear locked (no `!` or `*` prefix visible in redaction context)

## Shell Check
```
runner_shell=/bin/bash
shell_executable=yes
```
- `/bin/bash` exists and is executable

## Home Directory Permissions
```
drwxr-xr-x 6 runner runner 4096 Jun 23 13:50 /home/runner
```
- Owned by runner:runner
- Permissions: 755 — correct for home directory
- 6 subdirectories/entries exist

## .ssh Directory
```
drwx------ 2 runner runner 4096 Jul  1 08:50 /home/runner/.ssh
```
- Owned by runner:runner
- Permissions: 700 — correct

## Assessment

**Account:** Valid, not locked
**Shell:** Valid, executable, standard /bin/bash
**Home:** Valid permissions, owned correctly
**.ssh:** Valid permissions

**Conclusion:** The user account, shell, and home directory are all correctly configured. The `su` hang is NOT caused by any of these factors. This further implicates PAM/session management as the root cause.

## Status: USER_ACCOUNT_OK

## Secrets: None exposed (shadow hash redacted)
