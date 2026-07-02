# su-runner Reproduction

## Date/UTC: 2026-07-02T16:04:31Z

## Runner User Entry
```
runner:x:1000:1000::/home/runner:/bin/bash
```
- UID: 1000
- GID: 1000
- Home: /home/runner
- Shell: /bin/bash

## Test Results

### `su - runner` (login shell)
```
Command: timeout 8s su - runner -c "echo SU_LOGIN_OK; whoami; pwd"
Exit Code: 124 (timeout)
Output: (none — command hung until killed by timeout)
Status: SU_LOGIN_HANG_CONFIRMED
```

### `su runner` (non-login)
```
Command: timeout 8s su runner -c "echo SU_NONLOGIN_OK; whoami; pwd"
Exit Code: 124 (timeout)
Output: (none — command hung until killed by timeout)
Status: SU_NONLOGIN_HANG_CONFIRMED
```

## Conclusion

Both login-shell and non-login `su` to the runner user hang indefinitely. The issue is not specific to profile loading (which would only affect `su -`). The fact that even `su runner` (without `-`) hangs suggests a lower-level issue: likely PAM, systemd/logind, or TTY allocation problem rather than shell profile blocking.

## Status: SU_LOGIN_HANG_CONFIRMED + SU_NONLOGIN_HANG_CONFIRMED

## Secrets: None exposed
