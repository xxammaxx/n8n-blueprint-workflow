# Runner Credential Copy Result
## Phase 5 — Verify-Only und Copy-Entscheidung

### Verify-Only Ergebnis

| Check | Ergebnis |
|-------|----------|
| Lokale Datei gefunden | ja |
| Erforderliche Keys (6) | ja |
| Echte Werte | 3 (OPENCODE_MAX_COST_USD, OPENCODE_DRY_RUN, OPENCODE_ALLOW_PROVIDER_CALL) |
| Platzhalter | 3 (OPENCODE_PROVIDER, OPENCODE_API_KEY, OPENCODE_MODEL) |
| Proxmox erreichbar | ja |
| Container läuft | ja |
| RootFS zugreifbar | ja |
| Zielverzeichnis | erstellt/ok |
| VerifyOnly Mode | erfolgreich |

### Copy-Entscheidung

- **Copy ausgeführt:** nein
- **Grund:** Lokale Datei enthält Platzhalter
- **Betroffene Keys:** OPENCODE_PROVIDER, OPENCODE_API_KEY, OPENCODE_MODEL
- **Nächste Aktion:** Nutzer muss echte Werte eintragen

### Remote-Datei (Runner)
- **Vorhanden:** ja (vom letzten Commit, mit Platzhaltern)
- **Rechte:** 600 (korrekt)
- **Owner:** runner:runner (korrekt)
- **Loader Exit:** 2 (PLACEHOLDER_DETECTED)
- **API-Key vorhanden:** nein (placeholder)
- **API-Key ausgegeben:** nein

### Status
`GREEN_PARTIAL_SECRET_PLACEHOLDER`

### Nutzer-Aktion erforderlich
```powershell
notepad C:\Spec-kit_n8n\secrets\opencode-provider.env
```
Folgende Werte mit echten Credentials ersetzen:
- `OPENCODE_PROVIDER` (z.B. "openai", "anthropic", "deepseek", etc.)
- `OPENCODE_API_KEY` (der echte API-Key)
- `OPENCODE_MODEL` (z.B. "gpt-4o", "claude-sonnet-4-20250514", etc.)

Danach:
```powershell
.\scripts\copy-opencode-provider-credentials.ps1
```
