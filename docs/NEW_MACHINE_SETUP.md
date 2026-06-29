# New Machine Setup Guide

> Diese Anleitung beschreibt die Einrichtung des Projekts `n8n-blueprint-workflow` auf einem neuen Rechner.
> **Keine Secrets aus Git erwarten** – alle sensiblen Werte müssen lokal neu angelegt werden.

---

## 1. Repository klonen

```powershell
git clone https://github.com/xxammaxx/n8n-blueprint-workflow.git C:\Spec-kit_n8n
cd C:\Spec-kit_n8n
git checkout master
```

---

## 2. Zustand prüfen

```powershell
git status
git log --oneline --decorate -10
```

Erwartete Ausgabe:
- Auf `master` und synchron mit `origin/master`
- Keine uncommitteten Änderungen
- Letzter Commit enthält `docs(ops): add migration handoff for new machine`

---

## 3. .gitignore prüfen

```powershell
Get-Content .gitignore
```

Stelle sicher, dass folgende Muster vorhanden sind:

| Muster | Schützt vor |
|--------|-------------|
| `.env.local` | Lokale Environment-Variablen |
| `secrets/` | Secret-Dateien |
| `.playwright-mcp/` | Playwright-Sitzungsdaten |
| `*.db`, `*.sqlite`, `*.bak` | Datenbank-Backups |

---

## 4. Lokale Secrets anlegen

**Keine Secrets aus Git kopieren.** Erstelle alle Secrets manuell aus den Templates:

### 4.1 `.env`-Datei

Kopiere `.env.example` nach `.env.local` und fülle die Werte:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

### 4.2 DeepSeek Provider

Der DeepSeek Provider ist im Repository konfiguriert (Provider-Setup). Die API Keys müssen lokal hinterlegt werden:

- Siehe `scripts/` für Provider-Integration
- Lege `secrets/` an: `New-Item -ItemType Directory -Path secrets -Force`
- Speichere API Keys in lokalen, von `.gitignore` geschützten Dateien

### 4.3 n8n API Key

```powershell
# NICHT in git-commiteten Dateien speichern!
# Nur in .env.local oder secrets/ ablegen
```

1. Öffne n8n UI: `http://192.168.1.52:5678`
2. Gehe zu Settings → API Keys
3. Erzeuge einen neuen API Key
4. Speichere ihn lokal in `.env.local`

---

## 5. Health-Check (Read-Only)

Führe einen read-only Health-Check durch, bevor du die Runtime änderst:

```powershell
# Prüfe ob n8n erreichbar ist
curl http://192.168.1.52:5678/healthz

# Prüfe Git-Zustand
git status
git log --oneline -5
```

---

## 6. Playwright-Session neu erzeugen

Playwright-Sitzungen werden NICHT aus dem alten Rechner übernommen. Neu erzeugen:

```powershell
# Installiere Playwright (falls nicht vorhanden)
npm init playwright@latest

# Führe eine neue Test-Session aus
npx playwright test
```

---

## 7. Migration validieren

Prüfe die Übergabe:

1. `MIGRATION_HANDOFF.md` gelesen
2. `docs/NEW_MACHINE_SETUP.md` befolgt
3. `evidence/migration-handoff-old-machine-<TIMESTAMP>/` vorhanden
4. Git-Status zeigt sauberen Zustand auf `master`
5. n8n-Workflow `Sv12QTo56NoPUu2D` erreichbar

---

## 8. Runtime erst ändern, wenn Baseline validiert ist

Erst wenn alle Health-Checks grün sind:

1. n8n Passwort ändern
2. Neuen API Key lokal speichern
3. 2FA optional aktivieren
4. History-Rewrite-Plan erstellen (später)
5. Alte Maschine ausser Betrieb nehmen

---

## Wichtige Hinweise

- **Keine Secrets aus Git erwarten** – das Repository enthält keine echten Secrets
- **Alte Maschine bleibt Source of Truth** bis neuer Rechner validiert ist
- **Keine Runtime-Änderung** vor erfolgreichem Health-Check
- **Keine Playwright-Sessions vom alten Rechner kopieren** – neu erzeugen
- **Keine `.env.local`/`secrets/` committen** – von `.gitignore` geschützt
- **Kein Force Push** – History-Rewrite erst nach separater Entscheidung

---

## Offene Aufgaben nach Setup

| Aufgabe | Anleitung |
|---------|-----------|
| n8n Passwort ändern | n8n UI → Settings → Security |
| Neuen API Key erzeugen | n8n UI → Settings → API Keys |
| 2FA aktivieren (optional) | n8n UI → Settings → Security → 2FA |
| History-Rewrite-Plan erstellen | Nach Token-Rotation entscheiden |
| Alte Maschine deaktivieren | Erst nach vollständiger Validierung |
