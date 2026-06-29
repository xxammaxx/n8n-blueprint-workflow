# Workflow Snapshot — After Patch

**Timestamp (UTC):** 2026-06-29T05:34:00Z  
**Snapshot File:** `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-after-comment-sync-20260629T053028Z.json`  
**SHA256:** `17A4159C6BDD0538CDDFB9B87F69AF25D261701FBFFAF1D3577B4937C6E61FD7`

## Diff Summary

| Item | Before | After |
|------|--------|-------|
| Node count | 18 | 18 |
| Active | true | true |
| Schedule Trigger | 15 min, unchanged | 15 min, unchanged |
| Manual Trigger | unchanged | unchanged |
| Credentials | 10, unchanged | 10, unchanged |
| Guardrails | unchanged | unchanged |

## Changed Nodes

| Node | ID | Change |
|------|-----|--------|
| 11 — Format Evidence Comment | `25d2cbd3-...` | JS code: parse SSH stdout for status.json, new fields, evidence source label |
| 15 — Format Final Result | `f1aedb55-...` | JS code: dispatch_mode and status from evidenceFormat data |

## Unchanged Nodes (16/18)

All other nodes (1-10, 12-14, 16-18) are byte-for-byte identical to the before snapshot.

## Safety Checks

| Check | Status |
|-------|--------|
| Triggers unchanged | ✅ |
| Schedule unchanged | ✅ |
| Credentials unchanged | ✅ |
| JSON valid | ✅ |
| No secrets in export | ✅ |
