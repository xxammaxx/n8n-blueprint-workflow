# Format Final Result — AFTER Fix (PROPOSED)

**Node ID:** `f1aedb55-8b84-4886-85be-8a672817add5`
**Node Type:** `n8n-nodes-base.code`
**Status:** **TOOL_GAP** — Fix cannot be applied via available API; documented for manual application

## Fixed Code (proposed):

```javascript
// ============================================================================
// Final Result / Log Output
// ===========================================================================

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

## Diff

```diff
  // ============================================================================
  // Final Result / Log Output
- ===========================================================================
+ // ===========================================================================

  const prepData = $('Prepare RUN_INPUT.json').first().json;
```

**Single change:** Added `// ` prefix to line 3.
**Logic:** Unchanged.
**Output structure:** Unchanged.
**`return [{ json: result }];`:** Preserved.
