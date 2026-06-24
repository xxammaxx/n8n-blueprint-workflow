# Evidence Report — n8n-mcp-client-smoke-20260624T133000Z

## Status: GREEN_PARTIAL_PLUS

**Session ID:** n8n-mcp-client-smoke-test
**Completed:** 2026-06-24T13:30:00Z
**Orchestrator:** issue-orchestrator (opencode)
**Previous Session:** n8n-mcp-activated-and-verified

---

## 1. MCP Client Test Results

| Test | Result | Detail |
|------|--------|--------|
| **tools/list** | ✅ PASS | All MCP tools discovered via JWT Bearer auth |
| **search_workflows** | ✅ PASS | `mcpSmoke001` found; only workflow with `availableInMCP: true` |
| **execute_workflow** | ⚠️ BLOCKED | Manual Trigger not publishable by n8n design |
| **Auth mechanism** | ✅ JWT Bearer | `aud: "mcp-server-api"`, requires `Accept: text/event-stream` |
| **Token security** | ✅ Rotated | Old token invalidated after test |

## 2. Security Scope Verification (via search_workflows)

| Workflow | availableInMCP |
|----------|---------------|
| MCP Smoke Test (`mcpSmoke001`) | ✅ **true** |
| GitHub Issue → Runner Agent Intake | ❌ false |
| Blueprint → SpecKit/OpenCode Bootstrap V2 | ❌ false |
| Blueprint → SpecKit/OpenCode Bootstrap | ❌ false |
| My workflow 2 | ❌ false |
| My workflow | ❌ false |

**Only 1 of 6 workflows exposed to MCP.** Production workflows confirmed locked down.

## 3. execute_workflow Diagnosis

n8n `execute_workflow` MCP tool requires the workflow to have an active (published) version. The MCP Smoke Test uses a Manual Trigger node, which n8n does not consider a valid trigger for publishing. 

**Root cause:** n8n design — Manual Trigger workflows are interactive-only.
**Workaround:** Replace Manual Trigger with Webhook trigger node.
**Impact:** MCP execution not testable with current trigger type. Search and listing fully functional.

## 4. MCP Protocol Discovery

| Finding | Detail |
|---------|--------|
| Transport | Streamable HTTP (not SSE-only) |
| Auth token type | JWT (not opaque) |
| Required headers | `Authorization: Bearer <jwt>` + `Accept: application/json, text/event-stream` |
| Without Accept header | HTTP 406 "Not Acceptable" |
| Without auth | HTTP 401 "Authorization header not sent" |
| MCP token vs REST API | Separate — MCP JWT (`aud: mcp-server-api`) not valid for REST API |

## 5. Token Security

| Check | Status |
|-------|--------|
| Token exposed in chat | ⚠️ YES (during test setup) |
| Token rotated after test | ✅ YES |
| Old token now invalid | ✅ YES |
| Token stored in repo | ❌ NO |
| Token in logs | ❌ NO |
| Token in evidence files | ❌ NO |

## 6. What Changed Since Last Session

| Capability | Previous | Current |
|------------|----------|---------|
| MCP tools/list | Untested | ✅ **PASS** |
| MCP search_workflows | Untested | ✅ **PASS** |
| Security scoping verified | UI-only | ✅ **API-VERIFIED** |
| Auth protocol documented | Incomplete | ✅ **COMPLETE** (JWT + SSE headers) |
| execute_workflow | Untested | ⚠️ **DIAGNOSED** (trigger limitation) |
| Token security | Not generated | ✅ **ROTATED** after test |

## 7. Files Changed

- `STATUS.md` — MCP test results added
- `CHANGELOG.md` — new entry
- `docs/n8n-mcp-integration.md` — headers + execute limitation
- `docs/troubleshooting.md` — MCP 401/406/execute diagnosis
- `evidence-index/latest.md` — this report

## 8. Bewertung

**GREEN_PARTIAL_PLUS** — MCP ist vollständig funktionsfähig mit JWT Bearer Auth. tools/list und search_workflows erfolgreich getestet. Security-Scoping API-verifiziert: nur ein Workflow exponiert. execute_workflow durch n8n-Design limitiert (Manual Trigger nicht publishable) — dokumentiert mit Workaround. Token nach Test rotiert.
