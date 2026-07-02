# SSHD Config Read-Only Check

## Phase 4 — Status: BLOCKED (kein Admin-Zugriff)

## Meta

- **Datum/Zeit UTC:** 2026-06-29T18:52:53Z
- **Blockiert seit:** 2026-06-29T18:52:53Z
- **Grund:** Kein SSH-Zugriff als root/Admin auf `192.168.1.53`

## Indirekte Hinweise aus Client-Log (ssh -vvv)

Aus dem Client-seitigen SSH Debug-Log (KEIN Admin-Zugriff):

- **`Authentications that can continue: publickey,password`** → Public-Key-Authentifizierung ist NICHT global deaktiviert
- **Server host key:** ssh-ed25519 SHA256:Kp0Jn/bSfA79CzBwSfnI9cX41/fdp3COpVPKBpNAtkM
- **Client bietet Key an:** SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg
- **Key wird angeboten, aber NICHT akzeptiert**

## SSHD-Konfiguration (Indirekte Schlüsse)

- `PubkeyAuthentication yes`: WAHRSCHEINLICH ja (da `publickey` in `Authentications that can continue` gelistet ist)
- `AuthorizedKeysFile`: UNBEKANNT (Server-seitig nicht prüfbar)
- `AllowUsers`: UNBEKANNT
- `DenyUsers`: UNBEKANNT
- `AuthenticationMethods`: UNBEKANNT
- keine SSHD-Konfigurationsänderung durchgeführt: BESTÄTIGT

## Bereitzustellende Kommandos (für spätere Ausführung auf dem Runner)

```bash
# Methode 1: sshd -T (bevorzugt)
sudo sshd -T -C user=runner,host=192.168.1.53,addr=192.168.1.1 | grep -Ei 'pubkeyauthentication|authorizedkeysfile|passwordauthentication|permitrootlogin|allowusers|denyusers|authenticationmethods|kbdinteractiveauthentication' || true

# Methode 2: Konfigurationsdateien parsen (Fallback)
sudo grep -RniE 'PubkeyAuthentication|AuthorizedKeysFile|AllowUsers|DenyUsers|AuthenticationMethods|PasswordAuthentication' /etc/ssh/sshd_config /etc/ssh/sshd_config.d 2>/dev/null || true
```

## Status

`ADMIN_ACCESS_BLOCKED` — SSHD-Konfiguration nicht prüfbar ohne Admin-Zugriff auf `192.168.1.53`.
`SSHD_CONFIG_BLOCKS_KEY`: UNBEKANNT (nicht prüfbar)

## Nächste Aktion

Admin-Zugriff auf Runner herstellen, dann diese Phase mit `sshd -T` prüfen.
