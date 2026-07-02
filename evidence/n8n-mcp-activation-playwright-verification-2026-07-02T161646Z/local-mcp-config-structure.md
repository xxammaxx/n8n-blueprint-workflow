# Lokale MCP Secret-/Config-Struktur

## Date/Time (UTC)
**2026-07-02T16:20:00Z**

## Lokale MCP-Datei
- **Datei:** `mcp/n8n-mcp.local.json`
- **Vorhanden:** YES (mit Platzhaltern)
- **Gitignored:** YES (bestätigt via `git check-ignore`)

## Echte Werte
- **Echte Werte ausgegeben:** NO
- **URL:** Nur Platzhalter `PASTE_LOCAL_N8N_MCP_URL_HERE`
- **Token:** Nur Platzhalter `PASTE_LOCAL_N8N_MCP_TOKEN_HERE`

## Playwright Server
- **Eingetragen:** YES
- **Command:** `npx -y @playwright/mcp@latest --isolated`

## n8n Server
- **Eingetragen:** YES (mit Platzhaltern)
- **Type:** remote

## .gitignore Status
- `mcp/*.local.json`: BLOCKED ✓
- `.mcp.local.json`: BLOCKED ✓
- `.mcp/`: BLOCKED ✓
- `secrets/`: BLOCKED ✓
- `.playwright-mcp/`: BLOCKED ✓
- `*.db`, `*.sqlite`, `*.bak`: BLOCKED ✓

## Bestehende Templates
- `mcp/mcp.servers.example.json` — Standard n8n + Playwright MCP Template ✓
- `mcp/mcp.sse-supergateway.example.json` — SSE/Supergateway Fallback ✓
- `mcp/README.md` — Dokumentation ✓

## Nächste Schritte (nach Aktivierung)
1. n8n MCP in der UI aktivieren (erfordert explizite Freigabe)
2. MCP URL und Token in `mcp/n8n-mcp.local.json` eintragen
3. Datei wird von git ignoriert — wird nie committed
