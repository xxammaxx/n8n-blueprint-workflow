# su - runner Hang Diagnosis

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z
- **Proxmox Host:** 192.168.1.136
- **CT:** 102 (lxc-dev-runner)

## User Existence
- **passwd entry:** runner:x:1000:1000::/home/runner:/bin/bash
- **id:** uid=1000(runner) gid=1000(runner) groups=1000(runner)
- **Home:** /home/runner (drwxr-xr-x), owned by runner:runner
- **Shell:** /bin/bash

## Home Directory Contents (filenames redacted)
```
.bash_logout (220 bytes)
.bashrc      (3526 bytes)
.cache/
.config/
.local/
.profile     (807 bytes)
.ssh/        (drwx------)
oc.tar.gz    (54MB, owned root:root - NOTE: unusual ownership)
```

## su - runner Test
- **Command:** `su - runner -c "echo SU_LOGIN_OK"` with 5s timeout
- **Exit Code:** 124 (timeout)
- **Status:** **SU_RUNNER_HANG_CONFIRMED**

## Root Cause Hypothesis
The `su -` command loads `.profile` and `.bashrc` as login shell. One of these files likely contains a blocking/interactive command.

## Observations
- `.profile` exists (807 bytes)
- `.bashrc` exists (3526 bytes) — unusually large for a default .bashrc (default Ubuntu/Debian is ~3500 though)
- No `.bash_profile` or `.bash_login`
- `oc.tar.gz` in home directory is owned by root — unusual

## Next Steps
- Phase 4: Structural profile inspection
- Phase 5: Non-login shell test

## Secrets
- None exposed
