# Credential Copy Script — Statische Validierung
## Phase 4 — Validierung

### Prüfungen

| Check | Ergebnis |
|-------|----------|
| Script existiert | ja (`scripts/copy-opencode-provider-credentials.ps1`) |
| Script enthält keine echten Secrets | ja (NO_SECRET_PATTERNS_FOUND) |
| Script gibt keine Secret-Werte aus | ja (nur Key-Namen und Status-Booleans) |
| Script nutzt Dateiübertragung statt echo | ja (scp + cp via RootFS) |
| Script prüft Platzhalter | ja (PASTE_*, YOUR_*, <...>, PLACEHOLDER*) |
| Script setzt Rechte 600 | ja (chmod 600 via pct exec) |
| Script setzt Owner runner:runner | ja (chown runner:runner via pct exec) |
| Script unterstützt -VerifyOnly | ja |
| Script dokumentiert sichere Nutzung | ja (Hilfe via Get-Help / Kommentare) |
| Platzhalter-Blockierung | ja (Exit 2 bei Platzhaltern ohne -AllowPlaceholderCopy) |
| Fehler-Redaktion | ja (Regex für ghp_, sk-, xox*, etc.) |
| Temp-Datei-Bereinigung | ja (rm -f nach Copy, auch im Fehlerfall) |
| SSH-Batch-Mode | ja (BatchMode=yes, verhindert Passwort-Prompts) |
| Loader-Aufruf nach Copy | ja (auto, Ausgabe nur Status) |

### Bewertung
**VALIDIERT** — Script ist sicher, enthält keine Secrets, und alle Sicherheitsgarantien sind erfüllt.

### Bereit für Phase 5 (VerifyOnly)
