# n8n Execution Detail — #51

**Execution ID:** #51
**Workflow:** Sv12QTo56NoPUu2D (GitHub Ready Issue -> Runner Agent Dispatch)

## Raw API Data

```json
{
    "id": "51",
    "finished": false,
    "mode": "trigger",
    "retryOf": null,
    "retrySuccessId": null,
    "status": "error",
    "createdAt": "2026-06-27T07:30:28.022Z",
    "startedAt": "2026-06-27T07:30:28.031Z",
    "stoppedAt": "2026-06-27T07:31:53.783Z",
    "deletedAt": null,
    "workflowId": "Sv12QTo56NoPUu2D",
    "waitTill": null,
    "storedAt": "db",
    "tracingContext": null,
    "deduplicationKey": null
}
```

## Analysis

| Property | Value | Interpretation |
|---|---|---|
| mode | `trigger` | ✅ Schedule Trigger (not manual) |
| status | `error` | ⚠️ Due to Format Final Result typo |
| duration | 85.75s | ✅ Full pipeline (not 0.5s fast-skip) |
| workflowId | `Sv12QTo56NoPUu2D` | ✅ Correct workflow |

## Note

The n8n Public API v1 does not return `executionData` with node-level details.
The REST API (which provides node-level data) returns 401 (email auth required).

Node-level execution was verified indirectly via:
1. GitHub label transitions (confirmed)
2. Runner comment posted (confirmed)
3. Execution duration (85.75s = full pipeline)
4. Issue #3/#4 unchanged (guardrails worked)
