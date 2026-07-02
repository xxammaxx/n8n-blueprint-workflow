# SSHD Config Read-Only Check

## Metadata
- **UTC:** 2026-07-01T08:50:53Z
- **Runner CT:** 102 (lxc-dev-runner, 192.168.1.53)

## SSHD Effective Configuration (sshd -T)

| Parameter | Value | Status |
|-----------|-------|--------|
| PubkeyAuthentication | yes | ✅ Allowed |
| AuthorizedKeysFile | .ssh/authorized_keys .ssh/authorized_keys2 | ✅ Default |
| PasswordAuthentication | yes | Not blocking |
| KbdInteractiveAuthentication | no | N/A |
| PermitRootLogin | without-password | N/A |
| AuthenticationMethods | any | ✅ Not restricting |
| AllowUsers | (not set) | ✅ Not blocking |
| DenyUsers | (not set) | ✅ Not blocking |

## SSHD Config Files Checked

- `/etc/ssh/sshd_config`
- `/etc/ssh/sshd_config.d/` (no overriding files)

All relevant parameters are at their defaults (commented out), meaning:
- PubkeyAuthentication defaults to `yes` ✅
- AuthorizedKeysFile defaults to `.ssh/authorized_keys .ssh/authorized_keys2` ✅
- No AllowUsers/DenyUsers restrictions ✅
- No AuthenticationMethods restrictions ✅

## Conclusion

- PubkeyAuthentication: Allowed ✅
- AuthorizedKeysFile: Correct (defaults) ✅
- AllowUsers/DenyUsers blocks runner: No ✅
- No SSHD configuration changes needed ✅

## Secret Hygiene
- No secrets output
- No passwords output
