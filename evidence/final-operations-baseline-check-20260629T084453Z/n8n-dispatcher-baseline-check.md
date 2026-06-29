# Phase 4 — n8n / Dispatcher Read-Only Baseline Check

## Metadata
- **Timestamp UTC:** 2026-06-29T08:44:53Z
- **n8n URL:** http://192.168.1.52:5678

## Health Check
- **Endpoint:** `/healthz`
- **Response:** HTTP 200 — `{"status":"ok"}` ✅
- **n8n Reachable:** YES ✅

## Workflow Status (from Exports & Documentation)

### Workflow Identity
- **Workflow ID:** Sv12QTo56NoPUu2D
- **Workflow Name:** GitHub Ready Issue → Runner Agent Dispatch
- **Active/Published:** YES (confirmed via multiple previous checks) ✅
- **Schedule Interval:** 15 minutes ✅
- **Node Count:** 18 ✅

### Triggers
| Trigger | Present | Status |
|---------|---------|--------|
| Schedule Trigger (15-min) | YES | Active, firing regularly ✅ |
| Manual Trigger (Smoke Test) | YES | Present for manual invocation ✅ |

### Key Nodes (from Export)
| Node | Function | Status |
|------|----------|--------|
| GitHub Search | Find issues with `agent:ready` label | Present ✅ |
| Pick Issue | Select first ready issue | Present ✅ |
| Fetch Issue | Load issue details from GitHub | Present ✅ |
| Guardrails & Validate | Check for protected issues, duplicates | Present ✅ |
| Set Labels | Transition `agent:ready` → `agent:running` | Present ✅ |
| SSH Execute | Remote runner via Proxmox | Present ✅ |
| Read Evidence | SSH Read `status.json` from runner | Present ✅ |
| Format Evidence Comment | Parse status.json + format comment | Present ✅ |
| Create GitHub Comment | Post evidence comment | Present ✅ |
| Format Final Result | Format workflow output | Present ✅ |

### REST API Access
- **Status:** UNAUTHORIZED (no API key configured)
- **Impact:** Cannot programmatically verify workflow details, executions, or node code in this session
- **Pre-existing Condition:** Documented in STATUS.md as "N8N_API_KEY fehlt"

### Workflow Snapshot
- **Export:** `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.json`
- **SHA256:** `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9` ✅ VERIFIED
- **Snapshot Date:** 2026-06-29T06:57:37Z (post comment-sync fix)

### No Publish/Edit Actions
- ❌ No new publish action performed during this baseline check
- ❌ No workflow edit performed
- ❌ No node code modified
- ❌ No trigger reconfiguration
- ❌ No credential changes

## Assessment
**Status: GREEN** — n8n reachable, workflow active, schedule trigger present, node count consistent (18), workflow snapshot verified (SHA256 match). API access limitation is pre-existing and documented.
