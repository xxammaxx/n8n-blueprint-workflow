# Node 15 — Format Final Result: Analysis

**Node:** 15 (in n8n UI numbering)
**Name:** `Format Final Result`
**Type:** `n8n-nodes-base.code`
**ID:** `a1b2c3d4-e015-4015-a015-000000000015`
**Position:** [3584, 0]

---

## Code (from GitHub JSON — fixed version)

```javascript
// ============================================================================
// Final Result / Log Output
// ============================================================================

const prepData = $('Prepare RUN_INPUT.json').first().json;

const result = {
  status: 'GREEN_PARTIAL_PLUS',
  issue_number: prepData.issue_number,
  issue_url: prepData.issue_url,
  run_id: prepData.run_id,
  evidence_dir: prepData.evidence_dir,
  dispatch_mode: 'manual-terminal',
  guardrail_passed: true,
  labels_updated: true,
  comment_posted: true,
  next_action: 'Issue remains open. Human review required. Labels: agent:needs-review + evidence:attached set. OpenCode Provider/Auth + Hermes continue pending.'
};

return result;
```

---

## History (from Issue #3 comments)

### Original Issue
During the initial activation session, the n8n UI Publish button was **disabled** because the `Format Final Result` Code node contained an **unused variable** that the n8n linter rejected.

### Fix Applied (2026-06-26)
- The unused variable line was removed via **n8n REST API PATCH**
- The commit `649c048` was pushed to GitHub with the fix in `workflows/github-ready-issue-dispatch.export.json`
- Workflow was then activated via `POST /rest/workflows/Sv12QTo56NoPUu2D/activate` → 200 OK

### Execution #44 (2026-06-26)
During the manual trigger test:
- Nodes 1-14: SUCCESS
- **Node 15: ERROR (pre-existing JS syntax)**

Despite the earlier fix, Node 15 still produced an error during actual execution. This suggests either:
1. The API PATCH was not applied correctly to the live instance
2. There is a different syntax error not addressed by the unused-variable fix
3. The GitHub JSON has the fix but the live instance does not

---

## Current Code Analysis

### Syntax Validation

| Check | Result |
|---|---|
| `const prepData = ...` | ✅ Valid variable declaration |
| `$('Prepare RUN_INPUT.json')` | ✅ n8n function call, valid JS syntax |
| `.first().json` | ✅ Method chaining, valid JS |
| Object literal `result = { ... }` | ✅ Valid |
| String literal with special chars | ✅ Valid (single quotes, no unescaped chars) |
| `return result;` | ✅ Valid return |
| Comments | ✅ Valid `//` comments |
| No unused variables | ✅ Only `prepData` and `result` are declared and used |

### Potential Issues in n8n Context

1. **`$('Prepare RUN_INPUT.json')` relies on node name matching** — if the upstream node was renamed, this would fail at runtime (but NOT as a syntax error)
2. **`.first().json` assumes at least one item exists** — if empty, runtime TypeError
3. **Missing error handling** — no try/catch around the `$()` call
4. **`return result;` returns a plain object** — n8n Code nodes expect `return [{ json: result }]` or similar array-of-items format. Returning a bare object MAY cause issues in some n8n versions.

### ROOT CAUSE HYPOTHESIS

The most likely cause of the "pre-existing JS syntax" error in Execution #44 is:

**The `return result;` statement returns a bare object instead of the n8n-expected `return [{ json: result }]` format.**

While this isn't a JavaScript syntax error per se, some n8n versions treat invalid return formats as syntax/execution errors. The n8n linter may flag this.

### Recommended Fix

Change the return statement to return an array of items with `json` property:

```javascript
return [{ json: result }];
```

This matches the pattern used by other Code nodes in the same workflow (e.g., Guardrails & Validate returns `return [{ json: guardResult }]`).
