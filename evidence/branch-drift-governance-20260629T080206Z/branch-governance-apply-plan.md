# Branch Governance Apply Plan

## ⚠️ WICHTIG: Keine Änderung ohne explizite Nutzer-Freigabe

Dieser Apply-Plan beschreibt NUR die durchzuführenden Schritte. Keine Aktion wird ohne eine der unten aufgeführten expliziten Freigaben ausgeführt.

---

## Vorbereitung (vor JEDER Option)

1. `git fetch --all --prune` im Arbeitsverzeichnis `C:\Spec-kit_n8n`
2. `git status` prüfen — Working Tree muss clean sein
3. `git log --oneline -3 origin/master` — HEAD auf `master` bestätigen
4. `git log --oneline -3 origin/main` — HEAD auf `main` bestätigen
5. Secret-Hygiene-Check: `scripts/validate-secret-hygiene.mjs` ausführen (falls vorhanden)
6. Diff-Größe bestätigen: `git rev-list --left-right --count origin/main...origin/master`
7. Keine offenen PRs: `gh pr list --state open`

---

## Apply Option A — `master` als Default Branch setzen

### Benötigte Freigabe:
```
Ich autorisiere: master als GitHub Default Branch setzen. Keine Branches löschen.
```

### Schritte:

#### A1. GitHub UI
1. Öffne: `https://github.com/xxammaxx/n8n-blueprint-workflow/settings/branches`
2. Unter "Default branch" den Pfeil klicken
3. `master` auswählen
4. "Update" klicken
5. Bestätigungsdialog akzeptieren

#### A2. Verifikation
1. Projektseite öffnen: `https://github.com/xxammaxx/n8n-blueprint-workflow`
2. Prüfen: README von `master` wird angezeigt
3. Prüfen: GREEN_BASELINE.md, OPERATIONS_RUNBOOK.md in Dateiliste sichtbar
4. Prüfen: STATUS.md zeigt `COMMENT_SYNC_24H_OBSERVATION_GREEN`

#### A3. Lokale Bestätigung
```bash
gh api repos/xxammaxx/n8n-blueprint-workflow --jq '.default_branch'
# Erwartet: "master"
```

#### A4. Dokumentation aktualisieren
- `STATUS.md`: Branch-Drift-Status aktualisieren
- `CHANGELOG.md`: Eintrag hinzufügen
- Optional: README auf `main` mit Hinweis versehen (separater Commit)

#### A5. Rollback (falls nötig)
- GitHub UI → Settings → Branches → Default Branch → `main` → Update
- Keine Daten verloren, nur Setting zurückgesetzt

### Stop-Grenzen
- GitHub meldet Fehler beim Wechsel → NICHT erzwingen
- Verifikation schlägt fehl (README nicht aktuell) → Rollback, dokumentieren
- Unerwartete Nebeneffekte → sofort Rollback

---

## Apply Option B — `master` nach `main` synchronisieren, `main` als Default behalten

### Benötigte Freigabe:
```
Ich autorisiere: master nach main synchronisieren, main als Default behalten. Kein Force Push.
```

### Strategie: B1 — `main` auf `master` resetten (empfohlen, wenn Freigabe B erteilt)

#### B1.1 Historie sichern
```bash
git branch main-historic origin/main
git push origin main-historic
```

#### B1.2 main synchronisieren
```bash
git checkout main
git reset --hard origin/master
git push origin main --force-with-lease
```

#### B1.3 Verifikation
```bash
gh api repos/xxammaxx/n8n-blueprint-workflow/commits?sha=main --jq '.[0].sha'
# Erwartet: 1c9a68b...
git diff --stat origin/main origin/master
# Erwartet: 0 files changed (identisch)
```

#### B1.4 Aufräumen
```bash
git checkout master
```

### Stop-Grenzen
- Force-Push wird abgelehnt (trotz `--force-with-lease`) → NICHT `--force` verwenden, dokumentieren
- `git diff origin/main origin/master` zeigt Unterschiede → Synchronisation fehlgeschlagen
- Alte `main`-Historie ist relevant → Option A stattdessen erwägen

### Rollback
```bash
git checkout main
git reset --hard main-historic
git push origin main --force-with-lease
```

---

## Apply Option C — Keine Branch-Änderung, Drift nur dokumentieren

### Benötigte Freigabe:
```
Ich autorisiere: keine Branch-Änderung, Drift nur dokumentieren.
```

### Schritte:
1. Keine Git-Operationen
2. Nur Dokumentation in diesem Evidence-Ordner belassen
3. STATUS.md, CHANGELOG.md aktualisieren mit Drift-Vermerk

### Stop-Grenzen
Keine — keine Änderungen durchgeführt.

---

## Sicherheitsregeln für ALLE Optionen

| Regel | Status |
|-------|--------|
| Kein Force Push ohne explizite Freigabe | Pflicht |
| Kein Branch Delete | Pflicht |
| Keine GitHub Actions auslösen | Pflicht |
| Vor jedem Apply: Secret-Hygiene prüfen | Pflicht |
| Vor jedem Apply: Git-Status prüfen | Pflicht |
| Nach jedem Apply: Verifikation | Pflicht |
| Keine Änderung ohne Nutzer-Freigabe | Pflicht |

---

## Freigabe-Übersicht

| Option | Freigabetext |
|--------|-------------|
| **A** | `Ich autorisiere: master als GitHub Default Branch setzen. Keine Branches löschen.` |
| **B** | `Ich autorisiere: master nach main synchronisieren, main als Default behalten. Kein Force Push.` |
| **C** | `Ich autorisiere: keine Branch-Änderung, Drift nur dokumentieren.` |
