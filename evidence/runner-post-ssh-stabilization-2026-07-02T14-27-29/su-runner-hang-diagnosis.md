# su - runner Hang Diagnosis

## Diagnosis via Proxmox (read-only)

### User Identity
- **getent passwd runner:** runner:x:1000:1000::/home/runner:/bin/bash
- **id runner:** uid=1000(runner) gid=1000(runner) groups=1000(runner)
- **Status:** EXISTS, VALID

### Home Directory
- **Path:** /home/runner
- **Permissions:** drwxr-xr-x runner:runner
- **Contents:**
  - .bash_logout
  - .bashrc
  - .cache/
  - .config/
  - .local/
  - .profile
  - .ssh/ (drwx------, owned by runner)
  - oc.tar.gz (54MB, owned by root:root)

### su - runner Test
- **Command:** `timeout 5s su - runner -c "echo SU_LOGIN_OK"`
- **Exit code:** 124 (timeout)
- **SU_LOGIN_OK output:** NOT printed
- **Result:** HANG CONFIRMED

## Status
**SU_RUNNER_HANG_CONFIRMED**

## Root Cause Hypothesis
`su -` invokes the user's login shell (`/bin/bash` as a login shell), which sources `/home/runner/.profile` (and transitively `.bashrc`). Something in these startup files contains a blocking/hanging command (e.g., `read`, `tail -f`, interactive prompt, or network-dependent command that times out).

## Next Step
→ Phase 4: Structural profile file inspection
