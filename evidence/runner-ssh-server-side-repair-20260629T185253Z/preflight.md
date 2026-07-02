# Preflight — SSH Server-Side Repair

## Meta

- **Datum/Zeit UTC:** 2026-06-29T18:52:53Z
- **Lokaler Hostname:** xxammaxx-desktop
- **Lokaler Rechner:** Linux Mint (neu)
- **Arbeitsverzeichnis:** ~/Spec-kit_n8n
- **Evidence-Pfad:** evidence/runner-ssh-server-side-repair-20260629T185253Z

## Ziel

- **Zielhost:** 192.168.1.53
- **Zieluser:** runner
- **Zielkey-Fingerprint:** SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg
- **Zielkey-Typ:** ED25519
- **Zielkey-Kommentar:** docvault-ai-vscode

## Bekannter Befund

- **Client bietet Key an:** ja
- **Server akzeptiert Key:** nein
- **Wahrscheinliche Ursachen (Kandidaten):**
  1. falscher Public Key in `authorized_keys`
  2. falscher Pfad zu `authorized_keys`
  3. falsche Rechte/Ownership auf `.ssh/` oder `authorized_keys`
  4. falscher Home-Pfad des Users `runner`
  5. SSHD-Konfiguration blockiert Public-Key-Login
  6. Datei enthält CRLF oder unsichtbare Zeichen
  7. Account `runner` ist gesperrt oder hat ungültige Shell

## Sicherheits-Constraints (dokumentiert)

- **Private Key ausgegeben:** nein
- **Secrets ausgegeben:** nein
- **Keine Secrets geloggt:** wird eingehalten
- **Kein Commit, kein Push:** wird eingehalten
