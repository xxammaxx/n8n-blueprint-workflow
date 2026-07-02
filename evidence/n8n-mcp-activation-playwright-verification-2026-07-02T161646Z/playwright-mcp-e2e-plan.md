# Playwright MCP E2E Plan

## Date/Time (UTC)
**2026-07-02T16:21:00Z**

## Status
**PENDING** — Kein echter E2E-Run in diesem Lauf. Nur Plan-Dokumentation.

## Erforderliche Freigabe
Ein E2E-Smoke-Test erfordert die explizite Freigabe:

```
Ich autorisiere einen read-only Playwright MCP E2E-Smoke-Test gegen n8n. Keine Workflow-Änderungen, keine Screenshots mit Secrets.
```

## E2E Smoke Test Plan (später, nach Freigabe)

### Setup
- Browser: Chromium, headless
- Session: `--isolated` (kein Disk-Persist)
- Ziel: `http://192.168.1.52:5678`

### Smoke-Prüfungen (read-only)

| Nr. | Prüfung                    | Was validiert wird                          |
|-----|----------------------------|---------------------------------------------|
| 1   | n8n UI erreichbar          | HTTP 200, Login-Page lädt                   |
| 2   | Workflow-Liste sichtbar    | (nach Login) Workflows werden angezeigt     |
| 3   | Dispatcher Workflow        | Workflow "Sv12QTo56NoPUu2D" sichtbar        |
| 4   | Schedule Trigger            | Schedule Trigger Node im Dispatcher vorhanden|
| 5   | Format Final Result Node   | Node im Workflow sichtbar                   |
| 6   | Keine Secrets sichtbar     | Screenshot enthält keine Tokens/API-Keys    |
| 7   | Keine Workflow-Änderung    | Nur read-only Navigation                    |

### Evidence
- Screenshots NUR ohne sensitive Inhalte
- DOM Snapshots als Backup
- Keine Cookie-Extraktion
- Keine Token in Screenshots

### Ausschlüsse
- KEINE Workflow-Erstellung
- KEIN Workflow-Update
- KEIN Workflow-Löschen
- KEINE Credential-Anzeige
- KEINE API-Key-Anzeige
- KEIN Workflow-Execution/Activation

### Vorbedingungen
1. n8n UI mit Login erreichbar
2. Nutzer hat sich eingeloggt (manuell oder per Session)
3. Dispatcher Workflow existiert

### Risiken
- Login-Formular könnte Token im Screenshot zeigen → Bereich zensieren
- Workflow-Liste könnte sensitive Namen zeigen → vor Screenshot prüfen

## Nach dem E2E-Test
- Status dokumentieren
- Screenshots in Evidence ablegen
- Kein Commit von Screenshots mit Secrets
