# Workflow Diff Summary — Comment Sync Patch

**Timestamp (UTC):** 2026-06-29T06:13:45Z
**Evidence Directory:** `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/`

## Before/After Comparison

| Dimension | Before | After | Change |
|-----------|--------|-------|--------|
| Workflow ID | `Sv12QTo56NoPUu2D` | `Sv12QTo56NoPUu2D` | Unchanged |
| Workflow Name | `GitHub Ready Issue → Runner Agent Dispatch` | Same | Unchanged |
| Active | `true` | `true` | Unchanged |
| Node Count | 18 | 18 | Unchanged |
| Connections | 18-node pipeline | Same | Unchanged |
| Trigger: Manual | Present | Present | Unchanged |
| Trigger: Schedule (15 min) | Present | Present | Unchanged |
| Credentials (10) | All present | All present | Unchanged |

## Changed Nodes

| Node | ID | Field | Before | After |
|------|-----|-------|--------|-------|
| 11 — Format Evidence Comment | `25d2cbd3-...` | `parameters.jsCode` | 2,450 chars | 3,689 chars |
| 15 — Format Final Result | `f1aedb55-...` | `parameters.jsCode` | 738 chars | 944 chars |

## Unchanged (16 nodes)

All other nodes untouched:
- `85e67e06-...` Manual Trigger (Smoke Test)
- `2d16d3af-...` Fetch Issue from GitHub
- `c9e9f6fa-...` Guardrails & Validate
- `4e4cb781-...` Set Issue Status: Running
- `d71c4ef5-...` SSH Proxmox Preflight
- `aae9da63-...` Prepare RUN_INPUT.json
- `f79bdcce-...` SSH Runner Execute
- `592fc2b2-...` SSH Read status.json
- `4ee71ea1-...` Post GitHub Comment
- `61531d15-...` Search GitHub Issues
- `95ccc8ed-...` Pick First Ready Issue
- `1ae86ae3-...` Format Pick from Array
- `63c9e1fe-...` Fetch Issue Labels
- `c2c3ea70-...` Set Final Labels
- Schedule Trigger (Node 1)
- Webhook node (if present)

## Deployment Method

- **Method:** Direct SQLite database update
- **Host:** 192.168.1.136 (Proxmox) → CT 101 (lxc-n8n-local)
- **Database:** `/opt/dev-fabric/n8n/data/.n8n/database.sqlite`
- **Backup:** `database.sqlite.bak.20260629T0600Z`
- **Script:** `patch-n8n-workflow-db.py`
- **Verification:** API GET confirmed updatedAt=2026-06-29T06:12:29.000Z

## Rollback

To rollback:
1. Restore from backup: `cp database.sqlite.bak.20260629T0600Z database.sqlite` on CT 101
2. Or: Restore `exports/comment-sync-before/` JSON via API or UI import
