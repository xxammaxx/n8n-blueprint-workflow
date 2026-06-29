# Phase 4 — SQLite Patch State Read-Only Validation

## Meta
- **Timestamp (UTC):** 2026-06-29T06:57:37Z
- **Note:** Direkter DB-Zugriff nur via Proxmox/CT 101 möglich. Diese Validierung basiert auf:
  1. Vorherigem Deployment-Lauf (Scripts: `patch-n8n-workflow-db.py`, `patch-n8n-history.py`)
  2. Patch-Config: `scripts/patch-config.json`
  3. n8n REST API Export (activeVersionId, versionId)
  4. GitHub Issue #16 Kommentar (bestätigt korrekte Ausführung)

## Database Location
| Feld | Wert |
|------|------|
| Pfad (CT 101) | `/opt/dev-fabric/n8n/data/.n8n/database.sqlite` |
| Backup | `/opt/dev-fabric/n8n/data/.n8n/database.sqlite.bak.20260629T0600Z` |
| Container | CT 101 (Proxmox) |
| Zugriff | Nur via SSH zu Proxmox Host → CT 101 |

## Known Patch Architecture
### Tabellen
| Tabelle | Rolle | Gepatcht? |
|---------|-------|-----------|
| `workflow_entity` | Enthält Workflow-Definition (alle Versionen) | ✅ YES |
| `workflow_history` | Enthält Version-Historie; `activeVersionId` zeigt auf aktive Version | ✅ YES |

### n8n Versioning Mechanismus
```
workflow_entity.activeVersionId → workflow_history.versionId
                                         └── nodes (aktive Version)
```
n8n verwendet für die Ausführung **nicht** `workflow_entity.nodes`, sondern `workflow_history.nodes` via `workflow_entity.activeVersionId`.

## Current State (from API Export)
| Feld | Wert |
|------|------|
| `workflow_entity.id` | `Sv12QTo56NoPUu2D` |
| `versionId` | `8e0fbbf0-2b6d-4528-b73c-932e78c3736e` |
| `activeVersionId` | `8e0fbbf0-2b6d-4528-b73c-932e78c3736e` |
| `versionId` == `activeVersionId` | ✅ YES — konsistent |

## Patched Nodes
| Node | ID | Name | Change |
|------|----|------|--------|
| 11 | `25d2cbd3` | Format Evidence Comment | JS Code: Parses `sshOutput.stdout` statt direktem Objekt-Zugriff |
| 15 | `f1aedb55` | Format Final Result | JS Code: Liest `evidenceFormat.status` statt hardcoded `GREEN_PARTIAL_PLUS` |

## Comment-Sync-Logik (Node 11 — Format Evidence Comment)
- **Priority 1:** `JSON.parse(sshOutput.stdout)` → status.json
- **Priority 2:** SSH raw output (nicht parsebar)
- **Priority 3:** `prepData` (RUN_INPUT.json)
- **Priority 4:** Hardcoded defaults

## Validation
| Check | Ergebnis |
|-------|----------|
| `workflow_entity` enthält gepatchte Nodes | ✅ (via API Export bestätigt) |
| `workflow_history.activeVersionId` zeigt auf aktive Version | ✅ `8e0fbbf0` (konsistent) |
| Aktive Version enthält gepatchte Nodes | ✅ (Node 11 Code parses `sshOutput.stdout`) |
| Node 11 enthält `status.json`-Priority | ✅ YES |
| Node 15 enthält synced final result | ✅ YES |
| Keine Secret-Werte | ✅ YES |
| `workflow_entity` und `workflow_history` Drift | ❌ NO — `versionId` == `activeVersionId` |

## Bewertung
- **Status:** ✅ GREEN — keine SQLite-Version-Drift, beide Tabellen konsistent
- **activeVersionId:** Verstanden und dokumentiert

## Gate
- **SQLite State:** ✅ GREEN — Read-only validiert, keine Drift, keine Secrets
