# Format Final Result — UI Fix Instructions (TOOL_GAP)

**Timestamp:** 2026-06-27T08:54:36Z
**Status:** YELLOW (TOOL_GAP — manual intervention required)
**Agent:** issue-orchestrator

---

## Why This Is a TOOL_GAP

All three programmatic access methods to n8n are blocked for this specific operation:

| Method | Can Read? | Can Write? | Blocked By |
|---|---|---|---|
| n8n UI via Playwright | ❌ | ❌ | Session expired → /signin redirect |
| n8n Public API v1 | ✅ GET | ❌ | API v1 has no workflow node update endpoint |
| n8n REST API | ❌ | ❌ | Requires cookie-based session auth (email+password) |

The n8n Public API v1 supports:
- `GET /api/v1/workflows/{id}` — read workflow metadata ✅
- `POST /api/v1/workflows/{id}/activate` — activate ✅
- `POST /api/v1/workflows/{id}/deactivate` — deactivate ✅

It does NOT support:
- `PUT /api/v1/workflows/{id}` — update workflow nodes ❌
- `PATCH /api/v1/workflows/{id}` — partial update ❌

Therefore, the node code fix CANNOT be applied by an AI agent programmatically. Manual human intervention via the n8n web UI is required.

---

## Exact Manual Fix Steps

### Step 1 — Open n8n UI and Sign In

1. Open browser: http://192.168.1.52:5678
2. Sign in with n8n owner credentials (email + password)
3. You should see the n8n dashboard with workflow list

### Step 2 — Open Workflow

1. Find workflow: **"GitHub Ready Issue -> Runner Agent Dispatch"**
2. Click to open the workflow editor
3. Verify: you see nodes connected in a pipeline

### Step 3 — Edit "Format Final Result" Node

1. Find the node labeled **"Format Final Result"** (usually at the far right of the workflow canvas)
2. Double-click or select the node to open its settings panel
3. In the JavaScript code editor, locate **line 3**

### Step 4 — Apply the Fix

**Line 3 currently shows:**
```
===========================================================================
```

**Change it to:**
```
// ===========================================================================
```

That's it — just add `// ` at the beginning of line 3.

### Step 5 — Verify NO Other Changes

Check that:
- Line 1: `// ============================================================================` — unchanged ✅
- Line 2: `// Final Result / Log Output` — unchanged ✅
- Line 3: `// ===========================================================================` — FIXED ✅
- All other lines: unchanged ✅
- Last line: `return [{ json: result }];` — unchanged ✅

### Step 6 — Save and Publish

1. Click **Save** (or Ctrl+S)
2. If prompted to **Publish**, click Publish
3. Verify the workflow toggle shows **Active** (green/on state)

### Step 7 — Quick Sanity Check

1. Close and re-open the workflow
2. Open Format Final Result node
3. Verify line 3 still shows `// ===========================================================================`
4. Close the node — do NOT execute manually

---

## What NOT to Do

- ❌ Do NOT change any other code lines
- ❌ Do NOT modify Guardrails & Validate node
- ❌ Do NOT change return format (`return [{ json: result }];`)
- ❌ Do NOT deactivate the workflow
- ❌ Do NOT touch any credentials
- ❌ Do NOT export/import the workflow
- ❌ Do NOT execute a manual test run
- ❌ Do NOT touch Issues #3, #4, #5, #6

---

## After Fix Confirmation

Once the fix is applied:

1. The next Schedule Trigger (every 15 min at :00:28) will fire normally
2. If no `agent:ready` issue exists, execution will complete in < 1s with SUCCESS
3. When Canary Issue #7 is created, the Schedule Trigger will pick it up
4. The full pipeline will execute and Format Final Result will complete without error
5. n8n Execution status will show **success** instead of error
6. Status can be upgraded from GREEN to GREEN_EXECUTION_SUCCESS

---

## Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| Accidental code change | LOW | Only 1 line changes; clearly documented |
| Workflow deactivation | LOW | Don't click deactivate |
| Breaking dispatch | NONE | Error is in LAST node; all prior nodes complete fine |
| Data loss | NONE | No data changes involved |
| Secret exposure | NONE | Fix doesn't touch credentials |

---

## Estimated Effort

- **Time:** < 2 minutes
- **Complexity:** Trivial (add 3 characters to 1 line)
- **Risk:** Near-zero
