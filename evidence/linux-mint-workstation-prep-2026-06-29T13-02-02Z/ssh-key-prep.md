# SSH Key Preparation for Runner Access

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Target:** Runner at 192.168.1.53

## Local SSH Key Status

| Check | Result |
|-------|--------|
| SSH key exists | YES |
| Key type | ED25519 |
| Key file | `~/.ssh/id_ed25519` |
| Public key file | `~/.ssh/id_ed25519.pub` |
| New key generated this run | NO (pre-existing) |
| Private key displayed | NO |
| Public key fingerprint | SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg |
| Key comment | docvault-ai-vscode |

## Additional Keys Found
- `~/.ssh/docvault_n8n_docbot` — separate key pair (fingerprint not retrieved)

## Runner User
- **Known:** NO — user must provide the username for the runner
- **Do NOT guess:** agent will not attempt connections with unconfirmed usernames

## Next Step
User must:
1. Confirm the runner username (e.g., `runner`)
2. If key not yet authorized, copy public key to runner's `~/.ssh/authorized_keys`

### Command for user (on runner):
```bash
# On runner 192.168.1.53 as target user:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Paste public key into:
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Public key can be displayed with:
```bash
cat ~/.ssh/id_ed25519.pub
```
