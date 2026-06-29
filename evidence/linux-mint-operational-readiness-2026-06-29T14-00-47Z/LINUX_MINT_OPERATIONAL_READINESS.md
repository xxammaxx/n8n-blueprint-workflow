# Operational Readiness Summary — Linux Mint Workstation

## UTC Timestamp: 2026-06-29T14:00:47Z

## Machine Identity

| Field | Value |
|-------|-------|
| Hostname | `xxammaxx-desktop` |
| OS | Linux Mint 22.1 (Xia) |
| Shell | `/bin/bash` |
| User | `xxammaxx` |

## Repository State

| Field | Value |
|-------|-------|
| Repository | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Branch | `master` |
| Last Commit | `363edd5 — docs(ops): prepare linux mint workstation credentials and runner access` |
| Working Tree | clean |
| Upstream | in sync with `origin/master` |

## Readiness Matrix

| Component | Status | Detail |
|-----------|--------|--------|
| **System Tools** | ✅ READY | Git 2.43, Node v22.22, npm 10.9, Python 3.12, SSH 9.6, curl 8.5 |
| **n8n Health** | ✅ READY | Healthz: `{"status":"ok"}`, UI serving (200 OK) |
| **n8n API** | ❌ NOT READY | HTTP 401 — API key rejected |
| **Runner SSH** | ❌ NOT READY | Permission denied (publickey) |
| **Runner OpenCode** | ⏭️ UNKNOWN | Skipped (SSH not authorized) |
| **Local Secrets** | ✅ READY | Both `.env` files present, all keys filled, no placeholders |
| **DeepSeek Config** | ✅ READY | `opencode-provider.env` properly structured |
| **Secret Hygiene** | ⚠️ NOTE | Historical `.playwright-mcp/` JWT leak (key revoked, no active leaks) |
| **Dispatcher Health** | ⚠️ HEALTH_YELLOW | Known warnings (powershell on Linux, secret hygiene script) |

## Open Notes

1. **N8N_API_KEY_NOT_READY**: The API key in `secrets/n8n-api.env` was rejected with HTTP 401. User must generate a new API key in n8n UI at `http://192.168.1.52:5678` → Settings → API → Generate New Key, then update `secrets/n8n-api.env`.

2. **SSH_KEY_NOT_AUTHORIZED**: The ed25519 public key from this machine is not authorized on the runner (`runner@192.168.1.53`). User must copy the public key to the runner's `~/.ssh/authorized_keys` for user `runner`.

3. **Historical Playwright Leak**: `.playwright-mcp/` files remain tracked in git history. The leaked JWTs have been revoked. No history rewrite per user constraints.

4. **Dispatcher Windows Artifacts**: `powershell` calls fail on Linux Mint — expected, non-blocking.

## Decision

### `NEW_MACHINE_READY_WITH_NOTES`

The Linux Mint workstation hardware, OS, and local tooling are operational and properly configured. The repository is clean and tracked correctly. Local secrets are properly structured.

**Two manual remediation steps are required before the machine can assume full operational duties:**
1. Authorize the SSH public key on the runner (`runner@192.168.1.53`)
2. Generate and store a valid n8n API key in `secrets/n8n-api.env`

Once these two items are resolved, the machine can achieve `NEW_MACHINE_OPERATIONAL_READY` status.
