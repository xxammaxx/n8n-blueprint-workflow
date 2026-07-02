# Target Public Key Selection

## Selected Key
- **Public Key File**: `~/.ssh/id_ed25519.pub`
- **Private Key**: `~/.ssh/id_ed25519`
- **Type**: ED25519
- **Fingerprint**: `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`
- **Comment**: docvault-ai-vscode
- **Created**: Jun 27 2026

## Rationale
1. `id_ed25519` is the standard/default SSH key name used by OpenSSH.
2. It was created first (Jun 27) — this is the primary machine identity key.
3. Both keys are ED25519 (same type, same security level).
4. `id_ed25519` is preferred by convention; tools like `ssh` will try it automatically.

## Other Key Considered
- `docvault_n8n_docbot` (SHA256:cheKw9D...) — secondary, use-case-specific key for n8n/docbot. Listed as alternative but not preferred for this authorization run.

## Private Key Output
- no

## Target Runner
- **Host**: 192.168.1.53
- **User**: runner
- **Authorized Keys Path**: `/home/runner/.ssh/authorized_keys`
