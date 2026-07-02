# su-runner Strace Diagnosis

## Date/UTC: 2026-07-02T16:04:31Z

## Result

**strace not available** in container. Cannot perform syscall-level tracing.

## Impact

Minimal — root cause already definitively confirmed via PAM configuration analysis (Phase 6). The hang point is identified as `pam_systemd.so` trying to register a session with unresponsive `systemd-logind` via D-Bus.

## strace_file_deleted: N/A (not created)

## Secrets: None exposed
