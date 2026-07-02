# Runner User & Home Check

## Phase 2 — Status: BLOCKED (kein Admin-Zugriff)

## Meta

- **Datum/Zeit UTC:** 2026-06-29T18:52:53Z
- **Blockiert seit:** 2026-06-29T18:52:53Z
- **Grund:** Kein SSH-Zugriff als root/Admin auf `192.168.1.53`

## Befund

- **User `runner` existiert:** UNBEKANNT (nicht prüfbar ohne Admin-Zugriff)
- **Home-Pfad:** UNBEKANNT
- **Shell:** UNBEKANNT
- **Home-Verzeichnis vorhanden:** UNBEKANNT
- **Ownership plausibel:** UNBEKANNT

## Zugangsmethoden getestet

| Methode | Ergebnis |
|---------|----------|
| SSH root@192.168.1.53 (id_ed25519) | Permission denied (publickey,password) |
| SSH root@192.168.1.53 (docvault_n8n_docbot) | Permission denied (publickey,password) |
| SSH runner@192.168.1.53 (id_ed25519) | Permission denied (publickey,password) |
| SSH runner@192.168.1.53 (docvault_n8n_docbot) | Permission denied (publickey,password) |
| Proxmox API (port 8006) | Connection refused |
| Proxmox CLI (qm/pvesh) | Nicht installiert auf lokalem Rechner |
| Docker context remote | Kein remote Docker context |

## Bereitzustellende Kommandos (für spätere Ausführung auf dem Runner)

```bash
set -eu
id runner
getent passwd runner
eval echo "~runner"
ls -ld /home/runner || true
```

## Status

`ADMIN_ACCESS_BLOCKED` — Keine Prüfung möglich ohne root/Admin-Zugriff auf `192.168.1.53`.

## Nächste Aktion

Admin-Zugriff auf Runner herstellen (Proxmox Console, root SSH, oder Admin-Shell), dann diese Phase wiederholen.
