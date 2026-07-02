# Final Report — n8n MCP + Playwright E2E Prep

## 1. Kurzfazit

20-phasiger sicherer Read-only/Prep-Lauf erfolgreich abgeschlossen. n8n API-Key re-validiert (HTTP 200), OpenCode Provider-Key strukturell validiert (lokal + Runner, kein Drift), n8n MCP-Community-Node identifiziert (Aktivierung durch Restart-Constraint blockiert), Playwright MCP Capability bestätigt (UI Smoke durchgeführt). Keine Secrets ausgegeben, keine Workflows geändert, keine Issues erstellt.

## 2. Statusentscheidung

| Status | Wert |
|--------|------|
| **N8N_API_READY** | ✅ Key validiert (HTTP 200) |
| **OPENCODE_PROVIDER_KEY_STRUCTURALLY_READY** | ✅ Lokal + Runner identisch, keine Platzhalter |
| **N8N_MCP_ACTIVATION_PREPARED** | 🟡 Community-Node identifiziert, Voraussetzungen dokumentiert |
| **N8N_MCP_NATIVE_UNAVAILABLE** | ℹ️ n8n 2.26.8 kein natives MCP |
| **PLAYWRIGHT_MCP_CAPABLE** | ✅ Isolated/headless/browser bestätigt |
| **PLAYWRIGHT_E2E_AUTH_MISSING** | 🟡 E2E-Plan fertig, Freigabe fehlt |
| **PROVIDER_SMOKE_AUTH_MISSING** | 🟡 Strukturell validiert, Freigabe fehlt |
| **SECRET_HYGIENE_GREEN** | ✅ 0 neue Leaks |

## 3. n8n

- **Health:** GREEN (`{"status":"ok"}`, HTTP 200)
- **Version:** 2.26.8 (laufend seit Jun29)
- **API:** N8N_API_READY (Key validiert, Workflows lesbar)
- **MCP Capability:** Kein natives MCP in 2.26.8. Community-Node `n8n-nodes-mcp@0.1.37` verfügbar
- **MCP Test-Workflow:** mcpSmoke001 existiert (Manual Trigger + Code, inaktiv)
- **Activation:** Vorbereitet, blockiert durch n8n Restart-Constraint

## 4. OpenCode Provider

- **Local env:** bereit (alle Keys, keine Platzhalter, 600 Permissions, gitignored)
- **Runner env:** bereit (alle Keys, keine Platzhalter)
- **Drift:** keiner
- **Provider Smoke:** nicht durchgeführt (PROVIDER_SMOKE_AUTH_MISSING)
- **Werte ausgegeben:** nein

## 5. Playwright

- **MCP Capability:** PLAYWRIGHT_MCP_CAPABLE (--isolated, --headless, --browser)
- **UI Smoke:** ja (Chromium 1223 headless, n8n Login-Seite bestätigt)
- **Alte Sessions:** keine verwendet (frischer Temp-Ordner, keine `.playwright-mcp/`)
- **E2E Smoke:** Plan erstellt, nicht ausgeführt (PLAYWRIGHT_E2E_AUTH_MISSING)

## 6. Runner

- **SSH:** GREEN (runner@192.168.1.53)
- **su - runner:** Auth Failure (erwartet, bereits als runner eingeloggt)
- **OpenCode:** 1.17.9
- **Node:** v22.23.0
- **Loader:** vorhanden
- **Dispatch Script:** vorhanden

## 7. MCP Build Process

- **Templates:** mcp/README.md, mcp/mcp.servers.example.json, mcp/mcp.sse-supergateway.example.json
- **Config:** mcp/n8n-mcp.local.json (Placeholder, tracked-but-gitignored — minor hygiene issue)
- **Allowlist/Denylist:** Definiert im Activation Plan (Phase 9)

## 8. Secret Hygiene

- **Vor Prep:** GREEN
- **Nach Prep:** GREEN
- **Minor Issue:** `mcp/n8n-mcp.local.json` tracked-but-gitignored (nur Platzhalter)
- **Neue Leaks:** 0

## 9. Sicherheitsprüfung

Alle 20 Hard Constraints eingehalten:
- Keine Secrets ausgegeben
- Keine Credentials gelesen
- Keine Workflows geändert
- Keine Issues erstellt/modifiziert
- Kein Agent-Run
- Kein Provider-Smoke ohne Freigabe
- Kein n8n/CT/Runner Restart

## 10. Geänderte Dateien

- `CHANGELOG.md` — neuer Eintrag
- `STATUS.md` — Status aktualisiert
- `evidence-index/latest.md` — Index aktualisiert
- `evidence/n8n-mcp-playwright-e2e-prep-20260702T204149Z/` — 17 Evidence-Dateien

## 11. Commit / Push

- **Commit:** `b53833c` — `docs(ops): prepare n8n mcp and playwright e2e workflow`
- **Push:** origin/master ✅

## 12. Offene Aufgaben

1. **n8n MCP echte Aktivierung:**
   - `N8N_COMMUNITY_PACKAGES_ENABLED=true` setzen
   - `n8n-nodes-mcp@0.1.37` installieren
   - n8n neustarten (geplantes Wartungsfenster)
   - MCP-Workflow erstellen und konfigurieren

2. **Playwright MCP E2E-Smoke:**
   - Benötigt separate Freigabe: `Ich autorisiere einen Playwright MCP E2E-Smoke-Test gegen die n8n UI...`

3. **Provider-Smoke-Test:**
   - Benötigt separate Freigabe: `Ich autorisiere einen kostenbegrenzten OpenCode/DeepSeek Provider-Smoke-Test...`

4. **Git Hygiene:**
   - `git rm --cached mcp/n8n-mcp.local.json` (tracked-but-gitignored bereinigen)

## 13. Nächster sinnvoller Schritt

Nutzung des existierenden mcpSmoke001 Workflows (Manual Trigger + Code Node) aktivieren und als MCP-Proxy nutzen — erfordert KEINEN n8n Restart und wäre sofort möglich. Oder geplantes Wartungsfenster für Community-Node-Installation + n8n Restart.
