# su-runner Post-Check

## Date/UTC: 2026-07-02T16:08:00Z

## Post-Repair Test Results

### `su - runner` (login shell) — WAS HANGING
```
Command: timeout 8s su - runner -c "echo SU_LOGIN_OK; whoami; pwd"
Exit Code: 0
Output:
  SU_LOGIN_OK
  runner
  /home/runner
Status: ✅ FIXED
```

### `su runner` (non-login) — WAS HANGING
```
Command: timeout 8s su runner -c "echo SU_NONLOGIN_OK; whoami; pwd"
Exit Code: 0
Output:
  SU_NONLOGIN_OK
  runner
  /root
Status: ✅ FIXED
Note: /root is correct — non-login shell inherits parent directory
Minor locale warning (harmless): "cannot change locale (en_US.UTF-8)"
```

### `runuser -l runner` (login shell) — WAS HANGING
```
Command: timeout 8s runuser -l runner -c "echo RUNUSER_LOGIN_OK; whoami; pwd"
Exit Code: 0
Output:
  RUNUSER_LOGIN_OK
  runner
  /home/runner
Status: ✅ FIXED
```

### `runuser -u runner` (non-login) — ALREADY WORKING
```
Command: timeout 8s runuser -u runner -- sh -c "echo RUNUSER_NONLOGIN_OK; whoami; pwd"
Exit Code: 0
Output:
  RUNUSER_NONLOGIN_OK
  runner
  /root
Status: ✅ STILL WORKS
```

## Summary

| Command | Before Repair | After Repair |
|---------|--------------|--------------|
| `su - runner` | HANG (exit 124) | ✅ WORKS (exit 0) |
| `su runner` | HANG (exit 124) | ✅ WORKS (exit 0) |
| `runuser -l runner` | HANG (exit 124) | ✅ WORKS (exit 0) |
| `runuser -u runner` | WORKS (exit 0) | ✅ WORKS (exit 0) |

## Status: SU_RUNNER_FIXED

## Secrets: None exposed
