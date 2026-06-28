# Preflight Report — Local OpenCode Credential Transfer

## Environment

| Field | Value |
|-------|-------|
| Datum/Zeit UTC | 2026-06-28T06:09:08Z |
| Hostname | AQcer |
| OS | Microsoft Windows NT 10.0.19045.0 |
| Shell | PowerShell 5.1.19041.6456 |
| Git-Status | Modified: n8n-signin-page.png; Untracked: playwright logs, evidence dirs |
| Branch | master |
| Letzter Commit | 77bb08a — `chore(runner): add safe opencode credential copy script` |
| Lokaler Benutzername | xxammaxx |

## Runner Status

| Field | Value |
|-------|-------|
| Runner IP | 192.168.1.53 |
| Runner erreichbar | ja (ping OK) |

## Existing Artifacts

| Field | Value |
|-------|-------|
| Vorhandenes Copy-Script | ja (`scripts/copy-opencode-provider-credentials.ps1`) |
| Vorhandene lokale Secret-Datei | ja (`secrets/opencode-provider.env`) |
| .env.local vorhanden | ja |
| .gitignore vorhanden | ja |
| scripts/ Verzeichnis vorhanden | ja |

## Lokale OpenCode-Konfigurationspfade

| Pfad | Gefunden |
|------|----------|
| `%USERPROFILE%\.config\opencode` | ja |
| `%APPDATA%\opencode` | nein |
| `%LOCALAPPDATA%\opencode` | nein |
| `%USERPROFILE%\.opencode` | nein |

## Sicherheits-Gates

| Gate | Status |
|------|--------|
| Secret-Werte ausgegeben | nein |
| Dispatcher unverändert | ja |
| Issues #3–#8 geschützt | ja (wurden nicht angefasst) |
| Keine n8n-Credentials gelesen | ja |
| Keine Browser-Cookies extrahiert | ja |
| Keine SSH-Keys kopiert | ja |
| Keine ChatGPT-/Tool-Credentials gelesen | ja |
