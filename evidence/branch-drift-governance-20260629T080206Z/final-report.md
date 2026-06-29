# Final Report — Branch Drift Governance Analysis

## 1. Kurzfazit

Die Branches `main` und `master` im Repository `xxammaxx/n8n-blueprint-workflow` haben **vollständig getrennte Historien** (unrelated histories). `master` ist die aktuelle Source of Truth für alle operativen Abläufe. `main` (der GitHub Default Branch) zeigt einen veralteten Stand und irreführende Projektdarstellung für Besucher. Eine Korrektur ist empfohlen, wurde aber nicht automatisch durchgeführt.

## 2. Statusentscheidung

| Entscheidung | Wert |
|-------------|------|
| **Branch Drift Status** | `RED_BRANCH_CONFLICT` |
| **Governance Readiness** | `GREEN_BRANCH_GOVERNANCE_READY` |
| **Secret Hygiene** | `GREEN_SECRET_HYGIENE` |

## 3. Branch Reality

| Feld | `origin/main` | `origin/master` |
|------|--------------|-----------------|
| **HEAD Commit** | `3687959` | `1c9a68b` |
| **HEAD Datum** | 2026-06-27 06:14 +0200 | 2026-06-29 09:51 +0200 |
| **Root Commit** | `9e41bba` | `5088845` |
| **Total Commits** | 28 | 26 |
| **Gemeinsame Commits** | 0 | 0 |
| **Aktueller Branch** | — | `master` (HEAD) |
| **GitHub Default** | `main` | — |
| **Diff (main..master)** | 591 files, +61,743 / -10,300 | — |

## 4. Source of Truth

**Branch:** `master`

**Begründung:**
- Alle aktuellen Agenten arbeiten auf `master`
- n8n Dispatcher (`Sv12QTo56NoPUu2D`) referenziert `master`
- Letzter Commit vor ~2 Stunden (`1c9a68b`)
- Enthält GREEN_BASELINE.md, OPERATIONS_RUNBOOK.md, Comment-Sync-Dokumentation
- STATUS.md zeigt `COMMENT_SYNC_24H_OBSERVATION_GREEN`
- `main` enthält nur veraltete Bootstrapping-Historie (28 Commits, Ende 27.06.)

## 5. Risiken

| # | Risiko | Schweregrad |
|---|--------|-------------|
| 1 | Falsche Projekt-Darstellung für GitHub-Besucher | HOCH |
| 2 | Kein einfacher Merge möglich (unrelated histories) | HOCH |
| 3 | Neue PRs gegen falschen Branch | MITTEL |
| 4 | Widersprüchliche Issues/Docs/Evidence | MITTEL |
| 5 | Automatisierungen nutzen falschen Branch | MITTEL |
| 6 | Lokale Agenten vs. GitHub UI | MITTEL |
| 7 | Fehlende Dokumentation auf Default Branch | MITTEL |

## 6. Optionen

### Option A — `master` als GitHub Default Branch setzen ⭐ EMPFOHLEN
- Kein Merge-Risiko
- Aktueller Stand sofort sichtbar
- Minimaler Eingriff (nur GitHub Setting)
- Rollback trivial (Setting zurück)

### Option B — `master` → `main` synchronisieren, `main` als Default
- Erhält GitHub-Konvention (`main`)
- Technisch aufwändiger (unrelated histories, Merge-Konflikte möglich)
- Risiko: Mittel-Hoch

### Option C — Nichts ändern, nur dokumentieren
- Kein Risiko
- Drift bleibt — langfristiges Governance-Problem

## 7. Empfehlung

**Option A: `master` als GitHub Default Branch setzen.**

Die Implementierung erfordert nur eine Änderung in den GitHub Repository Settings — keine Git-Operationen, keine Merges, keine Force-Pushes.

## 8. Apply-Plan

Benötigte Freigabe (exakt):
```
Ich autorisiere: master als GitHub Default Branch setzen. Keine Branches löschen.
```

Detaillierter Apply-Plan: `evidence/branch-drift-governance-20260629T080206Z/branch-governance-apply-plan.md`

## 9. Sicherheitsprüfung

| Check | Status |
|-------|--------|
| Keine Secrets ausgegeben | ✅ |
| Keine Branch-Änderung | ✅ |
| Kein Merge | ✅ |
| Kein Force Push | ✅ |
| Keine Workflow-Änderung | ✅ |
| Keine SQLite-Änderung | ✅ |
| Keine Runner-Änderung | ✅ |
| Keine Issues verändert | ✅ |
| Keine GitHub Actions | ✅ |
| Secret Hygiene grün | ✅ |

## 10. Geänderte Dateien

| Datei | Typ |
|-------|-----|
| `CHANGELOG.md` | Dokumentation (aktualisiert) |
| `STATUS.md` | Dokumentation (aktualisiert) |
| `evidence-index/latest.md` | Dokumentation (aktualisiert) |
| `evidence/branch-drift-governance-20260629T080206Z/` | Neue Evidence (9 Dateien) |

## 11. Commit / Push

| Feld | Wert |
|------|------|
| **Commit** | `fde3b6c` — `docs(repo): analyze main master branch drift` |
| **Gepusht** | **Noch nicht** — wartet auf Nutzer-Freigabe |
| **Branch** | `master` (lokal) |

## 12. Was noch offen ist

1. **Push:** Commit `fde3b6c` muss nach `origin/master` gepusht werden
2. **Freigabe:** Nutzer muss Option A/B/C autorisieren
3. **Apply:** Nach Freigabe: Default Branch in GitHub Settings ändern
4. **Verifikation:** README auf GitHub-Projektseite nach Apply prüfen
5. **Dummy Issue Cleanup:** Issues #9-#16 schließen (separate Aufgabe)

## 13. Nächster sinnvoller Schritt

1. **Push freigeben und durchführen** (damit Evidence auf Remote sichtbar ist)
2. **Option A autorisieren** mit: _"Ich autorisiere: master als GitHub Default Branch setzen. Keine Branches löschen."_
3. **Apply durchführen** (Default Branch in GitHub Settings ändern)
4. **Verifikation** und STATUS.md-Update
