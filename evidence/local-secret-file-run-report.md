# Local Secret File — Run Report

Datum: `2026-06-26`

## Übersicht

- `.env.local` existiert: ja
- API-Key gesetzt: nein (noch Platzhalter `PASTE_YOUR_N8N_API_KEY_HERE`)
- API-Key ausgegeben: nein
- Trusted-Scan ausgeführt: nein (Grund: `.env.local` enthält noch Platzhalter)

## Lokale Gates

Siehe Run Report für Exit Codes der lokalen Gates:

- `node scripts/build-workflow.mjs`
- `node scripts/dry-run-local.mjs`
- `node scripts/validate-local.mjs`
- `node scripts/test-scanner-entrypoints.mjs`
- `node scripts/validate-secret-hygiene.mjs`

## Secret-Hygiene-Gate

- Ausgeführt: ja
- API-Key ausgegeben: nein
- Ergebnis: siehe Exit Code

## Trusted-Scan

- Ausgeführt: nein
- Grund: `.env.local` enthält noch Platzhalter — kein echter API-Key vorhanden.
- Empfehlung: `.env.local` öffnen, `PASTE_YOUR_N8N_API_KEY_HERE` durch echten Key ersetzen,
  dann `.\scripts\run-trusted-readiness-with-local-env.ps1` ausführen.

## Sicherheit

- Kein echter API-Key in Evidence-Dateien.
- Kein echter API-Key in Git-verfolgbaren Dateien.
- Kein API-Key in dieser Datei.
