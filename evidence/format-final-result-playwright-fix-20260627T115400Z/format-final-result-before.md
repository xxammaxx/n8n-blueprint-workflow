# Format Final Result — Before Fix

**Timestamp:** 2026-06-27T11:48:00Z (approximately)
**Source:** n8n Public API v1 GET /api/v1/workflows/Sv12QTo56NoPUu2D
**Version:** Active version (bb201347-cb81-4085-a2ae-89192692e0d1)

## Bug Confirmed

The active (executing) version of the workflow had the syntax error on line 3:

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

## The Problem

**Line 3:** `===========================================================================` — MISSING `//` prefix

This caused n8n to throw `Unexpected token '==='` at runtime.

## Evidence Sources

1. n8n Public API v1 live fetch — raw JSON showed `\n===========================================================================\n` without `//`
2. Version mismatch: draft versionId (`8e0fbbf0-2b6d-4528-b73c-932e78c3736e`) ≠ activeVersionId (`bb201347-cb81-4085-a2ae-89192692e0d1`)
3. Previous evidence files from multiple canary runs (issue-5, issue-6, issue-7) all documented this bug
4. WorkflowPublishHistory showed last publish at 2026-06-27T06:44:50Z, while draft was updated at 2026-06-27T09:28:11Z

## Draft State (Pre-Fix)

The draft already had the fix applied (line 3: `// ===========================================================================`), but was NOT published — so the executing version still used the broken code.
