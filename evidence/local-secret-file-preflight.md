# Local Secret File — Preflight

Datum: `2026-06-26`

## Prüfung

- `.env.local` existiert: ja
- `.env.example` existiert: ja
- `.gitignore` existiert: ja
- `.gitignore` ignoriert `.env.local`: ja
- `.env.local` enthält Platzhalter (noch kein echter Key): ja
- API-Key ausgegeben: nein
- Loader-Skript vorhanden: ja (`scripts/load-local-env.ps1`)
- Wrapper-Skript vorhanden: ja (`scripts/run-trusted-readiness-with-local-env.ps1`)
- Secret-Hygiene-Skript vorhanden: ja (`scripts/validate-secret-hygiene.mjs`)

## Entscheidung

Die Secret-Datei-Struktur ist angelegt. Der Nutzer muss noch seinen echten
n8n API-Key in `.env.local` eintragen.

## Secret-Sicherheit

- Kein echter API-Key in dieser Datei.
- Kein echter API-Key in `.env.example`, `.env.local` (nur Platzhalter),
  `README.md` oder anderen Git-verfolgbaren Dateien.
- Loader gibt niemals Secrets aus.
