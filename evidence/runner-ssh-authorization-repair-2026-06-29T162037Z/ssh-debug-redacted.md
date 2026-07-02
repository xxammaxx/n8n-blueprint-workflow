# SSH Debug — Redacted

**Phase:** 9  
**Timestamp:** 2026-06-29T16:26:00Z  
**Agent:** Issue Orchestrator (read-only validation)  
**Status:** `SSH_KEY_STILL_NOT_AUTHORIZED`

---

## Verbose SSH Debug (Filtered — Redacted)

### Key Findings from `ssh -vvv`

| Diagnostic | Result |
|------------|--------|
| **Key wird angeboten** | **JA** — `Offering public key: /home/xxammaxx/.ssh/id_ed25519 ED25519 SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg explicit agent` |
| **Server akzeptiert Key** | **NEIN** — After offering, "Authentications that can continue: publickey,password" (key not accepted) |
| **Permission denied** | **JA** |
| **Connection refused** | NEIN — Server is reachable |
| **Connection timed out** | NEIN — Response within 5 seconds |
| **No such file (local key)** | NEIN — Local key file exists and is readable |

---

## Probable Root Causes (Ranked by Likelihood)

### 1. Falscher Key eingefügt (HIGH)
The public key fingerprint we instructed the user to add (`SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`) may not match what was actually added to `/home/runner/.ssh/authorized_keys`. The local key IS correct (fingerprint matches), but the server rejects it — indicating the key on the runner does not match.

**Correct Public Key (NOT a secret):**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgnFkW5F74zJ/+5jLQIG6ihbUt5b/Sh+fOCSLuipLED docvault-ai-vscode
```

### 2. Falsche Rechte auf Runner (MEDIUM)
If `/home/runner/.ssh/` permissions are not `700` or `authorized_keys` is not `600`, SSHD will reject the key for security reasons.

### 3. Falscher Pfad / Format (LOW)
- `authorized_keys` must be in `/home/runner/.ssh/`
- Each key must be on its own line with no line breaks
- SSHD may use `AuthorizedKeysFile` pointing to a different location

### 4. SSHD-Konfiguration (LOW)
- `PubkeyAuthentication` could be disabled
- `AuthorizedKeysFile` could be set to a non-default path

---

## Second Key Debug (confirmatory)

The second ED25519 key (`docvault_n8n_docbot`, SHA256:cheKw9D...) was also tested — same result. Both keys are offered, neither accepted.

---

## Debug Command Used (for reference)

```bash
ssh -vvv \
    -o BatchMode=yes \
    -o ConnectTimeout=5 \
    -o IdentitiesOnly=yes \
    -i ~/.ssh/id_ed25519 \
    runner@192.168.1.53 'true' 2>&1 \
  | grep -E 'Offering public key|Authentications that can continue|Permission denied|Server accepts key|sign_and_send_pubkey|No such file|Connection refused|Connection timed out'
```

---

## Security Notes
- **Private Key Output:** NEIN
- **Password Output:** NEIN
- **Secrets in Debug Output:** NEIN — only public key fingerprints
