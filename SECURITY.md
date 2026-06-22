# SECURITY.md — Security Rules and Boundaries

## Credential Handling

- **SSH Key:** `dev-runner-ssh` credential is stored ONLY in n8n credential store
- **Never:** hardcode private keys, passwords, or tokens in workflow JSON
- **Never:** export decrypted credentials
- **Never:** store `.env` files in the repo
- **Never:** commit `.sqlite` database files

## Workflow Security

- SSH credentials accessed exclusively via n8n credential references
- Form inputs validated server-side before passing to runner
- Blueprint content never logged in plaintext
- `RUN_INPUT` files redacted before evidence storage

## Git Security

- `.gitignore` blocks: `.env`, `*.sqlite`, `*.pem`, `*.key`, credentials, cookies, browser profiles
- Pre-commit secret scan required before every push
- No force-push allowed
- No GitHub Actions workflow files (`.github/workflows/`) in this repo

## Network Boundaries

- n8n instance: internal network only (192.168.1.52:5678)
- Runner: internal network only (container 102)
- Proxmox management: SSH key-based auth only
- No public internet exposure for n8n or runner

## Data Retention

- Evidence retained for audit trail (10 years per DSGVO)
- Backups retained as per operational policy
- No canonical production data in this repo

## Prohibited Actions

- Direct SQL UPDATE/INSERT/DELETE on n8n database
- Deleting workflows or credentials without explicit approval
- Exporting decrypted credentials
- Reading cookies, tokens, or auth headers
- Copying browser profiles
- Force-push to any branch
- Triggering CI/CD or GitHub Actions
