# n8n Schedule Execution Check

**Session:** schedule-auto-run-verification-20260627T061306Z
**Workflow:** `Sv12QTo56NoPUu2D`
**Date:** 2026-06-27T06:13:06Z

---

## Execution Summary

| Metric | Value |
|---|---|
| Total Prod. Executions | 13 |
| Failed | 11 |
| Successful | 1 (#41, manual) |
| Pending/Waiting | 1 (#44, manual, Format Final Result SyntaxError) |
| Failure Rate | 84.6% |

---

## Schedule-Triggered Executions

### Execution #45
| Field | Value |
|---|---|
| Status | ❌ Error |
| Started At | 2026-06-27T06:00:28Z (08:00:28 CEST) |
| Duration | 1.052 s |
| Trigger | **Schedule Trigger (15 min)** |
| Failing Node | Guardrails & Validate |
| Error | `Cannot assign to read only property 'name' of object 'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'` |

### Execution #46
| Field | Value |
|---|---|
| Status | ❌ Error |
| Started At | 2026-06-27T06:15:28Z (08:15:28 CEST) |
| Duration | 888 ms |
| Trigger | **Schedule Trigger (15 min)** |
| Failing Node | Guardrails & Validate |
| Error | Same as #45: `Cannot assign to read only property 'name' of object 'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'` |

---

## Manual-Triggered Executions (Recent)

### Execution #44
| Field | Value |
|---|---|
| Status | ❌ Error |
| Started At | 2026-06-26T07:37:59Z |
| Duration | 1m 28s |
| Trigger | Manual Trigger |
| Failing Node | Format Final Result (Node 15) |
| Error | `SyntaxError: Unexpected token '==='` |

> **Note:** Node 15 syntax was fixed after this execution. The fix (`return [{ json: result }];`) was applied via API on 2026-06-27T05:57Z.

### Execution #43
| Field | Value |
|---|---|
| Status | ❌ Error |
| Started At | 2026-06-26T07:23:32Z |
| Duration | 481 ms |
| Trigger | Manual Trigger |
| Failing Node | Guardrails & Validate |
| Error | `ready missing (issue #2) [line 60]` — Expected guardrail behavior |

### Execution #42
| Field | Value |
|---|---|
| Status | ❌ Error |
| Started At | 2026-06-26T05:29:39Z |
| Duration | 997 ms |
| Trigger | Manual Trigger |
| Error | `ready missing (issue #2) [line 60]` — Expected guardrail behavior |

### Execution #41
| Field | Value |
|---|---|
| Status | ✅ **Success** |
| Started At | 2026-06-25T03:47:36Z |
| Duration | 1m 25s |
| Trigger | Manual Trigger |
| Result | GREEN_PARTIAL_PLUS, manual-terminal dispatch |

---

## Key Questions Answered

| Question | Answer |
|---|---|
| Gibt es seit dem letzten Fix-Lauf eine Execution durch Schedule Trigger? | ✅ Ja — 2 Executions (#45, #46) |
| Startzeit? | #45: 06:00 UTC, #46: 06:15 UTC |
| Status? | Beide Error |
| Wurde Issue #4 verarbeitet? | ❌ Nein — Guardrails Node crashed vor Issue-Verarbeitung |
| Wurde Issue #3 NICHT verarbeitet? | ✅ Korrekt — Issue #3 nicht angetastet |
| Gab es doppelte Executions? | Nein — 15-Min-Intervall eingehalten |
| Lief Node 15 erfolgreich? | ❌ Nie erreicht (Guardrails crash vorher) |
| Wurde Runner in LXC 102 gestartet? | ❌ Nein — Workflow erreicht Runner-Node nie |
| Wurde Evidence erzeugt? | ❌ Nein |

---

## Root Cause

Der `Guardrails & Validate` Node (Node 7 im Workflow) hat einen harten Verweis auf den `Manual Trigger (Smoke Test)` Node:

```javascript
// Im Guardrails Node-Code:
$('Manual Trigger (Smoke Test)').first().json.someProperty = ...
```

Wenn der Schedule Trigger feuert, wird der Manual Trigger Node **nicht ausgeführt** und hat dementsprechend **keine Output-Daten**. Der Zugriff auf `.first().json` scheitert mit:

```
Cannot assign to read only property 'name' of object 
'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'
```

Dies betrifft ALLE Schedule-Trigger-Executions, da der Manual Trigger Node nur bei manueller Ausführung Daten liefert.

---

## Impact

| Item | Status |
|---|---|
| Schedule Trigger | ✅ Feuert korrekt |
| Workflow Active | ✅ Published |
| Workflow erreicht Guardrails | ✅ (Schedule → Search → Pick → Fetch → Guardrails) |
| Guardrails validiert Issue | ❌ Crash vor Validierung |
| Issue #4 verarbeitet | ❌ Nie erreicht |
| Gesamt-Erfolgsrate | ⚠️ 7.7% (1/13) |

---

## Screenshots (via Playwright Agent)

- `execution-46-page-top.png` — Execution #46 header
- `execution-46-error-details.png` — Execution #46 error details mit Workflow-Graph
- `execution-list-overview.png` — Vollständige Execution-Liste
