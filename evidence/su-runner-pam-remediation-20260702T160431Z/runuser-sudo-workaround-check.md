# runuser / sudo Workaround Validation

## Date/UTC: 2026-07-02T16:04:31Z

## Test Results

### `runuser -l runner` (login shell)
```
Command: timeout 8s runuser -l runner -c "echo RUNUSER_LOGIN_OK; whoami; pwd"
Exit Code: 124 (timeout)
Output: (none — command hung until killed by timeout)
Status: FAIL — HANGS
```

### `runuser -u runner` (non-login, explicit command)
```
Command: timeout 8s runuser -u runner -- sh -c "echo RUNUSER_NONLOGIN_OK; whoami; pwd"
Exit Code: 0 (success)
Output:
  RUNUSER_NONLOGIN_OK
  runner
  /root
Status: PASS — WORKS
```

### `sudo -u runner`
```
Command: timeout 8s sudo -u runner sh -c "..."
Exit Code: 127 (command not found)
Status: FAIL — sudo not installed in container
```

## Key Observations

1. **`runuser -l runner` also hangs** — This confirms the hang is in the login shell initialization path, NOT specific to `su`. Both `su -` and `runuser -l` invoke the login shell and both hang.

2. **`runuser -u runner` works** — When bypassing the login shell entirely and just switching user identity to execute a command, it works fine. This proves:
   - The runner user account is valid
   - The runner user can execute commands
   - The shell (/bin/bash) is functional
   - PAM authentication (pam_unix) is NOT the issue (runuser -u doesn't require auth)

3. **sudo not available** — Not a viable alternative.

## Hang Boundary Analysis

```
WORKS: runuser -u runner -- <cmd>     (no login shell, no PAM session)
HANGS: runuser -l runner -c "<cmd>"   (login shell, PAM session)
HANGS: su - runner -c "<cmd>"         (login shell, PAM session)
HANGS: su runner -c "<cmd>"           (non-login but still PAM session?)
```

The boundary is NOT between login vs. non-login shell — it's between `runuser -u` (which skips PAM session setup entirely) and everything else (which goes through PAM session management).

## Recommended Workaround

**Primary:** `runuser -u runner -- <command>` for all automated commands
**Fallback:** Direct SSH as runner: `ssh runner@192.168.1.53 '<command>'`

## Secrets: None exposed
