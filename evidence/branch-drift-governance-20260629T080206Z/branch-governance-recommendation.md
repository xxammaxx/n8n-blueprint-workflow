# Branch Governance Recommendation

## Empfehlung: Option A — `master` als GitHub Default Branch setzen

### Begründung

#### 1. `master` ist eindeutig die Source of Truth
- Alle aktuellen Agenten (Issue-Orchestrator, Review-Agent, Security-Agent, etc.) arbeiten auf `master`
- Der n8n Dispatcher (`Sv12QTo56NoPUu2D`) verwendet `master` als Source-of-Truth-Branch
- Alle aktuellen Operations-Dokumente, Green-Baselines, Comment-Sync-Dokumentation liegen auf `master`
- Der letzte Commit auf `master` ist ~2 Stunden alt (vs. 2 Tage auf `main`)
- Der gesamte Betriebszustand (`COMMENT_SYNC_24H_OBSERVATION_GREEN`) ist auf `master` dokumentiert

#### 2. `main` ist vollständig veraltet
- Keine relevanten laufenden Änderungen auf `main`
- README auf `main` ist eine veraltete ~120-Zeilen-Übersicht vs. ~400-Zeilen Operations-Doku auf `master`
- STATUS.md auf `main` zeigt einen veralteten Projektstatus
- Alle Scripts auf `main` sind veraltete Shell-Scripts (`.sh`), während `master` aktuelle `.mjs`/`.ps1`-Scripts hat
- 0 gemeinsame Commits — kein Wertverlust beim Wechsel des Defaults

#### 3. Technische Einfachheit
- Option A erfordert KEINE Git-Operationen
- Kein Merge, kein Rebase, kein Force-Push
- Nur eine Änderung im GitHub Repository Settings UI: `Default Branch: main → master`
- Die `main`-Historie bleibt vollständig erhalten (kein Branch-Delete)
- Rollback: Default Branch zurück auf `main` setzen (ebenfalls ein Klick)

#### 4. Risikoabwägung
- Das Risiko, dass `master` nicht der GitHub-Konvention (`main`) entspricht, ist AKZEPTABEL:
  - Keine externen CI/CD-Abhängigkeiten (keine GitHub Actions)
  - Keine externen Contributors (Single-User-Repository)
  - Repository ist funktional, nicht auf Konventionstreue optimiert
- Das Risiko durch Option B (Merge/Force-Push) ist HÖHER:
  - 591 Dateien im Diff
  - Merge-Konflikte bei README.md, STATUS.md, CHANGELOG.md, .gitignore
  - Force-Push auf Default Branch ist riskanter als ein simpler Setting-Wechsel

### Zielarchitektur

```
GitHub Repository: xxammaxx/n8n-blueprint-workflow
├── Default Branch: master ← CURRENT, ACTIVE
│   ├── HEAD: 1c9a68b (docs(ops): add comment sync 24h observation)
│   ├── GREEN_BASELINE.md ✓
│   ├── OPERATIONS_RUNBOOK.md ✓
│   ├── STATUS.md (COMMENT_SYNC_24H_OBSERVATION_GREEN) ✓
│   ├── scripts/ (aktuelle .mjs/.ps1 Scripts) ✓
│   └── evidence/ (vollständige Betriebs-Evidence) ✓
│
└── Historic Branch: main ← HISTORIC, READONLY
    ├── HEAD: 3687959 (docs: add verification session results)
    └── Enthält ursprüngliche Bootstrapping-Historie (28 Commits)
```

### Konkrete Schritte (nur nach Nutzer-Freigabe)

1. **GitHub UI öffnen:**
   `https://github.com/xxammaxx/n8n-blueprint-workflow/settings/branches`

2. **Default Branch ändern:**
   - Unter "Default branch" auf den Pfeil klicken
   - `master` auswählen
   - "Update" bestätigen
   - Optional: "I understand, update the default branch" bestätigen

3. **Verifikation:**
   - `https://github.com/xxammaxx/n8n-blueprint-workflow` öffnen
   - README von `master` wird angezeigt → "Spec Kit / OpenCode / n8n / Proxmox Runner Orchestrator"
   - GREEN_BASELINE.md, OPERATIONS_RUNBOOK.md sichtbar in Dateiliste
   - STATUS.md zeigt `COMMENT_SYNC_24H_OBSERVATION_GREEN`

4. **Dokumentation:**
   - CHANGELOG.md Eintrag
   - STATUS.md aktualisieren (Branch-Drift-Status dokumentieren)

### Rollback

Falls nötig, einfach zurückwechseln:
```
Settings → Branches → Default Branch → main → Update
```

### Stop-Grenzen

NICHT fortfahren, wenn:
- `main` enthält ungepushte Commits, die verloren gehen könnten → erst prüfen
- GitHub meldet Fehler beim Wechsel → dokumentieren, nicht erzwingen
- Externe Abhängigkeiten brechen (aktuell nicht relevant)
- Nutzer-Freigabe fehlt → keine Änderung ohne explizite Freigabe

### Nicht-Empfehlungen

- **Option B wird NICHT empfohlen**, weil:
  - Unrelated histories machen Merge/Force-Push riskant
  - 591 geänderte Dateien im Diff
  - Kein operativer Vorteil gegenüber Option A
  - Potenzielle Konflikte bei README.md, STATUS.md, .gitignore

- **Option C wird NICHT für langfristig empfohlen**, weil:
  - Technische Schuld akkumuliert
  - Je länger gewartet wird, desto schwieriger wird die spätere Korrektur
  - Besucher sehen weiterhin veralteten Stand
  - Nur als kurzfristige Übergangslösung akzeptabel

---

## Zusammenfassung

| Empfehlung | Option A |
|-------------|----------|
| **Aktion** | `master` als GitHub Default Branch setzen |
| **Git-Operationen** | Keine |
| **Risiko** | Minimal |
| **Rollback** | Trivial (Settings zurück) |
| **Benötigte Freigabe** | "Ich autorisiere: master als GitHub Default Branch setzen. Keine Branches löschen." |
