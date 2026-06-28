# Credential Copy Script — Dokumentation
## Phase 3 — Sicheres Copy-Script

### Script
- **Pfad:** `C:\Spec-kit_n8n\scripts\copy-opencode-provider-credentials.ps1`
- **Sprache:** PowerShell 5.1
- **Länge:** ~495 Zeilen

### Architektur

```
Lokal (PowerShell)  →  Proxmox (SSH/scp)  →  LXC Container (RootFS + pct exec)
```

### Datenfluss (sicher, keine Secrets im Transit ausgegeben)

1. Lokale `.env` lesen (nur Keys validieren, Werte nie ausgeben)
2. SSH zu Proxmox-Host (192.168.1.136) prüfen
3. Container-Status (102) prüfen
4. RootFS-Zugriff prüfen
5. `scp` → Proxmox `/tmp/` (Dateiübertragung, keine Echo/Cat)
6. `cp` → Container RootFS (Dateisystem-Kopie)
7. Temp-Datei auf Proxmox löschen
8. `chown runner:runner` + `chmod 600` via `pct exec`
9. Loader ausführen → nur Booleans/Status zeigen

### Modi

| Modus | Flag | Verhalten |
|-------|------|-----------|
| Verify Only | `-VerifyOnly` | Checks, kein Copy |
| Normal Copy | (kein Flag) | Echte Credentials kopieren |
| Placeholder Copy | `-AllowPlaceholderCopy` | Auch PASTE_*-Werte kopieren |

### Sicherheitsgarantien

- [x] Keine `echo "$SECRET"` Konstrukte
- [x] Keine Secret-Werte in Kommandozeilen-Argumenten
- [x] Datei als Datei übertragen (scp + cp)
- [x] Platzhalter-Erkennung (PASTE_*, YOUR_*, <...>, PLACEHOLDER*)
- [x] Fehlerausgaben redigiert (Regex für Token-Patterns)
- [x] Keine Secret-Werte im Script-Code
- [x] Loader-Ausgabe ist inhärent sicher (nur "loaded"/"placeholder")
- [x] Rechte 600, Owner runner:runner
- [x] Temp-Dateien werden bereinigt

### Abhängigkeiten
- PowerShell 5.1+
- SSH (OpenSSH Client in Windows)
- scp.exe
- Proxmox SSH-Key (~/.ssh/proxmox_scanner)
- Proxmox `pct` Kommandozeilen-Tool
- Container-RootFS unter `/var/lib/lxc/102/rootfs`

### Exit Codes

| Code | Bedeutung |
|------|-----------|
| 0 | Erfolg |
| 1 | Lokale Datei nicht gefunden |
| 2 | Platzhalter gefunden, Copy blockiert |
| 3 | Proxmox nicht erreichbar |
| 4 | Container nicht erreichbar |
| 5 | Zielverzeichnis nicht erstellbar |
| 6 | Dateiübertragung fehlgeschlagen |
| 7 | Rechte/Owner setzen fehlgeschlagen |
| 8 | Loader fehlgeschlagen |

### Keine Secrets
- [x] Regex-Check: `NO_SECRET_PATTERNS_FOUND`
- [x] Keine API-Keys im Code
- [x] Keine SSH-Keys im Code
- [x] Keine Token im Code
