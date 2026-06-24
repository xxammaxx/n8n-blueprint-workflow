# Evidence Report — ssh-command-mode-validation-20260624T104034Z

## Status: GREEN_PARTIAL

**Session ID:** n8n-github-issue-intake-ssh-validation
**Completed:** 2026-06-24T10:40:34Z
**Orchestrator:** documentation-agent
**Previous Session:** n8n-mcp-manual-execution-validation

---

## 1. SSH Command Mode Validation — Results

| Phase | Test | Result | Detail |
|-------|------|--------|--------|
| **SSH Write** | `mkdir -p` + `base64 -d` + `jq` | ✅ PASS | 779 bytes written to Runner |
| **SSH Start** | `start_github_issue_run.sh --input-json` | ✅ PASS | exit_code 0, Run ID: `gh-issue-1-20260624T104034Z` |
| **SSH Read** | Retry loop (30x2s) looking for `status.json` | ✅ PASS | Found with `GREEN_PARTIAL` status |
| **Wait Node** | "After Time Interval" mode, 5 seconds | ✅ PASS | Correctly configured (NOT hours) |
| **Expression Mode** | SSH nodes use fx toggle | ✅ IDENTIFIED | CRITICAL — Fixed Mode causes literal `{{ }}` |
| **Labels in Pin Data** | `labels: ["agent:queued"]` | ✅ IDENTIFIED | Required by Validate Issue Contract node |
| **Prepare Node** | `run_input_b64`, `run_input_remote`, `evidence_dir` | ✅ VERIFIED | All 3 outputs present and correct |

### All 9 Nodes Green

```
Manual Trigger → GitHub: Get Issue → Validate Issue Contract → Prepare RUN_INPUT.json →
SSH Write RUN_INPUT → SSH Start Runner Script → Wait (5s) → SSH Read status.json → Format Result
```

Workflow ID: `h78eENwLGwr2QUmU`

### Runner Evidence Produced (8 files)

Path: `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T104034Z/`

| # | File | Description |
|---|------|-------------|
| 1 | `status.json` | Status: `GREEN_PARTIAL`, phase, run ID |
| 2 | `run-report.md` | Human-readable run report |
| 3 | `commands.log` | All executed commands |
| 4 | `agent.log` | Agent output log |
| 5 | `github-context.md` | GitHub issue context |
| 6 | `RUN_INPUT.json` | Validated input data (779 bytes) |
| 7 | `preflight.md` | Pre-flight check results |
| 8 | `summary.json` | Execution summary |

---

## 2. Key Findings

### 2.1 Expression Mode is MANDATORY for SSH Nodes
SSH nodes in n8n have two modes for the `command` parameter:
- **Fixed Mode** (default): Text is literal — `{{ }}` expressions are NOT resolved
- **Expression Mode** (fx toggle): Text is evaluated — `{{ }}` expressions ARE resolved

Without Expression Mode, SSH nodes appear green but pass literal `{{ $json.run_input_remote }}` to bash, which never resolves.

### 2.2 --input-json Flag Required
The Runner script `start_github_issue_run.sh` requires the `--input-json` flag before the path argument. Initial assumption that this flag should be removed was wrong.

### 2.3 Wait Node: timeInterval vs hours
The Wait node was initially set to `unit: "hours"` → waits indefinitely for a future date. Changed to `mode: "timeInterval"`, `amount: 5`, `unit: "seconds"` for correct 5-second delay.

### 2.4 Labels Array Required in Pin Data
The Validate Issue Contract node checks `input.body.labels` and expects an array with `agent:queued` or `agent:ready`. Without labels, the validation blocks.

---

## 3. Security Scope

| Check | Status |
|-------|--------|
| SSH credential via n8n store (Expression mode) | ✅ VERIFIED — no secrets in node config |
| SSH commands use `{{ }}` expressions, no hardcoded paths | ✅ VERIFIED |
| Evidence directory under `/opt/dev-fabric/evidence/` | ✅ VERIFIED |
| No secrets in workflow JSON | ✅ VERIFIED |
| No `.env` or credential files in repo | ✅ VERIFIED |

---

## 4. Remaining Gaps (GREEN_PARTIAL)

| Feature | Status | Notes |
|---------|--------|-------|
| GitHub auto-comment on Issue | ❌ NOT IMPLEMENTED | Manual via GitHub API / `gh` CLI |
| GitHub auto-label update | ❌ NOT IMPLEMENTED | Manual via GitHub API / `gh` CLI |
| n8n GitHub API credential | ❌ NOT CONFIGURED | Blocks automated trigger/comment/label |
| OpenCode provider config | ❌ NOT CONFIGURED | Needs separate approval |
| n8n MCP production workflow exposure | ❌ NOT ENABLED | By design — only smoke test exposed |

---

## 5. Test Run Identification

| Property | Value |
|----------|-------|
| **Workflow ID** | `h78eENwLGwr2QUmU` |
| **Run ID** | `gh-issue-1-20260624T104034Z` |
| **Trigger** | Manual (Pin Data) |
| **Owner** | `xxammaxx` |
| **Repo** | `n8n-blueprint-workflow` |
| **Issue Number** | 1 |
| **Evidence Base Path** | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T104034Z/` |
| **Status** | `GREEN_PARTIAL` |

---

## 6. Files Changed

- `STATUS.md` — GREEN_PARTIAL, SSH validation results, updated pending/blockers
- `CHANGELOG.md` — new entry for SSH command mode validation
- `docs/github-issue-intake-runbook.md` — added Live Validation section
- `docs/troubleshooting.md` — added 5 new entries (Expression Mode, Wait node, labels, --input-json, unbound variable)
- `docs/security-boundaries.md` — added SSH Expression Mode security note
- `evidence-index/latest.md` — this report
- `evidence-index/known-evidence-paths.md` — added latest run path

---

## 7. Bewertung

**GREEN_PARTIAL** — SSH command mode erfolgreich validiert:

- ✅ SSH Write: `mkdir -p` + `base64 -d` + `jq`, 779 bytes
- ✅ SSH Start: `--input-json` flag, exit_code 0
- ✅ SSH Read: retry loop, `status.json` with `GREEN_PARTIAL`
- ✅ Wait Node: timeInterval, 5 seconds
- ✅ Expression Mode: identifiziert und dokumentiert
- ✅ 8 Evidence-Dateien produziert
- ✅ Run ID: `gh-issue-1-20260624T104034Z`

**Nächste Schritte:** GitHub API Credential konfigurieren, Auto-Comment/Label implementieren.

---

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
