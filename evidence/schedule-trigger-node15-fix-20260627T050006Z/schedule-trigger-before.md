# Schedule Trigger — Current State (GitHub JSON)

## Node Details

| Property | Value |
|---|---|
| Name | `Schedule Trigger (10 min)` |
| Type | `n8n-nodes-base.scheduleTrigger` |
| ID | `a1b2c3d4-e016-4016-a016-000000000016` |
| Position | [0, 300] |

## Current Configuration

```json
{
  "rule": {
    "interval": [
      {
        "field": "minutes",
        "minutesInterval": 10
      }
    ]
  }
}
```

## Analysis

| Aspect | Current | Assessment |
|---|---|---|
| Frequency | Every 10 minutes | ⚠️ Higher than recommended 15 min |
| Trigger mode | Interval-based | ✅ Standard n8n schedule |
| Connection | → GitHub Search Issues → Pick First Ready Issue → Fetch Issue | ✅ Correct flow |
| Manual Trigger preserved | Yes — separate parallel path | ✅ Both triggers coexist |

## User Requirements

- Schedule Trigger: **15 minutes or more conservative**
- Manual Trigger: **preserve**
- No aggressive polling
- Double-start protection mandatory

## Discrepancy

| Source | Schedule Trigger | 
|---|---|
| GitHub JSON | ✅ Present (10 min interval) |
| User Report (Live n8n) | ❌ Missing entirely |

**Hypothesis:** The GitHub JSON was updated with the Schedule Trigger after the live instance was checked. The live n8n instance may still have the old version without the Schedule Trigger node.
