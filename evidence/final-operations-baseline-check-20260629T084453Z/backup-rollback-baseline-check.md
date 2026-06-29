# Phase 9 — Backup / Rollback Baseline Check

## Metadata
- **Timestamp UTC:** 2026-06-29T08:44:53Z

## Database Backup

### SQLite Backup
| Item | Status | Detail |
|------|--------|--------|
| Backup file | ✅ EXISTS | `database.sqlite.bak.20260629T0600Z` |
| Location | On CT 101 | `/opt/dev-fabric/n8n/data/.n8n/database.sqlite.bak.20260629T0600Z` |
| In Git? | ❌ NO | Not in repository (confirmed via `git ls-files`) |
| In .gitignore? | ⚠️ NOTE | `.gitignore` does NOT explicitly exclude `*.bak`; backup is on remote CT, not in local clone |
| Backup Content Inspected? | ❌ NO | Not read — out of scope |

### Backup Context
- **Created During:** Comment sync fix deployment (dual-table database patch)
- **n8n Version:** v2.26.8 (per STATUS.md)
- **Tables Patched:** `workflow_entity.nodes` + `workflow_history.nodes`
- **Restore Tested:** Not performed in this baseline (out of scope)

## Rollback Plan
- **Documented In:** STATUS.md and CHANGELOG.md
- **Plan Summary:** Restore `database.sqlite.bak.20260629T0600Z` → replace active database → restart n8n
- **Verification Method:** Compare SHA256 of restored DB against backup

## Workflow Snapshots

### Green Baseline Export
| Item | Detail |
|------|--------|
| Path | `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.json` |
| SHA256 | `79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9` |
| SHA256 Verified | ✅ MATCH (recomputed in this session) |
| Export Date | 2026-06-29T06:57:37Z |
| Nodes | 18 |
| Workflow ID | Sv12QTo56NoPUu2D |

### Additional Exports
| Directory | Purpose |
|-----------|---------|
| `exports/comment-sync-before/` | Pre-fix state (2 exports) |
| `exports/comment-sync-after/` | Post-fix state (2 exports) |
| `exports/comment-sync-green/` | Frozen green baseline (1 export + SHA256) |
| `exports/green/` | Earlier green baseline (2 exports) |

## In-Git vs Out-of-Git
| Item | In Git? |
|------|---------|
| Workflow exports (*.json) | ✅ YES (committed) |
| SHA256 files | ✅ YES (committed) |
| Database backups (*.bak) | ❌ NO (on Proxmox CT 101) |
| Database files (*.sqlite) | ❌ NO (not in repo) |
| Secret files | ❌ NO (gitignored) |

## .gitignore Coverage Gap
Current `.gitignore` does NOT explicitly exclude:
- `*.db` (SQLite database files)
- `*.bak` (backup files)
- `*.db-shm`, `*.db-wal` (SQLite WAL files)

Currently no `.db` or `.bak` files exist in the local clone, so this is not an active risk. The n8n database lives on the Proxmox CT, not in the repository clone.

### Recommendation (Future, Not This Run)
- Add `*.db`, `*.db-shm`, `*.db-wal`, `*.bak` to `.gitignore` as a safety net

## Assessment
**Status: GREEN_WITH_NOTES**

- ✅ Database backup exists (on CT 101, not in local clone)
- ✅ Workflow snapshot preserved with verified SHA256
- ✅ Rollback plan documented
- ✅ Backup not in Git
- ⚠️ Note: `.gitignore` could be strengthened with `*.bak` and `*.db` patterns (no active risk currently)
