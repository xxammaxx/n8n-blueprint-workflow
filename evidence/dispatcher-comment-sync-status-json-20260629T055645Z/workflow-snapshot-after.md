# Workflow Snapshot — After Patch (Live)

**Timestamp (UTC):** 2026-06-29T06:13:08Z
**Source:** n8n Live API (`GET /api/v1/workflows/Sv12QTo56NoPUu2D`)
**Evidence Directory:** `evidence/dispatcher-comment-sync-status-json-20260629T055645Z/`

## Export Details

| Item | Value |
|------|-------|
| Export file | `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-live-after-patch-20260629T061308Z.json` |
| SHA256 | `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9` |
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow Name | "GitHub Ready Issue → Runner Agent Dispatch" |
| Active | ✅ True |
| Node Count | 18 |
| UpdatedAt | `2026-06-29T06:12:29.000Z` (patch timestamp) |

## Patched Nodes Verified

| Node | ID | Code Length | Status |
|------|-----|------------|--------|
| 11 — Format Evidence Comment | `25d2cbd3-b919-4f19-9f41-5aac51841742` | 3,689 chars | ✅ status.json sync present |
| 15 — Format Final Result | `f1aedb55-8b84-4886-85be-8a672817add5` | 944 chars | ✅ status.json sync present |

## Before Snapshot Reference

| Item | Value |
|------|-------|
| Live backup (before) | `exports/comment-sync-before/dispatcher-Sv12QTo56NoPUu2D-live-backup-20260629T060031Z.json` |
| Before SHA256 | `5187F7EE258262D809DE0DDE95FCBA80A94960693CA51C32521DB69EA6E115A6` |
| API export (before) | `exports/comment-sync-before/dispatcher-Sv12QTo56NoPUu2D-before-comment-sync-20260629T053028Z.json` |

## Diff Summary

| Check | Before | After |
|-------|--------|-------|
| Node 11 code length | 2,450 chars | 3,689 chars (+1,239) |
| Node 15 code length | 738 chars | 944 chars (+206) |
| Other 16 nodes | Unchanged | Unchanged |
| Trigger nodes | Unchanged | Unchanged |
| Credential IDs | Unchanged | Unchanged |
| Connections | Unchanged | Unchanged |
| Active status | True | True (unchanged) |
| Node count | 18 | 18 (unchanged) |

## Patch Method

Direct SQLite database update via Proxmox SSH → CT 101:
1. Backup: `database.sqlite.bak.20260629T0600Z`
2. Python script: `patch-n8n-workflow-db.py`
3. Updated nodes JSON in `workflow_entity` table
4. Verified via API read-back
