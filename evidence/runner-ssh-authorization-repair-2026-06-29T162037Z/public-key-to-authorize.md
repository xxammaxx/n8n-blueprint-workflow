# Public Key to Authorize on Runner

## Key Details
- **Type**: ED25519
- **Fingerprint**: `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`
- **Comment**: docvault-ai-vscode

## Public Key (NOT a secret)
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgnFkW5F74zJ/+5jLQIG6ihbUt5b/Sh+fOCSLuipLED docvault-ai-vscode
```

## Target
- **Host**: 192.168.1.53
- **User**: runner
- **Destination File**: `/home/runner/.ssh/authorized_keys`

## Security Notes
- **Public Key Output**: allowed — public keys are not secrets
- **Private Key Output**: no
- **Password Output**: no
