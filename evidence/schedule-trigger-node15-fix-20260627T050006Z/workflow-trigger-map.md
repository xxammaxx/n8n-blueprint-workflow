# Workflow Trigger Map — Dispatcher Sv12QTo56NoPUu2D

## Trigger Nodes

### 1. Manual Trigger (Smoke Test)
| Property | Value |
|---|---|
| Node # (UI) | 1 |
| Type | `n8n-nodes-base.manualTrigger` |
| ID | `a1b2c3d4-e001-4001-a001-000000000001` |
| Position | [0, 0] |
| Status (GitHub JSON) | ✅ Present |
| Status (Live n8n) | ✅ Confirmed (Execution #44) |

**Flow:**
```
Manual Trigger → Fetch Issue from GitHub → Guardrails → [dispatch path]
```

### 2. Schedule Trigger (10 min)
| Property | Value |
|---|---|
| Node # (UI) | 16 |
| Type | `n8n-nodes-base.scheduleTrigger` |
| ID | `a1b2c3d4-e016-4016-a016-000000000016` |
| Position | [0, 300] |
| Interval | 10 minutes (→ change to 15 min) |
| Status (GitHub JSON) | ✅ Present |
| Status (Live n8n) | ❌ Missing (per user report) |

**Flow:**
```
Schedule Trigger → GitHub Search Issues (agent:ready) → Pick First Ready Issue
    → Fetch Issue from GitHub → Guardrails → [dispatch path]
```

## Convergence Point

Both triggers converge at **`Fetch Issue from GitHub`** (node 2), which then passes through **`Guardrails & Validate`** (node 3) where double-start protection is enforced.

## Guardrails Double-Start Protection

```
IF issue NOT open → BLOCK
IF agent:ready NOT present → BLOCK
IF agent:running present → BLOCK (duplicate run protection)
IF agent:blocked present → BLOCK
IF agent:done present → BLOCK
→ PASS: Proceed to dispatch
```

## Dispatch Path (common to both triggers)

```
Fetch Issue → Guardrails PASS →
  Remove agent:ready → Add agent:running →
  Prepare RUN_INPUT → SSH Write → SSH Start → Wait 5s → SSH Read →
  Format Evidence Comment → Create GitHub Comment →
  Add Labels (agent:needs-review, evidence:attached) →
  Remove agent:running (404-tolerant) →
  Format Final Result (Node 15)
```

## Recommendation

1. **Apply the GitHub JSON version** to the live n8n instance
2. **Change Schedule Trigger interval** from 10 to 15 minutes
3. **Apply Node 15 fix** (return format)
4. **Activate workflow** via UI (Publish + Active toggle)
5. **Verify:** `journalctl` should show schedule trigger registration
