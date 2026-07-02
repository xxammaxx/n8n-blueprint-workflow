# SSH Failure Diagnosis

## Phase 6 — Status: BLOCKED (kein Admin-Zugriff für Server-Logs)

## Meta

- **Datum/Zeit UTC:** 2026-06-29T18:52:53Z
- **Client-seitiger Test:** SSH fehlgeschlagen (Phase 5)
- **Server-Logs:** NICHT PRÜFBAR (kein Admin-Zugriff auf `192.168.1.53`)

## Client-seitige Diagnose (ssh -vvv)

```
Authentications that can continue: publickey,password
Will attempt key: /home/xxammaxx/.ssh/id_ed25519 ED25519 SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg explicit agent
Offering public key: /home/xxammaxx/.ssh/id_ed25519 ED25519 SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg explicit agent
Authentications that can continue: publickey,password
No more authentication methods to try.
Permission denied (publickey,password).
```

## Client-Log Analyse

| Frage | Antwort |
|-------|---------|
| Key angeboten? | JA |
| Server akzeptiert? | NEIN |
| Andere Auth-Methoden? | password (nicht verwendet wegen BatchMode=yes) |
| Connection-Timeout? | NEIN, erfolgreicher TCP Connect auf Port 22 |
| DNS-Probleme? | NEIN (direkte IP) |

## Server-Log (nicht prüfbar)

Server-seitige Logs sind ohne Admin-Zugriff auf `192.168.1.53` nicht auswertbar.

```bash
# Bereitzustellende Kommandos (für spätere Ausführung auf dem Runner):
sudo journalctl -u ssh --since "10 minutes ago" --no-pager | tail -n 80 || true
sudo journalctl -u sshd --since "10 minutes ago" --no-pager | tail -n 80 || true
sudo tail -n 80 /var/log/auth.log || true
```

## Mögliche Ursachen (unverändert)

1. **Falscher Public Key** in `authorized_keys` — wahrscheinlichste Ursache
2. **Falsche Rechte/Ownership** auf `.ssh/` (muss 700) oder `authorized_keys` (muss 600)
3. **Home-Pfad** des Users `runner` ist nicht `/home/runner`
4. **SSHD-Konfiguration** blockiert Key-Login für `runner`
5. **Account gesperrt** oder ungültige Shell
6. **CRLF/unsichtbare Zeichen** in `authorized_keys`

## Status

`ADMIN_ACCESS_BLOCKED` — Server-seitige Diagnose nicht möglich.
`SSH_KEY_STILL_NOT_AUTHORIZED` — SSH bleibt blockiert.

## Nächste Aktion

Admin-Zugriff auf `192.168.1.53` herstellen (Proxmox Console, root SSH, Admin-Shell).
