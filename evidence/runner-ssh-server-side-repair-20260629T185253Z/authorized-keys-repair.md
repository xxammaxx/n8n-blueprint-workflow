# Authorized Keys Repair

## Phase 3 — Status: BLOCKED (kein Admin-Zugriff)

## Meta

- **Datum/Zeit UTC:** 2026-06-29T18:52:53Z
- **Blockiert seit:** 2026-06-29T18:52:53Z
- **Grund:** Kein SSH-Zugriff als root/Admin auf `192.168.1.53`

## Was zu reparieren wäre

- **Backup erstellt:** NEIN (nicht ausführbar)
- **`authorized_keys` neu gesetzt:** NEIN (nicht ausführbar)
- **Zielkey-Fingerprint:** SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg
- **Public Key (NOT a secret):**
  ```
  ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgnFkW5F74zJ/+5jLQIG6ihbUt5b/Sh+fOCSLuipLED docvault-ai-vscode
  ```
- **Ziel-Rechte:** `.ssh` = 700, `authorized_keys` = 600
- **Ziel-Ownership:** `runner:runner`
- **Private Key ausgegeben:** NEIN

## Bereitzustellendes Reparatur-Skript (für spätere Ausführung auf dem Runner)

```bash
set -eu

RUNNER_HOME="$(getent passwd runner | cut -d: -f6)"
echo "RUNNER_HOME=${RUNNER_HOME}"

mkdir -p "${RUNNER_HOME}/.ssh"
touch "${RUNNER_HOME}/.ssh/authorized_keys"

cp "${RUNNER_HOME}/.ssh/authorized_keys" "${RUNNER_HOME}/.ssh/authorized_keys.bak.$(date -u +%Y%m%dT%H%M%SZ)" || true

printf '%s\n' 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgnFkW5F74zJ/+5jLQIG6ihbUt5b/Sh+fOCSLuipLED docvault-ai-vscode' > "${RUNNER_HOME}/.ssh/authorized_keys"

chown -R runner:runner "${RUNNER_HOME}/.ssh"
chmod 700 "${RUNNER_HOME}/.ssh"
chmod 600 "${RUNNER_HOME}/.ssh/authorized_keys"
chmod go-w "${RUNNER_HOME}" || true

sudo -u runner test -r "${RUNNER_HOME}/.ssh/authorized_keys" && echo "authorized_keys readable by runner: yes"
sudo -u runner ssh-keygen -lf "${RUNNER_HOME}/.ssh/authorized_keys"
```

## Status

`ADMIN_ACCESS_BLOCKED` — Reparatur nicht möglich ohne Admin-Zugriff auf `192.168.1.53`.
