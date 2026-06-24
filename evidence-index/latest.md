# Evidence Report — n8n-mcp-activated-20260624T130000Z

## Status: GREEN_PARTIAL_PLUS

**Session ID:** n8n-mcp-activated-and-verified
**Completed:** 2026-06-24T13:00:00Z
**Orchestrator:** issue-orchestrator (opencode)
**Previous Session:** browser-automation-strategy

---

## 1. n8n MCP Activation

| Check | Result |
|-------|--------|
| MCP toggle ON | ✅ YES |
| Server URL | `http://192.168.1.52:5678/mcp-server/http` |
| Auth methods | OAuth + Access Token (Bearer) |
| Token extracted/logged | ❌ NO — never read, displayed, or stored |
| Token masked in UI | ✅ YES (`******bz5Q`) |
| Connected clients | 0 |

## 2. MCP Workflow Scoping

| Check | Result |
|-------|--------|
| Workflows enabled for MCP | **1** — ONLY "MCP Smoke Test" |
| MCP Smoke Test ID | `mcpSmoke001` |
| Production workflows exposed | **NONE** (verified) |
| Blueprint workflow exposed? | ❌ NO |
| GitHub Issue Intake exposed? | ❌ NO |
| Other workflows exposed? | ❌ NO |

## 3. MCP Smoke Test Workflow

| Field | Value |
|-------|-------|
| Name | MCP Smoke Test |
| ID | `mcpSmoke001` |
| Nodes | 2 (Manual Trigger + Code Node) |
| Returns | `{ok, system, runner_expected, no_secrets, ...}` |
| Credentials | NONE |
| SSH access | NONE |
| GitHub API | NONE |
| `availableInMCP` | `true` |
| Project | Personal (`fLfBCnB9rifW9Cu2`) |

## 4. Connection Details

| Tab | Visible | Content |
|-----|---------|---------|
| OAuth | ✅ YES | Server URL + instructions |
| Access Token | ✅ YES | Masked token display |
| Workflows | ✅ YES | 1 workflow: MCP Smoke Test |
| Connected Clients | ✅ YES | 0 clients |

## 5. Security Verification

| Check | Status |
|-------|--------|
| Token never read | ✅ VERIFIED |
| Token never logged | ✅ VERIFIED |
| Token never stored in repo | ✅ VERIFIED |
| No production workflows in MCP | ✅ VERIFIED |
| `.github/workflows` absent | ✅ VERIFIED |
| No credentials exposed | ✅ VERIFIED |
| No secrets in screenshots | ✅ VERIFIED |

## 6. MCP Client Test (Pending — User to Execute)

Local test command (token NOT in repo):

```bash
# User fills in token locally:
export N8N_MCP_TOKEN='<PASTE_TOKEN_FROM_N8N_UI>'

# Test 1: List MCP tools
curl -s -H "Authorization: Bearer $N8N_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  http://192.168.1.52:5678/mcp-server/http \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' | jq .

# Test 2: Search for the smoke test workflow
curl -s -H "Authorization: Bearer $N8N_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  http://192.168.1.52:5678/mcp-server/http \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search_workflows","arguments":{"search":"Smoke"}},"id":2}' | jq .

# Test 3: Execute the MCP Smoke Test
curl -s -H "Authorization: Bearer $N8N_MCP_TOKEN" \
  -H "Content-Type: application/json" \
  http://192.168.1.52:5678/mcp-server/http \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"execute_workflow","arguments":{"workflowId":"mcpSmoke001"}},"id":3}' | jq .

# Clean up
unset N8N_MCP_TOKEN
```

Expected results to report back:
```
MCP tools/list: PASS/FAIL
MCP Smoke Test sichtbar: PASS/FAIL
Produktivworkflows nicht freigegeben: PASS/FAIL
Token nicht geloggt: PASS/FAIL
```

## 7. What Changed Since Last Session

| Capability | Previous | Current |
|------------|----------|---------|
| n8n MCP status | DISABLED | **ACTIVATED** |
| MCP test workflow | Export file only | **IMPORTED** (`mcpSmoke001`) |
| MCP workflow scoping | Not configured | **VERIFIED** — only smoke test |
| Production workflows in MCP | Unknown | **CONFIRMED NONE** |
| MCP client test | Not possible | **Ready** (user to execute locally) |

## 8. Files Changed

### New:
- `workflows/mcp-smoke-test-v3.import.json` 
- `workflows/mcp-smoke-test-v4.import.json`

### Modified:
- `STATUS.md` — MCP activation + workflow import
- `CHANGELOG.md` — new entry
- `evidence-index/latest.md` — this report

## 9. Bewertung

**GREEN_PARTIAL_PLUS** — n8n MCP ist aktiviert. Der MCP Smoke Test Workflow wurde erfolgreich importiert und ist als EINZIGER Workflow für MCP freigegeben. Keine Produktivworkflows sind exponiert. Der Access Token wurde zu keinem Zeitpunkt gelesen, geloggt oder gespeichert. Die MCP-Client-Konnektivitätsprüfung steht noch aus und wird lokal durch den Nutzer mit dem bereitgestellten Befehl durchgeführt.

**Vorher:** MCP deaktiviert, nur dokumentiert → **Jetzt:** MCP aktiviert, Smoke Test importiert und gescoped, bereit für Client-Test.
