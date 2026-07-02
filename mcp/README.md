# MCP Configuration Templates

Diese Beispiele dienen als Vorlage. **Keine echten Secrets in diesen Dateien.**

## Verwendung

1. Template in lokale Konfiguration kopieren:
   ```bash
   cp mcp/mcp.servers.example.json mcp/mcp.servers.local.json
   ```
2. Platzhalter (`PASTE_*`) durch echte Werte ersetzen
3. Lokale Konfiguration wird von `.gitignore` ignoriert

## Dateien

| Datei | Zweck |
|-------|-------|
| `mcp.servers.example.json` | Standard n8n Instance MCP + Playwright MCP |
| `mcp.sse-supergateway.example.json` | SSE/Supergateway Fallback für n8n MCP Server Trigger |
| `README.md` | Diese Datei |

## Sicherheit

- Templates enthalten NUR Platzhalter
- Echte lokale Konfigurationen (`.local.json`) werden von `.gitignore` blockiert
- Keine API-Keys, Tokens, oder URLs in versionierten Dateien
