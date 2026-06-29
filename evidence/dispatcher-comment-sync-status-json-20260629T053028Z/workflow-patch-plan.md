# Workflow Patch Plan — Comment Sync Fix

## Meta
- **Workflow:** `Sv12QTo56NoPUu2D` — "GitHub Ready Issue → Runner Agent Dispatch"
- **Patch Target:** Node 11 — "Format Evidence Comment"
- **Strategy:** Replace JS code in Node 11 only. No structural changes.

## Affected Nodes

| Node | ID | Change |
|------|-----|--------|
| 11 — Format Evidence Comment | `25d2cbd3-b919-4f19-9f41-5aac51841742` | ✏️ JS code updated |
| 15 — Format Final Result | `f1aedb55-8b84-4886-85be-8a672817add5` | ✏️ Minimal: update `dispatch_mode` from status.json |

All other 16 nodes: ❌ UNCHANGED.

## Node 11 — Patch Details

### Before (Current State)
- Reads `$('Prepare RUN_INPUT.json').first().json` for `prepData`
- Reads `$input.first().json` for `statusOutput` (SSH wrapper object)
- Checks `typeof statusOutput === 'string'` → SKIPS (it's an object)
- Checks `typeof statusOutput === 'object'` → reads `.status` or `.error` → FAILS (SSH wrapper doesn't have these)
- Falls back to hardcoded defaults from RUN_INPUT

### After (New State)
- Reads `sshOutput.stdout` and parses it as JSON to extract `status.json` content
- Extracts: status, effective_mode, provider_configured, provider, model, open_code_version, exit_code
- Fallback chain: status.json → prepData (RUN_INPUT) → hardcoded defaults
- Labels evidence source clearly: `Evidence source: status.json` or `Evidence source: fallback`
- Comment structure matches desired format

### Data Source Change
| Field | Before | After |
|-------|--------|-------|
| status | Hardcoded 'UNKNOWN' | `status.json` → `.status` |
| mode | `prepData.mode` (always 'manual-terminal') | `status.json` → `.mode.effective` |
| provider_configured | Hardcoded 'NO' | `status.json` → `.agent_runtime.opencode_provider_configured` |
| provider | Not displayed | `status.json` → `.provider` (if present) |
| model | Not displayed | `status.json` → `.model` (if present) |
| open_code_version | Hardcoded 'v1.17.9' | `status.json` → `.agent_runtime.opencode_version` |
| evidence_source | Not labeled | Explicitly labeled |

## Node 15 — Patch Details

### Before
```javascript
dispatch_mode: 'manual-terminal'
status: 'GREEN_PARTIAL_PLUS'
```

### After
```javascript
dispatch_mode: (parseStatusFromSSH().mode?.effective) || 'manual-terminal'
status: (parseStatusFromSSH().status) || 'GREEN_PARTIAL_PLUS'
```

## Patch Application Method

Since n8n REST API requires email auth (not available), and n8n Public API v1 doesn't support workflow edits, the patch must be applied via:

1. **n8n UI** (if Playwright session is active and authenticated) — Preferred
2. **Manual Workflow JSON edit + n8n UI import** — If UI is accessible but code node edit is difficult
3. **Manual instruction** — If neither is available

Currently: n8n Public API v1 is available but read-only for workflow edits. The "Blockers" section in STATUS.md confirms: "n8n API v1 no workflow write" and "n8n UI session expired".

## Why Patch is Minimal

- Only 1 node's JS code changes (Node 11)
- Optional 1-node JS code change (Node 15)
- No structural workflow changes (no new nodes, no new connections)
- No trigger changes
- No credential changes
- No schedule changes
- No guardrail changes

## Rollback Point

1. Workflow snapshot saved before patch: `exports/comment-sync-before/dispatcher-Sv12QTo56NoPUu2D-before-comment-sync-<TS>.json`
2. To rollback: restore Node 11 JS code to the version in the snapshot
3. SHA256 checksums verified for integrity

## Fallback Behavior

```
try {
  parsed = JSON.parse(sshOutput.stdout)
  status = parsed.status                    // Priority 1
  mode = parsed.mode.effective              // Priority 1
} catch {
  // SSH output couldn't be parsed
  status = sshOutput?.stdout || 'NO_OUTPUT' // Priority 2
}

if (!status || status === 'NO_OUTPUT') {
  status = 'UNKNOWN'                        // Priority 3
  mode = prepData.mode || 'manual-terminal' // Priority 3
}
```
