# Playwright MCP Discovery

Date: `2026-06-25`
Classification: `PLAYWRIGHT_MCP_TOOL_GAP`

## Scope

Ziel dieser Phase war die belastbare Feststellung, ob in dieser Sitzung ein echter Playwright-MCP-Browserpfad fuer n8n-UI-E2E verfuegbar und sicher nutzbar ist.

## Checks

1. MCP-Tool-Discovery
   - Methode: `tool_search` mit Browser-/Playwright-bezogenen Suchbegriffen
   - Ergebnis: Discovery meldete Treffer, aber es wurde in dieser Sitzung kein direkt aufrufbares Playwright-MCP-Tool mit bekannter Namespace-/Funktionssignatur verfuegbar.
   - Bewertung: `TOOL_GAP`

2. Lokale Playwright-Laufzeit
   - `node --version` -> Exit `0`, `v24.14.0`
   - `npm --version` -> Exit `0`, `11.9.0`
   - `npx playwright --version` -> Exit `124` (Timeout nach ca. 21s)
   - `require.resolve('playwright')` / `require.resolve('playwright-core')` -> Exit `1`, nicht lokal aufloesbar
   - Bewertung: keine allgemein verfuegbare lokale Playwright-CLI/Library im Projektkontext nachweisbar

3. Vorhandene lokale Hilfsartefakte
   - `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json` vorhanden
   - `C:\Users\xxammaxx\pw-n8n-login-server.js` vorhanden
   - Helper-Script referenziert ein temp-basiertes Playwright-Modul:
     `C:\Users\xxammaxx\AppData\Local\Temp\n8n-playwright-ui-fix\node_modules\playwright`
   - Bewertung: Es existieren lokale, nicht zum Repo gehoerende Hilfsartefakte, aber kein nachweisbarer Playwright-MCP-Zugriff in dieser Sitzung

4. Browser-Erreichbarkeit der n8n-Basis
   - `Invoke-WebRequest http://192.168.1.52:5678/healthz` -> Exit `0`, HTTP `200`
   - Bewertung: n8n-Basis ist netzseitig erreichbar

5. Login-/Secret-Risiko
   - Das vorhandene Storage-State-Artefakt wurde nur metadatenbasiert ausgewertet.
   - Dokumentiert wurden ausschliesslich Cookie-Name, Domain und LocalStorage-Key-Namen.
   - Keine Cookie-Werte, Tokens oder anderen Secret-Inhalte wurden ausgegeben oder gespeichert.
   - Bewertung: kein festgestellter Secret-Leak in dieser Discovery

## Decision

- Playwright MCP verfuegbar: `nein`
- Browser ueber Playwright MCP startbar: `nein belegt`
- n8n unter `http://192.168.1.52:5678` erreichbar: `ja`
- Login ohne Secret-Exposure belegbar automatisierbar: `nein`
- UI-Locators / Accessibility ueber MCP pruefbar: `nein`

## Conclusion

Diese Sitzung ist fuer echten Playwright-MCP-E2E nicht vorbereitet. Der korrekte Fallback ist eine manuelle n8n-UI-Bestaetigung mit exakter Webhook-URL-Uebernahme. Ohne diese Bestaetigung bleibt der Live-POST gesperrt.
