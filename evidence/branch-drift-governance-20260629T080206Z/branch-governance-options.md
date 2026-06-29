# Branch Governance Options

## Ausgangslage

- Default Branch: `main` (veraltet, 28 Commits, Root `9e41bba`, HEAD `3687959`)
- Betriebsbranch: `master` (aktuell, 26 Commits, Root `5088845`, HEAD `1c9a68b`)
- **Unrelated histories** — kein gemeinsamer Vorfahre
- Diff: 591 files, +61,743 / -10,300

---

## Option A — `master` als GitHub Default Branch setzen

### Beschreibung
Den GitHub Default Branch von `main` auf `master` ändern. `main` bleibt als historischer Branch erhalten (kein Delete). Kein Merge nötig.

### Vorteile
- Kein Merge-Risiko (keine Konfliktauflösung)
- Aktueller Betriebsstand sofort auf GitHub-Projektseite sichtbar
- README, STATUS.md, GREEN_BASELINE.md, OPERATIONS_RUNBOOK.md sofort für Besucher verfügbar
- Minimaler Eingriff — nur eine GitHub-Einstellung ändern
- `master` ist bereits die etablierte Source of Truth für alle Agenten und den n8n-Dispatcher

### Risiken
- `master` als Default Branch weicht von moderner GitHub-Konvention ab (viele Projekte verwenden `main`)
- Externe Links oder CI/CD-Tools, die `main` erwarten, müssten aktualisiert werden (aktuell keine GitHub Actions vorhanden — geringes Risiko)
- Der alte `main`-Branch bleibt sichtbar und könnte Verwirrung stiften (zwei Branches mit unterschiedlichem Inhalt)
- Default-Branch-Wechsel ist eine Repository-Governance-Änderung mit dokumentarischer Bedeutung

### Konkrete Schritte (nur nach Freigabe)
1. GitHub UI: Settings → Branches → Default Branch auf `master` ändern
2. Prüfen, dass `master` als Default auf der Projektseite erscheint
3. README auf `master` prüfen (wird jetzt auf Projektseite angezeigt)
4. Optional: `main` mit einem Hinweis-Commit versehen (z.B. "archived — see master branch")
5. Dokumentation aktualisieren (STATUS.md, CHANGELOG.md)

### Geschätzte Risikostufe: NIEDRIG
(Keine Git-Operationen nötig, nur GitHub-Setting)

---

## Option B — `master` nach `main` synchronisieren und `main` als Default behalten

### Beschreibung
Den Inhalt von `master` nach `main` übertragen, sodass `main` wieder den aktuellen Stand enthält. Da die Historien unrelated sind, ist dies technisch aufwändiger.

### Vorteile
- GitHub-Konvention (`main` als Default) bleibt erhalten
- Default Branch enthält echten aktuellen Stand
- Kein Default-Branch-Wechsel nötig (weniger Governance-Änderung)
- `master`-Historie bleibt optional erhalten

### Risiken
- **Merge-Konfliktrisiko**: Da unrelated histories, muss `git merge --allow-unrelated-histories` verwendet werden
- **Diff-Größe**: 591 geänderte Dateien, 61,743 Zeilen hinzugefügt, 10,300 gelöscht — Konfliktwahrscheinlichkeit bei strukturellen Unterschieden
- **Verlust der `main`-Historie**: Bei Reset-Strategie geht die ursprüngliche Bootstrapping-Historie verloren
- **Automatisierungen**: Merge könnte GitHub Events auslösen (aktuell keine Actions — aber zukünftiges Risiko)
- **`master` könnte stale werden**: Wenn nur `main` weiterentwickelt wird, driftet `master` erneut

### Technische Optionen für die Synchronisation

#### B1: `main` auf `master` resetten (--allow-unrelated-histories)
```bash
git checkout main
git reset --hard master
git push origin main --force-with-lease
```
- Verliert die gesamte `main`-Historie
- Sauberster Weg, aber destruktiv für `main`-Historie

#### B2: `master` in `main` mergen (--allow-unrelated-histories)
```bash
git checkout main
git merge master --allow-unrelated-histories -m "merge: sync master into main"
git push origin main
```
- Erhält beide Historien
- Merge-Commit dokumentiert die Zusammenführung
- Potenzielle Merge-Konflikte bei README.md, STATUS.md, CHANGELOG.md, .gitignore
- "Octopus-Merge"-History, die schwer lesbar sein kann

#### B3: `main`-Historie sichern, dann `main` durch `master` ersetzen
```bash
# Alte main-Historie sichern
git branch main-historic origin/main
# main auf master zurücksetzen
git push origin master:main --force-with-lease
```
- `main`-Historie bleibt im Branch `main-historic` erhalten
- `main` wird exakter Klon von `master`
- Sauberer Zustand, aber destruktiv für `main`

### Geschätzte Risikostufe: MITTEL-HOCH
(Merge-Konflikte, Force-Push, zwei Historien vereinen)

---

## Option C — Nichts ändern, nur dokumentieren

### Beschreibung
Den aktuellen Zustand belassen. `main` bleibt Default Branch und enthält veralteten Stand. `master` bleibt operativer Branch. Drift wird dokumentiert.

### Vorteile
- Kein Risiko durch Git-Operationen
- Kein Risiko durch GitHub-Settings-Änderungen
- Sofort sicher — keine unbeabsichtigten Nebeneffekte
- Keine Force-Pushes, keine Merges, keine Default-Branch-Änderung

### Risiken
- Drift bleibt bestehen — langfristiges Governance-Problem
- Besucher sehen weiterhin veralteten Stand
- Neue Agenten/Benutzer könnten versehentlich `main` als Source of Truth verwenden
- Dokumentation und Betrieb laufen auf unterschiedlichen Branches
- Zukünftige Automatisierung (GitHub Actions) könnte falschen Branch verwenden
- Technische Schuld akkumuliert — je länger gewartet wird, desto schwieriger die Synchronisation

### Geschätzte Risikostufe: NIEDRIG (kurzfristig), MITTEL (langfristig)

---

## Vergleichstabelle

| Kriterium | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| **Betriebsrisiko** | Minimal (nur GitHub Setting) | Mittel-Hoch (Merge/Force-Push) | Keines |
| **Governance-Konformität** | Abweichung von `main`-Konvention | Konform mit `main`-Konvention | Drift bleibt |
| **Besucher-Sicht** | Sofort aktuell | Sofort aktuell | Veraltet |
| **Historie-Erhalt** | Beide vollständig | Abhängig von Strategie (B1-B3) | Beide vollständig |
| **Dauerhafter Zustand** | Neuer Default = `master` | Default bleibt `main`, `master` synchron | Drift bleibt |
| **Rollback-Aufwand** | Minimal (Setting zurück) | Mittel (kann Force-Push erfordern) | Keiner |
| **Empfohlen bei** | `master` ist klare Source of Truth | `main`-Konvention wichtig | Unsicherheit oder Zeitmangel |
