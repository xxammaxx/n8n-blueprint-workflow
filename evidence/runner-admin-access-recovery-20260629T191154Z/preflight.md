# Preflight Report — Runner Admin Access Recovery

## Metadata

- **UTC Timestamp:** 2026-06-29T19:11:54Z
- **Local Hostname:** xxammaxx-desktop
- **Operating System:** Linux Mint 22.1 (Xia)
- **OS ID:** linuxmint (like ubuntu debian)
- **Git Branch:** master
- **Working Directory:** ~/Spec-kit_n8n

## Runner / Infrastructure

- **Runner IP:** 192.168.1.53
- **Proxmox Host Candidate:** 192.168.1.136
- **n8n Host:** 192.168.1.52
- **Target User:** runner
- **Target Key Path:** ~/.ssh/id_ed25519
- **Target Key Fingerprint:** SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg
- **Public Key:** ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgnFkW5F74zJ/+5jLQIG6ihbUt5b/Sh+fOCSLuipLED docvault-ai-vscode

## Known Blockers

1. SSH to runner@192.168.1.53 — client offers key, server does not accept
2. root@192.168.1.53 via SSH — blocked
3. Proxmox API port 8006 — blocked
4. Local Proxmox CLI — blocked
5. Docker remote context — blocked

## Known Security Incident

- `.playwright-mcp/` JWTs in Git history at commit `485dc18` (HEAD)
- Also present in commit `5088845`
- Classified as: `KNOWN_PREEXISTING_HISTORY_LEAK`
- `.gitignore` currently includes both `secrets/` and `.playwright-mcp/`

## Git Status

Working tree has uncommitted changes (not to be committed):
- M CHANGELOG.md
- M STATUS.md
- M evidence-index/latest.md

Untracked evidence directories present (no commit):
- evidence/linux-mint-readiness-blocker-fix-2026-06-29T145710Z/
- evidence/linux-mint-runner-ssh-readiness-2026-06-29T15-32-01Z/
- evidence/post-green-stabilization-2026-06-29T15-*/ (multiple)
- evidence/runner-ssh-authorization-repair-2026-06-29T162037Z/
- evidence/runner-ssh-server-side-repair-20260629T185253Z/
- LINUX_MINT_OPERATIONAL_READINESS.md (untracked)

## Secret Hygiene Acknowledgment

- [x] Private Key NOT output
- [x] Secrets NOT output
- [x] JWTs NOT output
- [x] API Keys NOT output
- [x] Passwords NOT output

## Hard Constraints Acknowledged

- [x] No commit
- [x] No push
- [x] No force push
- [x] No history rewrite
- [x] No git rm --cached
- [x] No branch change
- [x] No workflow change
- [x] No SQLite change
- [x] No runner script change
- [x] No issue modification
- [x] No new issue creation
- [x] No GitHub Actions trigger
- [x] No auto-merge
- [x] No provider smoke test
- [x] No agent run
