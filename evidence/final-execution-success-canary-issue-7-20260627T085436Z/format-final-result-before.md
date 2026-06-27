# Format Final Result — BEFORE Fix

**Timestamp:** 2026-06-27T08:54:36Z
**Workflow:** Sv12QTo56NoPUu2D
**Node:** Format Final Result (ID: f1aedb55-8b84-4886-85be-8a672817add5)
**Source:** n8n Public API v1 GET + evidence workflow JSON

---

## Current Code (BROKEN)

```javascript
// ============================================================================
// Final Result / Log Output
===========================================================================

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

return [{ json: result }];
```

---

## Problem

**Line 3:** `===========================================================================`

This line has NO `//` JavaScript comment prefix. In JavaScript, `====` is not a valid statement:
- `===` is a strict equality operator
- `====` (four equals signs) is syntactically invalid
- Even if it were valid, the line has no operands

This causes a **SyntaxError** when the n8n Code node executes.

---

## Impact

| Aspect | Status |
|---|---|
| All prior nodes complete | ✅ YES (Search, Fetch, Guardrails, Labels, Runner, Comment) |
| Runner dispatched | ✅ YES (before Format Final Result) |
| Evidence generated | ✅ YES (on lxc-dev-runner) |
| GitHub comment posted | ✅ YES (before Format Final Result) |
| Labels updated | ✅ YES (before Format Final Result) |
| n8n Execution status | ❌ ERROR (due to SyntaxError in last node) |
| Functional work | ✅ Complete |
| Cosmetic status | ❌ "error" instead of "success" |

---

## Evidence of Error

Executions where an issue WAS processed (and reached Format Final Result):

| Exec # | Issue | Duration | Status | Nodes |
|---|---|---|---|---|
| #53 | #6 | 89.5s | ERROR | 1-14 success, 15 error |
| #51 | #5 | 85.75s | ERROR | 1-14 success, 15 error |
| #48 | #4 | ~90s | ERROR | 1-14 success, 15 error |

Executions where NO issue was found (never reached Format Final Result):

| Exec # | Duration | Status |
|---|---|---|
| #56 | 0.467s | SUCCESS |
| #55 | 0.396s | SUCCESS |
| #54 | 0.853s | SUCCESS |
| #52 | 0.421s | SUCCESS |

**Confirmed:** The error only occurs when an issue IS processed and the Format Final Result node executes.

---

## Verification

- [x] Typo present: YES — line 3 has `====` without `//`
- [x] Fix needed: YES — add `// ` prefix to line 3
- [x] No other code changes needed: YES — only line 3 is broken
- [x] `return [{ json: result }];` is correct: YES — already fixed
- [x] Guardrails code is trigger-agnostic: YES — confirmed
