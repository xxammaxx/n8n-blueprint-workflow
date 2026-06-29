# Branch Drift Risk Analysis

## Zusammenfassung

Zwei Branches mit **vollständig getrennten Historien** (unrelated histories) existieren im Repository:
- `main`: Default Branch auf GitHub, 28 Commits, Root `9e41bba`, HEAD `3687959` (27.06.2026)
- `master`: Aktueller Betriebsbranch, 26 Commits, Root `5088845`, HEAD `1c9a68b` (29.06.2026, 09:51)

Kein gemeinsamer Vorfahre. Beide Bäume sind komplett getrennt.

## Risikobewertung

### Risiko 1: Falsche Projekt-Darstellung für GitHub-Besucher
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | HOCH |
| **Beschreibung** | Besucher von `github.com/xxammaxx/n8n-blueprint-workflow` sehen README und Dateien von `main`, nicht den aktuellen Betriebsstand von `master`. |
| **Auswirkung** | Der Eindruck eines veralteten Projekts entsteht. Aktuelle Dokumente wie GREEN_BASELINE.md, OPERATIONS_RUNBOOK.md, Comment-Sync-Evidence sind unsichtbar. |
| **Wahrscheinlichkeit** | Sicher — tritt bei jedem Besuch auf |

### Risiko 2: Neue PRs gegen falschen Branch
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | MITTEL |
| **Beschreibung** | GitHub schlägt bei `New Pull Request` standardmäßig `main` als Base vor. Externe Contributors würden PRs gegen einen veralteten Branch öffnen. |
| **Auswirkung** | PRs müssten manuell umgeleitet werden oder würden auf veraltetem Stand basieren. |
| **Wahrscheinlichkeit** | Mittel — nur bei externen Contributions relevant |

### Risiko 3: Widersprüchliche Issues/Docs/Evidence
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | MITTEL |
| **Beschreibung** | Issues referenzieren möglicherweise Commits/Dokumente auf `main`, die auf `master` anders/nicht existieren. STATUS.md auf `main` zeigt veralteten Status. |
| **Auswirkung** | Verwirrung bei der Nachverfolgung des Projektstatus |
| **Wahrscheinlichkeit** | Bestehend — STATUS.md und README divergieren |

### Risiko 4: Automatisierungen nutzen falschen Branch
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | MITTEL |
| **Beschreibung** | GitHub Actions (nicht vorhanden) oder externe Tools könnten den Default Branch (`main`) verwenden und veralteten Code/Config referenzieren. |
| **Auswirkung** | Aktuell nicht relevant (keine Actions), aber zukünftige Automatisierung gefährdet |
| **Wahrscheinlichkeit** | Niedrig — aktuell keine GitHub Actions |

### Risiko 5: Lokale Agenten vs. GitHub UI
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | MITTEL |
| **Beschreibung** | Issue-Orchestrator und andere Agenten arbeiten auf `master`, GitHub UI zeigt `main`. n8n-Dispatcher nutzt `master` als Source-of-Truth. |
| **Auswirkung** | Diskrepanz zwischen operativer Realität (`master`) und öffentlicher Darstellung (`main`) |
| **Wahrscheinlichkeit** | Bestehend — betrifft jeden Lauf |

### Risiko 6: Fehlende DeepSeek-/Dispatcher-Dokumentation auf Default Branch
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | MITTEL |
| **Beschreibung** | DeepSeek-Provider-Integration, Dispatcher-Runner-Konfiguration und Comment-Sync-Dokumentation existieren nur auf `master`. |
| **Auswirkung** | Externe Nutzer finden keine Dokumentation zur aktuellen Betriebskonfiguration |
| **Wahrscheinlichkeit** | Sicher |

### Risiko 7: Kein einfacher Merge möglich
| Aspekt | Bewertung |
|--------|-----------|
| **Schweregrad** | HOCH |
| **Beschreibung** | Da die Historien keinen gemeinsamen Vorfahren haben, ist ein normaler Merge oder Fast-Forward nicht möglich. `git merge --allow-unrelated-histories` wäre nötig — mit Konfliktrisiko. |
| **Auswirkung** | Option B (master → main synchronisieren) ist technisch aufwändiger und risikoreicher als üblich |
| **Wahrscheinlichkeit** | Sicher — technische Realität |

## Gesamtstatus

### RED_BRANCH_CONFLICT

Begründung:
1. **Unrelated histories** — keine gemeinsame Basis, kein einfacher Merge
2. **Default Branch zeigt veralteten Stand** — Besucher sehen falsche Projekt-Realität
3. **Operativer Betrieb auf anderem Branch** — alle Agenten, n8n-Dispatcher, Orchestrator arbeiten auf `master`
4. **Kein Datenverlust-Risiko**, aber **Governance-Problem** mit Auswirkung auf Sichtbarkeit und Beitragsprozesse
