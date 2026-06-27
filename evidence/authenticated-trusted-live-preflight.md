# Authenticated Trusted Live Preflight

Date: `2026-06-26T06:53:53+02:00`

- `N8N_BASE_URL` gesetzt: nein
- `N8N_API_KEY` gesetzt: nein
- `SPEC_KIT_EXPECTED_WORKFLOW_NAME` gesetzt: nein
- `SPEC_KIT_EXPECTED_WEBHOOK_PATH` gesetzt: nein
- `SPEC_KIT_EXPECTED_CREDENTIAL_NAME` gesetzt: nein
- `SPEC_KIT_ACCEPT_CREDENTIAL_METADATA_ONLY` gesetzt: nein
- API-Key ausgegeben: nein
- Secret-Werte ausgegeben: nein

Bewertung:

- Aktuelle Shell dieses Laufs enthaelt keinen `N8N_API_KEY`.
- Erwarteter API-Status fuer den Trusted-Runner in diesem Lauf: `N8N_API_AUTH_MISSING`.
- Kein Live-POST erlaubt.
- Zielstatus fuer diesen Lauf: `GREEN_PARTIAL`, sofern alle lokalen Gates gruen bleiben.
