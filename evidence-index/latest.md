# Evidence Report — n8n-mcp-manual-execution-20260624T150000Z

## Status: GREEN_PARTIAL_PLUS

**Session ID:** n8n-mcp-manual-execution-validation
**Completed:** 2026-06-24T15:00:00Z
**Orchestrator:** issue-orchestrator (opencode)
**Previous Session:** n8n-mcp-client-smoke-test

---

## 1. MCP Test Results — Complete Matrix

| Phase | Test | Result | Detail |
|-------|------|--------|--------|
| **2** | `tools/list` | ✅ PASS | 28 MCP tools discovered |
| **3** | `search_workflows` | ✅ PASS | `mcpSmoke001` found (`availableInMCP: true`) |
| **4** | `execute_workflow` (default/production) | ❌ BLOCKED | Manual Trigger not publishable by n8n design |
| **4** | `execute_workflow` (manual mode) | ✅ **PASS** | Execution #20, `status:success`, 106ms — `executionMode:"manual"` |
| **5** | `get_execution` | ✅ PASS | Requires BOTH `executionId` + `workflowId` params |
| **6** | `test_workflow` | ✅ PASS | Execution #22, `status:success`, 11ms — requires `pinData: {}` |
| **6b** | `prepare_test_pin_data` | ✅ INFO | Returns schema coverage, not actual pin data |
| **7** | Auth mechanism | ✅ JWT Bearer | `aud: "mcp-server-api"` |
| **7** | Token security | ✅ Rotated | Old token invalidated after test |

### Key Breakthrough

In der vorherigen Session war `execute_workflow` komplett blockiert, da der default `production` mode ein published workflow voraussetzt. Der Manual Trigger von `mcpSmoke001` ist nicht publishable.

**Lösung:** `executionMode:"manual"` umgeht das Publish-Requirement. Execution #20 lief in 106ms erfolgreich durch.

### Parameter Requirements (undocumented)

| Tool | Required Params | Notes |
|------|----------------|-------|
| `execute_workflow` | `workflowId` | Optional: `executionMode` (default=`production`, use `manual` for non-published) |
| `get_execution` | `executionId` + `workflowId` | Both required — not just executionId |
| `test_workflow` | `workflowId` + `pinData` | `pinData` can be empty `{}` |
| `prepare_test_pin_data` | `workflowId` | Returns schema coverage, NOT actual pin data |

## 2. Security Scope Verification (via search_workflows)

| Workflow | availableInMCP |
|----------|---------------|
| MCP Smoke Test (`mcpSmoke001`) | ✅ **true** |
| GitHub Issue → Runner Agent Intake | ❌ false |
| Blueprint → SpecKit/OpenCode Bootstrap V2 | ❌ false |
| Blueprint → SpecKit/OpenCode Bootstrap | ❌ false |
| My workflow 2 | ❌ false |
| My workflow | ❌ false |

**Only 1 of 6 workflows exposed to MCP.** Production workflows confirmed locked down — verified via API (not just UI).

## 3. MCP Tool Inventory (28 tools)

All tools available via `tools/list`:

| Category | Tools |
|----------|-------|
| **Read/Search** | `search_workflows`, `get_workflow_details`, `search_executions`, `get_execution`, `search_nodes`, `get_node_types`, `search_projects`, `search_folders`, `search_data_tables`, `list_credentials` |
| **Execute/Test** | `execute_workflow`, `test_workflow`, `prepare_test_pin_data` |
| **Validate** | `validate_workflow`, `validate_node_config`, `get_workflow_best_practices` |
| **Write (DANGEROUS)** | `publish_workflow`, `unpublish_workflow`, `update_workflow`, `create_workflow_from_code`, `archive_workflow`, `create_data_table`, `rename_data_table`, `add_data_table_column`, `delete_data_table_column`, `rename_data_table_column`, `add_data_table_rows` |
| **Reference** | `get_sdk_reference` |

**Policy:** Only Read + Execute/Test on `mcpSmoke001` authorized. Write tools remain untested.

## 4. execute_workflow Diagnosis — Resolved

| Mode | Status | Explanation |
|------|--------|-------------|
| `production` (default) | ❌ BLOCKED | Requires published/active workflow. Manual Trigger not publishable. |
| `manual` | ✅ **WORKS** | Bypasses publish requirement. Tested with Execution #20 (#22). |

**No Webhook trigger needed** for smoke testing. Manual execution mode is sufficient.

## 5. Token Security

| Check | Status |
|-------|--------|
| Token exposed in chat | ⚠️ YES (during test setup — same as previous session) |
| Token rotated after test | ✅ YES |
| Old token now invalid | ✅ YES |
| Token stored in repo | ❌ NO |
| Token in logs | ❌ NO |
| Token in evidence files | ❌ NO |
| Token in screenshots | ❌ NO |
| Token in shell history | ❌ NO (cleared after test) |

## 6. What Changed Since Last Session

| Capability | Previous (Session 2) | Current (Session 3) |
|------------|---------------------|---------------------|
| MCP tools/list | ✅ PASS | ✅ PASS (re-verified) |
| MCP search_workflows | ✅ PASS | ✅ PASS (re-verified) |
| MCP execute_workflow (production) | ⚠️ BLOCKED | ❌ BLOCKED (same — n8n design) |
| MCP execute_workflow (manual) | Untested | ✅ **PASS** — Execution #20, 106ms |
| MCP get_execution | Untested | ✅ **PASS** — needs workflowId |
| MCP test_workflow | Untested | ✅ **PASS** — needs pinData={} |
| MCP prepare_test_pin_data | Untested | ✅ INFO — schema coverage |
| Token security | ✅ Rotated | ✅ Rotated (new token) |
| Parameter requirements | Unknown | ✅ **FULLY DOCUMENTED** |

## 7. Files Changed

- `STATUS.md` — MCP manual execution results, updated pending items
- `CHANGELOG.md` — new entry for manual execution validation
- `docs/n8n-mcp-integration.md` — updated execute_workflow section, parameter requirements
- `docs/troubleshooting.md` — updated execute_workflow diagnosis with manual mode solution
- `evidence-index/latest.md` — this report

## 8. Validation Results

| Check | Result |
|-------|--------|
| All required files (20/20) | ✅ EXISTS |
| JSON validation (11 files) | ✅ ALL VALID |
| `.gitignore` critical patterns | ✅ ALL PRESENT |
| Git-tracked secret files | ✅ NONE |
| Forbidden files on disk | ✅ NONE |
| Secrets in non-doc files | ✅ NONE |
| `.github/workflows` | ✅ ABSENT |

## 9. Bewertung

**GREEN_PARTIAL_PLUS** — MCP ist jetzt vollständig validiert:

- ✅ `tools/list`: 28 tools discovered
- ✅ `search_workflows`: Security scoping API-verified
- ✅ `execute_workflow` manual mode: Execution #20 success (106ms)
- ✅ `get_execution`: Confirmed (needs workflowId + executionId)
- ✅ `test_workflow`: Execution #22 success (11ms) with pinData={}
- ✅ Production workflows: NONE exposed via MCP
- ✅ Token: Rotated after test
- ✅ Repo: Clean validation, no secrets

**Nächster Schritt:** GitHub Issue Intake Workflow live testen (SSH Write/Start/Read command mode validation).
