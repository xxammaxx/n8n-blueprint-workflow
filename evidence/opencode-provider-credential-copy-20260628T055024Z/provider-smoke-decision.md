# Provider Smoke Test Decision
## Phase 7 — Entscheidung über Provider Smoke Test

### Entscheidungsmatrix

| Kriterium | Wert | Erfüllt? |
|-----------|------|----------|
| Remote Secret-Datei vorhanden | ja (`/opt/dev-fabric/secrets/opencode-provider.env`) | ✅ |
| Echter API-Key vorhanden | nein (PASTE_PROVIDER_API_KEY_HERE) | ❌ |
| Provider gesetzt | nein (PASTE_PROVIDER_NAME_HERE) | ❌ |
| Model gesetzt | nein (PASTE_MODEL_NAME_HERE) | ❌ |
| Loader erfolgreich | ja (Exit 2 = PLACEHOLDER_DETECTED) | ⚠️ |
| Secret Hygiene grün | ja | ✅ |
| OPENCODE_ALLOW_PROVIDER_CALL=true | nein (false) | ❌ |
| Kostenlimit gesetzt | ja (0.25) | ✅ |
| Nutzerfreigabe | nicht erteilt | ❌ |

### Entscheidung

**`GREEN_PARTIAL_SECRET_PLACEHOLDER`**

Der Provider Smoke Test kann NICHT ausgeführt werden weil:
1. API-Key ist ein Platzhalter (PASTE_PROVIDER_API_KEY_HERE)
2. Provider-Name ist ein Platzhalter
3. Model-Name ist ein Platzhalter
4. OPENCODE_ALLOW_PROVIDER_CALL ist false
5. Keine Nutzerfreigabe erteilt

### Nächste Schritte für Smoke Test

1. Nutzer trägt echte Credentials ein:
   ```powershell
   notepad C:\Spec-kit_n8n\secrets\opencode-provider.env
   ```
2. Nutzer setzt `OPENCODE_ALLOW_PROVIDER_CALL=true`
3. Copy-Script ausführen:
   ```powershell
   .\scripts\copy-opencode-provider-credentials.ps1
   ```
4. Smoke Test im Runner:
   ```bash
   /opt/dev-fabric/bin/opencode-provider-smoke-test.sh
   ```

### Blockiert bis
- Echte Credentials verfügbar
- Nutzerfreigabe für Provider-Call
