# Runner SSH Validation After Authorization

**Phase:** 7  
**Timestamp:** 2026-06-29T16:25:00Z  
**Agent:** Issue Orchestrator (read-only validation)

---

## SSH Test Result

| Parameter | Value |
|-----------|-------|
| **SSH successful** | **NEIN** 🔴 |
| **Status** | `SSH_KEY_STILL_NOT_AUTHORIZED` |
| **Hostname** | N/A — connection rejected |
| **User** | N/A — connection rejected |
| **Used Key** | `~/.ssh/id_ed25519` (ED25519) |
| **Key Fingerprint** | `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg` |
| **Private Key Output** | NEIN |
| **Password Output** | NEIN |

---

## Test Command Executed

```bash
ssh -o BatchMode=yes \
    -o ConnectTimeout=5 \
    -o IdentitiesOnly=yes \
    -i ~/.ssh/id_ed25519 \
    runner@192.168.1.53 'hostname; whoami'
```

## Raw Output

```
runner@192.168.1.53: Permission denied (publickey,password).
```

---

## Second Key Also Tested

| Parameter | Value |
|-----------|-------|
| **Key** | `~/.ssh/docvault_n8n_docbot` (ED25519) |
| **Fingerprint** | `SHA256:cheKw9DUnXXQIqe2+ZT+ywRxDmQtcVOhg62sKZAFbyo` |
| **Result** | Permission denied (publickey,password) |

---

## Diagnostic Summary

- Both ED25519 keys were offered to the server
- Server authentication methods: `publickey,password`
- Neither key was accepted by the server
- Connect timeout: 5 seconds
- IdentitiesOnly: yes (only the specified key tested)
- Connection to host 192.168.1.53: REACHABLE (no "Connection refused" or "Connection timed out")
- Authentication: FAILED — Permission denied

---

## Root Cause Analysis

The SSH_debug_verbose output confirms:
- Key IS offered to server (correct fingerprint matches local key)
- Server does NOT accept the key — "Authentications that can continue" still shows `publickey` after key is offered
- No "Server accepts key" message in debug log

**Probable causes:**
1. **Falscher Key eingefügt:** User may have copied a different public key into `/home/runner/.ssh/authorized_keys` (not matching the private key fingerprint `SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`)
2. **Formatierungsfehler:** Key may have been added with trailing whitespace, missing newline, or line break issues
3. **Falsche Rechte auf Runner:** `.ssh/` directory needs `700`, `authorized_keys` needs `600`
4. **SSHD-Konfiguration:** Server-side `PubkeyAuthentication` may be `no` or restricted

---

## Next Action

Phase 9: SSH Debug (redacted) for detailed diagnostics.
Phase 10-12: Continue independent checks (n8n API, Dispatcher Health, Secret Hygiene).
