# Preflight Report — SSH Authorization Repair

## Date/Time
- **UTC**: 2026-06-29T16:20:37Z
- **Local**: Mon Jun 29 2026

## System
- **Hostname**: xxammaxx-desktop
- **OS**: Linux Mint 22.1 (Xia)
- **VERSION_ID**: 22.1
- **Base**: Ubuntu noble

## Git Status
- **Branch**: master
- **HEAD**: 4103436 docs(ops): validate linux mint n8n api readiness
- **Uncommitted changes**:
  - `M CHANGELOG.md`
  - `M STATUS.md`
  - `M evidence-index/latest.md`
  - `?? LINUX_MINT_OPERATIONAL_READINESS.md`
  - `?? evidence/` (multiple directories)

### Recent History (5 commits)
```
4103436 (HEAD -> master, origin/master, origin/HEAD) docs(ops): validate linux mint n8n api readiness
43b633a docs(ops): add final report to linux mint operational readiness
c697b2d docs(ops): validate linux mint operational readiness
363edd5 docs(ops): prepare linux mint workstation credentials and runner access
a78d427 docs(ops): add linux mint new machine migration validation
```

## SSH Directory
- **.ssh exists**: yes
- **Private keys found**: 2 (id_ed25519, docvault_n8n_docbot)
- **Public keys found**: 2 (id_ed25519.pub, docvault_n8n_docbot.pub)
- **Both key types**: ED25519

## Secrets Check
- **Secret values output**: no
- **Private keys output**: no
- **API keys output**: no

## Current Known State
- **SSH_KEY_NOT_AUTHORIZED**: both local ED25519 keypairs rejected by runner@192.168.1.53
- **RED_SECRET_LEAK**: `.playwright-mcp/` JWTs in git history (known pre-existing)
- **n8n API**: HTTP 200, reachable
