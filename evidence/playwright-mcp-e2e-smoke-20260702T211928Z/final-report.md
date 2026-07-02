# Final Report — Playwright MCP E2E Smoke Test

## Date/Time (UTC)
2026-07-02T21:24:XXZ

## Kurzfazit

Playwright E2E Smoke Test gegen die n8n UI erfolgreich abgeschlossen. n8n UI ist erreichbar und zeigt die Login-Seite. Der Dispatcher-Workflow `Sv12QTo56NoPUu2D` wurde via n8n API als active mit 18 Nodes bestätigt. Keine Secrets ausgegeben, keine Workflow-Änderungen, keine Issues verändert, keine Agent-Runs getriggert.

---

## Statusentscheidung

| Status | Value |
|--------|-------|
| **Primary** | `PLAYWRIGHT_E2E_SMOKE_GREEN` 🟢🎭 |
| **UI Access** | `N8N_UI_LOGIN_REQUIRED` 🟡🔒 |
| **UI Smoke** | `N8N_UI_SMOKE_GREEN` 🟢 |
| **Dispatcher UI** | `DISPATCHER_UI_SMOKE_SKIPPED` 🟡 |
| **Tool Gap** | `PLAYWRIGHT_MCP_TOOL_GAP` 🟡 (CLI fallback) |
| **Secret Hygiene** | GREEN ✅ |

---

## Playwright

| Item | Result |
|------|--------|
| **MCP oder CLI-Fallback** | CLI Fallback — `npx playwright` v1.61.1, Chromium (system Google Chrome) |
| **Isolated** | JA — `chromium.launch({ headless: true })` + `browser.newContext()` |
| **Alte Sessions** | NEIN — Kein `.playwright-mcp/`, kein gespeichertes Browser-Profil |
| **MCP Direct** | NEIN — Kein direkter MCP-Client-Transport im Orchestrator-Agent |

---

## n8n UI

| Item | Result |
|------|--------|
| **Erreichbar** | JA — HTTP 200, Title "n8n.io - Workflow Automation" |
| **Login nötig** | JA — Sign In Form erkannt |
| **Dashboard sichtbar** | NEIN — Login-Gate blockiert |
| **Workflow-Liste** | Nicht erreichbar ohne Login |

---

## Dispatcher Workflow (`Sv12QTo56NoPUu2D`)

| Item | Result |
|------|--------|
| **Gefunden (API)** | JA ✅ |
| **Active/Published** | JA — `active: True` ✅ |
| **Node Count** | 18 ✅ (API confirmed) |
| **Name** | "GitHub Ready Issue -> Runner Agent Dispatch" |
| **UI-visuell geprüft** | NEIN — Login erforderlich |
| **Keine Änderung** | JA — 0 Änderungen |

---

## n8n API

| Item | Result |
|------|--------|
| **HTTP Code** | 200 ✅ |
| **Lesbar** | JA |
| **Key ausgegeben** | NEIN |
| **Dispatcher gefunden** | JA — `Sv12QTo56NoPUu2D` |

---

## Runner

| Item | Result |
|------|--------|
| **SSH** | GREEN ✅ |
| **Hostname** | lxc-dev-runner |
| **OpenCode** | 1.17.9 |
| **Node** | v22.23.0 |
| **Loader** | `/opt/dev-fabric/bin/load-opencode-provider-env.sh` ✅ |
| **Dispatch Script** | `/opt/dev-fabric/scripts/start_github_issue_run.sh` ✅ |
| **su - runner** | FAILED (known PAM issue, SU_RUNNER_FIXED workaround) |

---

## Secret Hygiene

| Check | Pre-E2E | Post-E2E |
|-------|---------|----------|
| Sensitive tracked files | 0 ✅ | 0 ✅ |
| Token patterns | 0 real (false positives only) ✅ | 0 real ✅ |
| `.playwright-mcp/` artifacts | 0 new | 0 new ✅ |
| Playwright screenshots | 0 | 0 ✅ |
| Temp files | Cleaned | Cleaned ✅ |

**Status:** SECRET_HYGIENE_GREEN ✅

---

## Sicherheitsprüfung

| # | Check | Status |
|---|-------|--------|
| 1 | Keine Secrets ausgegeben | ✅ |
| 2 | Keine API-Keys geloggt | ✅ |
| 3 | Keine Cookies extrahiert | ✅ |
| 4 | Keine Screenshots mit Secrets | ✅ |
| 5 | Keine Credentials geöffnet | ✅ |
| 6 | Keine Workflow-Änderungen | ✅ |
| 7 | Keine Executions gelöscht | ✅ |
| 8 | Keine Issues verändert | ✅ |
| 9 | Kein Agent-Run | ✅ |
| 10 | Kein n8n MCP aktiviert | ✅ |

---

## Geänderte Dateien

```
CHANGELOG.md                        (+21)
LINUX_MINT_OPERATIONAL_READINESS.md (+12/-5)
STATUS.md                           (+38/-4)
evidence-index/latest.md            (+27/-2)
evidence/playwright-mcp-e2e-smoke-*/ (11 neue Evidence-Dateien)
```

---

## Commit / Push

- **Commit:** `13317d2` — `test(ops): verify n8n ui via playwright e2e smoke`
- **Push:** `origin/master` ✅
- **Remote:** `13317d2cc105ca614f89c44768f3d2e8c40b19e0`

---

## Offene Aufgaben

1. 🔴 **n8n UI manuell einloggen** für Dispatcher Workflow UI Smoke
2. 🟡 **n8n MCP Aktivierung** — Community-Node installieren (n8n restart nötig)
3. 🟡 **Provider-Smoke-Test** mit Freigabe
4. 🟡 **`.playwright-mcp/` History-Remediation** abgeschlossen (HISTORY_REMEDIATION_GREEN)

---

## Nächster sinnvoller Schritt

1. Manuelles Login in n8n UI → Dispatcher Workflow UI Smoke (Phase 6 nachholen)
2. ODER: n8n MCP Aktivierung mit Community-Node `n8n-nodes-mcp`
3. ODER: Provider-Smoke-Test mit Freigabe
