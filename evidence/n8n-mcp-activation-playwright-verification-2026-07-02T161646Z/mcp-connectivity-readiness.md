# MCP Connectivity Smoke Test Readiness

## Date/Time (UTC)
**2026-07-02T16:20:30Z**

## Status
- **Primärstatus:** `N8N_MCP_ACTIVATION_PENDING`
- **Grund:** n8n MCP ist nicht aktiviert (AUTH MISSING)
- **Kein Schreibtool ausgeführt:** YES

## Verfügbare MCP Client Tools
- **MCP CLI:** `/home/xxammaxx/.local/bin/mcp` (Python)
  - `mcp version` — Version anzeigen
  - `mcp dev` — MCP Server mit Inspector starten
  - `mcp run` — MCP Server ausführen
  - `mcp install` — In Claude Desktop App installieren
- **MCP Inspector Client:** NICHT lokal verfügbar
- **n8n MCP URL:** NICHT verfügbar (nicht aktiviert)

## Readiness Matrix

| Komponente | Status | Voraussetzung |
|------------|--------|---------------|
| n8n Health | GREEN | — |
| n8n UI | REACHABLE | — |
| n8n MCP Aktiviert | NO | Explizite Freigabe |
| n8n MCP URL | UNKNOWN | n8n MCP Aktivierung |
| Lokale MCP Config | TEMPLATE ONLY | n8n MCP URL + Token |
| MCP Client Tool | AVAILABLE (CLI) | — |
| Playwright MCP | READY | — |
| E2E Smoke Test | PENDING | n8n MCP Aktivierung |

## Smoke Test Plan (nach Aktivierung)
1. n8n MCP in der n8n UI aktivieren (erfordert Freigabe)
2. MCP URL und Token in `mcp/n8n-mcp.local.json` eintragen
3. `mcp run` gegen n8n MCP Endpunkt ausführen (Handshake/Tool-Liste prüfen)
4. Kein Workflow erstellen, keine Credentials lesen

## Sicherheit
- **Keine Secrets ausgegeben:** YES
- **Kein Token in CLI verwendet:** YES
- **Kein Workflow erstellt:** YES
- **Keine Improvisation:** YES
