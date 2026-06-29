# GitHub Default Branch Reality

## Repository Metadata

| Field | Value |
|-------|-------|
| **Repository** | `xxammaxx/n8n-blueprint-workflow` |
| **GitHub Default Branch** | `main` |
| **Visibility** | public |
| **Archived** | no |
| **Description** | (keine gesetzt) |
| **Letzter Push (pushed_at)** | 2026-06-29T07:51:20Z |
| **Letztes Update (updated_at)** | 2026-06-27T04:14:59Z |

## Branch Protection

| Branch | Protection Status |
|--------|-------------------|
| `main` | **NICHT geschützt** (HTTP 404 — Branch not protected) |
| `master` | **NICHT geschützt** (HTTP 404 — Branch not protected) |

Keine Branch Protection Rules gesetzt. Force Push, Delete, und direkte Commits sind auf beiden Branches möglich.

## Offene Pull Requests

**Keine.** (`gh pr list` returned `[]`)

## GitHub Actions

**Keine.** (`gh workflow list` returned empty)

## README-Vergleich

### Default Branch (`main`) README
- Titel: "n8n Blueprint Workflow - Source of Truth"
- ~120 Zeilen
- Allgemeine Architektur-Übersicht
- Verweist auf veraltete Dateien (`docs/github-source-of-truth.md`, `docs/github-issue-intake-runbook.md`)
- Kein Betriebsstatus (GREEN_BASELINE, Comment Sync etc.)
- **VERALTET** — reflektiert Stand von ~2026-06-27 04:14 UTC

### Master Branch README
- Titel: "Spec Kit / OpenCode / n8n / Proxmox Runner Orchestrator"
- ~400+ Zeilen
- Detailierter operationaler Status: `GREEN_BASELINE_FROZEN`
- Scan-Ergebnisse, API-Key-Setup, Windows-Workarounds
- Vollständige Evidence-Trail-Dokumentation
- Setup-Anleitungen, Troubleshooting
- **AKTUELL** — reflektiert laufenden Betrieb

## STATUS.md-Vergleich (geschätzt)

| Branch | Erwarteter Status |
|--------|-------------------|
| `main` | Veralteter Status (Dispatcher-Green-Baseline, kein Comment Sync) |
| `master` | `COMMENT_SYNC_24H_OBSERVATION_GREEN` |

## Auswirkung auf Besucher

Ein GitHub-Besucher, der `https://github.com/xxammaxx/n8n-blueprint-workflow` öffnet, sieht:
1. **README von `main`** — eine veraltete Architektur-Übersicht ohne aktuellen Betriebsstatus
2. **Dateiliste von `main`** — ohne aktuelle Evidence (GREEN_BASELINE, Comment-Sync), ohne aktuelle Scripts (validate-secret-hygiene.mjs, dispatcher-health-check.mjs), ohne OPERATIONS_RUNBOOK.md
3. **Letzten Commit von `main`** — 27.06.2026 (2 Tage alt)

Der Besucher bekommt den Eindruck eines Projekts mit Stand von vor 2 Tagen, obwohl auf `master` aktuellste Betriebsdokumentation liegt (letzter Commit vor ~2 Stunden).

## Fazit

Der GitHub Default Branch `main` repräsentiert einen veralteten Projektstand. Die aktuelle Source of Truth (`master`) ist für Besucher ohne expliziten Branch-Wechsel nicht sichtbar. Dies ist ein **Governance-Problem**.

### Einstufung: YELLOW_BRANCH_DRIFT_RISK
- Kein Datenverlust
- Kein Secret-Leak
- Aber: irreführende Projekt-Darstellung für Besucher
- Potenzielle Verwirrung für neue Contributors
- Automatisierungen könnten Default Branch verwenden
