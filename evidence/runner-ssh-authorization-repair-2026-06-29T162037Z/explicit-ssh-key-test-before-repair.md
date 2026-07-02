# Explicit SSH Key Test Before Repair

## Test Target
- **Host**: 192.168.1.53
- **User**: runner
- **Auth Method**: ED25519 publickey

## Test Results

### Key 1: id_ed25519
- **File**: `~/.ssh/id_ed25519`
- **Fingerprint**: `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`
- **Comment**: docvault-ai-vscode
- **Result**: `PERMISSION_DENIED`
- **Exit Code**: 255
- **Message**: `Permission denied (publickey,password).`
- **Private Key Output**: no

### Key 2: docvault_n8n_docbot
- **File**: `~/.ssh/docvault_n8n_docbot`
- **Fingerprint**: `SHA256:cheKw9DUnXXQIqe2+ZT+ywRxDmQtcVOhg62sKZAFbyo`
- **Comment**: docvault-n8n-docbot
- **Result**: `PERMISSION_DENIED`
- **Exit Code**: 255
- **Message**: `Permission denied (publickey,password).`
- **Private Key Output**: no

## Status
**SSH_AUTH_REPAIR_REQUIRED** — kein Key wird von runner@192.168.1.53 akzeptiert.
