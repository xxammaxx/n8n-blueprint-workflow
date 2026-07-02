# Runner User Home Check

## Metadata
- **UTC:** 2026-06-29T19:11:54Z
- **Runner CT:** 102 (lxc-dev-runner, 192.168.1.53)

## User Status

| Field | Value |
|-------|-------|
| User `runner` exists | Yes ✅ |
| UID | 1000 |
| GID | 1000 |
| Home | /home/runner |
| Shell | /bin/bash |

## Directory Permissions

| Path | Permissions | Owner | Status |
|------|-------------|-------|--------|
| /home/runner | drwxr-xr-x (755) | runner:runner | ✅ Correct |
| /home/runner/.ssh | drwx------ (700) | runner:runner | ✅ Correct |
| /home/runner/.ssh/authorized_keys | -rw------- (600) | runner:runner | ✅ Correct |

## Current authorized_keys Fingerprint

- **Key:** SHA256:AAnseFx1t4WjuR93L5LDS3bkori5IiyKEJVO15rYhUc
- **Comment:** root@pve (ED25519)

## Root Cause Analysis

The `authorized_keys` file contains ONLY the `root@pve` SSH key. Our target key (`docvault-ai-vscode`) is **NOT** present in the file.

**Our key:**
- Fingerprint: SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg
- Comment: docvault-ai-vscode

**Missing from authorized_keys → SSH rejected because the server doesn't recognize our key.**

## Repair Needed

Add the `docvault-ai-vscode` public key to `/home/runner/.ssh/authorized_keys` on CT 102.

## Secret Hygiene
- No secrets output
- No private keys output
- Public key displayed is the target key (not a secret)
