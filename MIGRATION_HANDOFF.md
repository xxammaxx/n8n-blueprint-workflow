# Migration Handoff – Old Machine → New Machine

## Projekt

- **Projektname:** `n8n-blueprint-workflow` (Spec-kit_n8n)
- **Repository-URL:** `https://github.com/xxammaxx/n8n-blueprint-workflow.git`
- **Default Branch:** `master`
- **Letzter sicherer Betriebsstatus:** `FINAL_OPERATIONS_BASELINE_PUSHED` → `REPO_HYGIENE_GREEN`

---

## Aktuelle Betriebsumgebung (Old Machine)

| Komponente | Wert |
|------------|------|
| n8n Live-Instanz | `http://192.168.1.52:5678` |
| n8n Workflow-ID | `Sv12QTo56NoPUu2D` |
| Runner | `lxc-dev-runner` / `192.168.1.53` |
| DeepSeek Provider | Eingerichtet, lokale Secrets nicht im Repository |
| OS (lokal) | Windows 10 Pro Education |
| Hostname | AQcer |

---

## Kommentar-Sync Mechanismus

- Nutzt `status.json` als Datenquelle
- Workflow läuft auf n8n-Instanz (`http://192.168.1.52:5678`)
- Automatisiertes Posten von Kommentaren zu GitHub Issues
- Status ausgelagert in `status.json` → vom n8n-Workflow gelesen

---

## Issue-Status (Stand 2026-06-29)

| Issue | Status |
|-------|--------|
| #3–#8 | Geschützt (Protected Baseline) |
| #9–#16 | Geschlossen |

---

## Sicherheitsstatus

| Punkt | Status |
|-------|--------|
| Token-Leak | **Bekannt** – `.playwright-mcp/console-2026-06-27T06-36-53-859Z.log` in Commit `485dc18` |
| API Key `spec-kit_n8n` | **Widerrufen** |
| Aktive Session | **Beendet** |
| n8n Passwort | **Noch nicht geändert** – Nutzeraufgabe |
| Neuer API Key lokal | **Noch nicht erzeugt** – Nutzeraufgabe |
| 2FA | **Optional** – noch nicht aktiviert |

---

## Was NICHT über GitHub übertragen wird

Bei Clone auf neuem Rechner sind folgende Daten **nicht** im Repository:

| Daten | Grund |
|-------|-------|
| Secrets (`secrets/`) | Von `.gitignore` ausgeschlossen |
| `.env.local` | Von `.gitignore` ausgeschlossen |
| `.playwright-mcp/` Sitzungen | Von `.gitignore` ausgeschlossen (neu) |
| SQLite/DB-Backups (`*.db`, `*.sqlite`, `*.bak`) | Von `.gitignore` ausgeschlossen |
| Lokale Browser-Sessions | Nicht im Repository |
| n8n API Keys | Nicht im Repository |
| DeepSeek API Keys | Nur lokal in `.env`-Dateien |

---

## Setup-Schritte für neuen Rechner

Siehe `docs/NEW_MACHINE_SETUP.md` für detaillierte Anleitung.

Kurzzusammenfassung:

1. **Repository klonen** von `https://github.com/xxammaxx/n8n-blueprint-workflow.git`
2. **Branch `master`** auschecken
3. **Zustand prüfen:** `git status`, `git log --oneline -10`
4. **Lokale Secrets anlegen** aus `.env.example` – KEINE Secrets aus Git erwarten
5. **n8n API Key** nur lokal speichern (nicht im Repository)
6. **Playwright-Session** neu erzeugen (nicht vom alten Rechner kopieren)
7. **Health-Check** ausführen (read-only)
8. **Runtime erst ändern** wenn Baseline validiert ist

---

## Offene Remediation

| Aufgabe | Status | Priorität |
|---------|--------|-----------|
| n8n Passwort ändern | 🔴 Offen | Hoch |
| Neuen API Key lokal erzeugen | 🔴 Offen | Hoch |
| 2FA aktivieren (optional) | 🟡 Offen | Mittel |
| History-Rewrite-Entscheidung | 🟡 Später entscheiden | Niedrig |

---

## Wichtige Hinweise

- **Alte Maschine bleibt Source of Truth** bis neuer Rechner validiert ist
- **Keine Secrets in diesem Dokument** – alle Werte redacted
- **Keine Runtime-Änderung** durch diesen Handoff
- **Kein History-Rewrite** in diesem Lauf
- **Kein Force Push** in diesem Lauf

---

## Evidence aus Preflight

Siehe `evidence/migration-handoff-old-machine-2026-06-29_12-22-20/`:
- `preflight.md` – System- und Git-Status
- `git-remote-sync-check.md` – Remote-Sync-Validierung
- `secret-hygiene-before-migration-handoff.md` – Secret-Scan-Ergebnisse
