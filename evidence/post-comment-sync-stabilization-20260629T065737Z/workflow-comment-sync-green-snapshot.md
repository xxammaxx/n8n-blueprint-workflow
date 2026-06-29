# Phase 3 — Workflow Snapshot (COMMENT_SYNC_GREEN)

## Meta
- **Timestamp (UTC):** 2026-06-29T06:57:37Z
- **Export Source:** n8n Live REST API → `exports/comment-sync-green/`
- **Note:** API-Export mit `X-N8N-API-KEY` schlug fehl (401). Verwendet wird der bestehende Export von 2026-06-29T06:13:08Z, der nach dem Dual-Table-DB-Patch erstellt wurde. Seitdem keine Workflow-Änderungen.

## Export Files
| Datei | Größe |
|-------|-------|
| `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.json` | 44,960 bytes |
| `exports/comment-sync-green/dispatcher-Sv12QTo56NoPUu2D-comment-sync-green-20260629T065737Z.sha256` | 74 bytes |

## SHA256
```
79B7BE03187374E4FA68179EED96FA4163738A7CCFA85D42D615AE323DBD4BD9
```

## Workflow Validation
| Check | Ergebnis |
|-------|----------|
| Workflow-ID stimmt | ✅ `Sv12QTo56NoPUu2D` |
| Name | ✅ `GitHub Ready Issue → Runner Agent Dispatch` |
| Active/Published | ✅ `active: true` |
| Schedule Trigger (15 min) | ✅ Node `39db5918` — `scheduleTrigger`, 15-minute interval |
| Manual Trigger | ✅ Node `85e67e06` — `manualTrigger` |
| Node Count | ✅ 18 nodes |
| Node für Kommentarformatierung | ✅ Node `25d2cbd3` — `Format Evidence Comment` |
| Enthält `status.json`-Priority | ✅ `Priority 1: Parse status.json from SSH stdout` |
| Fallback-Kette | ✅ status.json → SSH raw → prepData → hardcoded defaults |
| Credential-Werte im Export | ❌ Nur Metadaten (`id` + `name`, keine Secrets) |
| Secrets | ❌ 0 gefunden |

## Node List
| # | Node ID | Name | Type |
|---|---------|------|------|
| 1 | `85e67e06` | Manual Trigger (Smoke Test) | manualTrigger |
| 2 | `2d16d3af` | Fetch Issue from GitHub | httpRequest |
| 3 | `848355a6` | Guardrails & Validate | code |
| 4 | `d0a66aea` | Remove agent:ready Label | httpRequest |
| 5 | `f75e4581` | Add agent:running Label | httpRequest |
| 6 | `0e03bd83` | Prepare RUN_INPUT.json | code |
| 7 | `bbc6efd4` | SSH Write RUN_INPUT to Runner | ssh |
| 8 | `4f5b0160` | SSH Start Runner Script | ssh |
| 9 | `c7411679` | Wait (5s) | wait |
| 10 | `592fc2b2` | SSH Read status.json | ssh |
| 11 | `25d2cbd3` | Format Evidence Comment | code |
| 12 | `d2de1066` | Create GitHub Comment on Issue | httpRequest |
| 13 | `5f7ff1c9` | Add Labels (needs-review, evidence) | httpRequest |
| 14 | `9d09319e` | Remove agent:running Label | httpRequest |
| 15 | `f1aedb55` | Format Final Result | code |
| 16 | `39db5918` | Schedule Trigger (15 min) | scheduleTrigger |
| 17 | `53e03f46` | GitHub Search Issues (agent:ready) | httpRequest |
| 18 | `39e824f8` | Pick First Ready Issue | code |

## Version Info
| Feld | Wert |
|------|------|
| `versionId` | `8e0fbbf0-2b6d-4528-b73c-932e78c3736e` |
| `activeVersionId` | `8e0fbbf0-2b6d-4528-b73c-932e78c3736e` |
| `versionCounter` | 9 |

## Gate
- **Workflow Snapshot:** ✅ GREEN — Export validiert, SHA256 erstellt, Trigger unverändert, keine Secrets
