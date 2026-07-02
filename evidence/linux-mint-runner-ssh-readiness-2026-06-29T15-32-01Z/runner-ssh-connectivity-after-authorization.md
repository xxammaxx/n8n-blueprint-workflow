# SSH Runner Connectivity Test — After Authorization Attempt

**UTC Timestamp:** 2026-06-29T15:32:01Z  
**Session:** linux-mint-runner-ssh-readiness-validation  
**Agent:** Issue Orchestrator (read-only validation)

---

## Test Summary

| Field | Value |
|-------|-------|
| SSH Successful | **NO** |
| Status | **SSH_KEY_NOT_AUTHORIZED** |
| Target | `runner@192.168.1.53` |
| Auth Method | Public Key (BatchMode) |
| Server Host Key | `ssh-ed25519 SHA256:Kp0Jn/bSfA79CzBwSfnI9cX41/fdp3COpVPKBpNAtkM` |

---

## Test Details

### Keys Tested

| Key Name | Fingerprint (SHA256) | Result |
|----------|----------------------|--------|
| `~/.ssh/id_ed25519` (docvault-ai-vscode) | `/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg` | **REJECTED** |
| `~/.ssh/docvault_n8n_docbot` (docvault-n8n-docbot) | `cheKw9DUnXXQIqe2+ZT+ywRxDmQtcVOhg62sKZAFbyo` | **REJECTED** |

### SSH Agent State
- Agent running: YES (`/run/user/1000/keyring/ssh`)
- Keys loaded: 2 (both keys above)
- Key permissions: `600` (correct)

### Error Message
```
runner@192.168.1.53: Permission denied (publickey,password).
```

---

## Analysis

Both locally-available ED25519 SSH keypairs were offered to the server and both were rejected. This indicates that **neither key's public key has been added to `~/.ssh/authorized_keys` on the runner** for the `runner` user.

Possible causes:
1. The public key was not yet copied to the runner's `authorized_keys`.
2. A different public key was copied (fingerprint mismatch).
3. The `authorized_keys` file has restrictive permissions on the runner.
4. SSH service on the runner needs restart.

---

## Required User Action

The user must authorize the correct public key on the runner:

```bash
# On the runner (192.168.1.53), as the runner user:
# Choose ONE of these keys to authorize:

# Option A: id_ed25519 (docvault-ai-vscode)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... docvault-ai-vscode

# Option B: docvault_n8n_docbot (docvault-n8n-docbot)
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... docvault-n8n-docbot
```

To verify on the runner:
```bash
cat ~/.ssh/authorized_keys
# or
ssh-keygen -lf ~/.ssh/authorized_keys
```

---

## Verification

- Private key output: **NO**
- Password output: **NO**
- Secret values exposed: **NONE**
