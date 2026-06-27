# Schedule Trigger — Recommended Configuration

## Updated Configuration (15-minute interval)

```json
{
  "rule": {
    "interval": [
      {
        "field": "minutes",
        "minutesInterval": 15
      }
    ]
  }
}
```

## Changes

| Parameter | Before | After | Reason |
|---|---|---|---|
| `minutesInterval` | 10 | 15 | User requirement: more conservative polling |

## Justification

- 15 minutes is the user-specified minimum
- Reduces GitHub API load by 33% compared to 10 minutes
- Still sufficiently responsive for agent dispatch use case
- Manual Trigger provides on-demand execution capability
- Double-start protection in Guardrails prevents duplicate runs even at higher frequency

## Schedule Trigger Flow

```
Schedule Trigger (every 15 min)
    ↓
GitHub Search Issues (agent:ready)
    ↓ query: "is:issue is:open label:agent:ready repo:xxammaxx/n8n-blueprint-workflow"
    ↓
Pick First Ready Issue
    ↓ extract: issue number, title, labels
    ↓
Fetch Issue from GitHub
    ↓ GET /repos/xxammaxx/n8n-blueprint-workflow/issues/{number}
    ↓
Guardrails & Validate
    ↓ check: open, agent:ready present, no agent:running/blocked/done
    ↓
[Continue standard dispatch path]
```

## Manual Trigger Preservation

The Manual Trigger at position [0, 0] and the Schedule Trigger at position [0, 300] run in **parallel, independent paths**. They converge at `Fetch Issue from GitHub` → `Guardrails & Validate`.

- Manual Trigger: user-initiated, uses pinData or manual input for issue selection
- Schedule Trigger: automatic, uses GitHub Search API to find `agent:ready` issues

Both paths benefit from the same Guardrails double-start protection.

## How to Apply (Manual Steps)

Since n8n API access is not available (API key missing), the change must be applied manually:

### Option A: n8n UI
1. Login to http://192.168.1.52:5678
2. Open workflow `Sv12QTo56NoPUu2D`
3. If Schedule Trigger node is missing: Add `Schedule Trigger` node, configure interval to 15 minutes
4. Connect: Schedule Trigger → GitHub Search Issues (agent:ready)
5. If Schedule Trigger exists but interval is 10 min: Edit node → change to 15 minutes
6. Save and Activate workflow

### Option B: n8n API (if API key becomes available)
```bash
# Update the schedule trigger node
curl -X PATCH "http://192.168.1.52:5678/rest/workflows/Sv12QTo56NoPUu2D" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"nodes": [...updated nodes...]}'
```
