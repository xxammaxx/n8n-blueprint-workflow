# Node 15 — Format Final Result: Recommended Fix

---

## Fixed Code

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

return [{ json: result }];
```

## Changes

| Line | Before | After |
|---|---|---|
| Return statement | `return result;` | `return [{ json: result }];` |

## Rationale

All other Code nodes in this workflow use the n8n-standard `return [{ json: ... }]` format:
- Guardrails & Validate: `return [{ json: guardResult }]`
- Format Evidence Comment: uses item-based output

Returning a bare object (`return result;`) is not the n8n-expected format and may be flagged as an execution error by the n8n runtime.

## Minimality

- Only the return statement is changed
- No business logic is modified
- Output structure is preserved (wrapped in n8n standard format)
- No error handling added (out of scope for this minimal fix)
- No secrets in code

## Additional Recommended Hardening (Optional, Not Applied)

For future robustness, consider adding error handling:

```javascript
try {
  const prepData = $('Prepare RUN_INPUT.json').first().json;
  // ... rest of logic ...
  return [{ json: result }];
} catch (error) {
  return [{
    json: {
      status: 'ERROR',
      error: 'Format Final Result failed: ' + error.message
    }
  }];
}
```
