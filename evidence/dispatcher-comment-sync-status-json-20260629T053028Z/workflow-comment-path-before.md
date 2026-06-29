# Workflow Comment Path — Before Fix

**Workflow:** `Sv12QTo56NoPUu2D` — "GitHub Ready Issue → Runner Agent Dispatch"  
**Nodes:** 18 total

## Relevant Nodes (Comment Formatting Path)

| # | Name | Type | ID | Description |
|---|------|------|-----|-------------|
| 6 | Prepare RUN_INPUT.json | n8n-nodes-base.code | `0e03bd83-...` | Builds RUN_INPUT from GitHub issue data |
| 10 | SSH Read status.json | n8n-nodes-base.ssh | `592fc2b2-...` | Reads `/status.json` from runner via SSH (`jq .` output) |
| 11 | Format Evidence Comment | n8n-nodes-base.code | `25d2cbd3-...` | Formats the GitHub comment body |
| 12 | Create GitHub Comment on Issue | n8n-nodes-base.httpRequest | `d2de1066-...` | POSTs comment to GitHub API |
| 15 | Format Final Result | n8n-nodes-base.code | `f1aedb55-...` | Formats final workflow result |

## Data Flow

```
Prepare RUN_INPUT.json
    │
    ├────────────────────────┐
    ▼                        ▼
SSH Read status.json    Format Evidence Comment (gets prepData via cross-ref)
    │                        │
    ▼                        ▼
Format Evidence Comment  (gets statusOutput from SSH node)
    │
    ▼
Create GitHub Comment on Issue
    │
    ▼
Format Final Result (also uses prepData, NOT status.json)
```

## Current Data Sources for Comment

1. **Primary:** `$('Prepare RUN_INPUT.json').first().json` — cross-reference to Node 6 (stale RUN_INPUT values)
   - `prepData.mode` → always `'manual-terminal'` (hardcoded in Prepare node)
   - `prepData.agent_runtime.opencode_provider_configured` → always `false` (hardcoded)
   
2. **Secondary:** `$input.first().json` — output from "SSH Read status.json" node (Node 10)
   - Contains the `jq . status.json` output, but WRAPPED in SSH node output format
   - SSH node returns: `{ success: true, stdout: "{...json...}", exitCode: 0 }`
   - Current code checks `typeof statusOutput === 'string'` (fails — it's an object)
   - Falls to `typeof statusOutput === 'object'` → only reads `statusOutput.status` (doesn't exist on SSH wrapper)
   - Result: all parsing fails, uses hardcoded defaults

## Bug Root Cause

The "Format Evidence Comment" node (ID `25d2cbd3-...`) has a type mismatch bug:

```javascript
const statusOutput = $input.first().json;
// statusOutput = { success: true, stdout: "{\n  \"status\": \"GREEN\",...\n}", exitCode: 0 }
// typeof statusOutput === 'object' → TRUE

// Goes to else-if branch:
} else if (typeof statusOutput === 'object') {
    status = statusOutput.status || statusOutput.error || status;
    // statusOutput.status is undefined (SSH wrapper doesn't have 'status' field)
    // statusOutput.error is undefined
    // Result: status stays 'UNKNOWN'
}
```

The actual `status.json` content is inside `statusOutput.stdout` (a JSON string), but the code never reads it.

## Why Comment Values Are Stale

| Field | Comment Shows | Actual Runner Value | Reason |
|-------|--------------|-------------------|--------|
| Status | `UNKNOWN` | `GREEN` | `statusOutput.status` doesn't exist on SSH wrapper |
| Mode | `manual-terminal` | `opencode-run` | Falls back to `prepData.mode` (from RUN_INPUT) |
| Provider configured | `NO` | `true` | `agent_runtime` branch never reached |
| OpenCode version | `v1.17.9` | `1.17.9` | Hardcoded fallback (coincidentally correct) |

## Minimal Fix Point

**Node 11 ("Format Evidence Comment")** — Update the JS code to:
1. Extract `statusOutput.stdout` (SSH node wraps output)
2. Parse `stdout` as JSON to get actual `status.json` content
3. Read all relevant fields from parsed status.json
4. Add fallback: status.json → RUN_INPUT.json
5. Label evidence source clearly
