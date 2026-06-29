# Runner SSH Connectivity

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Runner:** 192.168.1.53

## Connection Test

| Check | Result |
|-------|--------|
| Runner reachable | YES (SSH responded, not timeout) |
| User `runner` exists | YES (authentication attempted, not "user unknown") |
| SSH key accepted | NO — Permission denied (publickey,password) |
| Private key displayed | NO |
| Password attempted | NO (BatchMode=yes, no interactive password) |
| Password displayed | NO |

## Status: `SSH_KEY_REQUIRED`

The id_ed25519 key (SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg) is not yet authorized for user `runner` on 192.168.1.53.

## User Action Required

Authorize the local SSH public key on the runner. Two methods:

### Method A: Manual (recommended)
On the runner (192.168.1.53) as user `runner`:
```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Method B: From Linux Mint (if password access exists)
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub runner@192.168.1.53
```

The public key to authorize can be displayed with:
```bash
cat ~/.ssh/id_ed25519.pub
```

### Alternative Key
A second key pair exists at `~/.ssh/docvault_n8n_docbot` which may already be authorized. User should confirm which key is expected on the runner.
