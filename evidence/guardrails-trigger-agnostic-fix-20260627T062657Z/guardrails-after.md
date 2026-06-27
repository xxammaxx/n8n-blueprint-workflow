# Guardrails Node — Fixed Code (AFTER)

**Fix applied:** 2026-06-27T08:32:00Z
**Status:** Trigger-agnostic, production-ready

---

## Key Changes from OLD to NEW

| # | Change | Old Code | New Code | Reason |
|---|---|---|---|---|
| 1 | **Removed Manual Trigger dependency** | `const prepRef = $('Manual Trigger (Smoke Test)').first().json;` | *(removed entirely)* | Schedule Trigger path has no Manual Trigger data — causes crash |
| 2 | **Static owner/repo** | `const owner = prepRef.owner \|\| 'xxammaxx';` | `const owner = 'xxammaxx';` | Static single-repo dispatcher |
| 3 | **issue_number from input** | `const issueNumber = prepRef.issue_number \|\| issueData.number \|\| 0;` | `const issueNumber = issueData.number \|\| 0;` | `$input.first().json` always has `number` from Fetch Issue |
| 4 | **Issue #3 hard block** | *(missing)* | `const isIssue3 = issueNumber === 3;` → included in `canStart` | Prevent accidental re-processing of completed smoke test |
| 5 | **Already-processed detection** | *(missing)* | `const isAlreadyProcessed = needsReview && evidenceAttached;` → included in `canStart` | Prevent duplicate processing of issues with `agent:needs-review` + `evidence:attached` |
| 6 | **No Error mutation** | `throw new Error(...)` (OK but no guard) | `const blockError = new Error(...); throw blockError;` | Explicitly creates new Error object — no mutation of read-only properties |
| 7 | **Expanded guardrail_reason** | 5 cases | 7 cases | Added `isIssue3` and `isAlreadyProcessed` reasons |

---

## Full Fixed Code

```javascript
// ============================================================================
// Guardrails: Validate issue state before dispatch
// Check: issue open, agent:ready present, no running/blocked/done
// FIXED: Trigger-agnostic — works with BOTH Manual Trigger AND Schedule Trigger
// ============================================================================

const issueData = $input.first().json;

// Static values for single-repo dispatcher (no dependency on any specific trigger)
const owner = 'xxammaxx';
const repo = 'n8n-blueprint-workflow';
const issueNumber = issueData.number || 0;
const issueTitle = issueData.title || '';
const issueBody = issueData.body || '';
const issueState = issueData.state || 'unknown';
const labels = issueData.labels || [];

const labelNames = labels.map(function(l) { return typeof l === 'string' ? l : l.name; }).filter(Boolean);
const hasReady = labelNames.includes('agent:ready');
const hasRunning = labelNames.includes('agent:running');
const hasBlocked = labelNames.includes('agent:blocked');
const hasDone = labelNames.includes('agent:done');
const needsReview = labelNames.includes('agent:needs-review');
const evidenceAttached = labelNames.includes('evidence:attached');

var mode = 'manual-terminal';
if (labelNames.includes('mode:opencode-run')) mode = 'opencode-run';
else if (labelNames.includes('mode:hermes-review')) mode = 'hermes-review';

var risk = 'medium';
if (labelNames.includes('risk:low')) risk = 'low';
else if (labelNames.includes('risk:high')) risk = 'high';

const isOpen = issueState === 'open';

// HARD BLOCK: Issue #3 is a completed smoke test — never re-process
const isIssue3 = issueNumber === 3;

// Detect already-processed issues (agent:needs-review + evidence:attached = done)
const isAlreadyProcessed = needsReview && evidenceAttached;

const canStart = isOpen && hasReady && !hasRunning && !hasBlocked && !hasDone && !isIssue3 && !isAlreadyProcessed;

const guardResult = {
  owner: owner,
  repo: repo,
  issue_number: issueNumber,
  issue_title: issueTitle,
  issue_body: issueBody,
  issue_url: 'https://github.com/' + owner + '/' + repo + '/issues/' + issueNumber,
  is_open: isOpen,
  has_ready: hasReady,
  has_running: hasRunning,
  has_blocked: hasBlocked,
  has_done: hasDone,
  can_start: canStart,
  mode: mode,
  risk: risk,
  labels: labels,
  label_names: labelNames,
  guardrail: canStart ? 'PASS' : 'BLOCKED',
  guardrail_reason: canStart ? 'Ready to dispatch' : (
    isIssue3 ? 'HARD BLOCK: Issue #3 is a completed smoke test — never re-process' :
    isAlreadyProcessed ? 'Already processed (agent:needs-review + evidence:attached present)' :
    !isOpen ? 'Issue is not open' :
    !hasReady ? 'Missing agent:ready label' :
    hasRunning ? 'agent:running already set — duplicate run blocked' :
    hasBlocked ? 'Issue is blocked' :
    hasDone ? 'Issue already done' : 'Unknown guardrail failure'
  )
};

// Block non-startable issues (but DON'T mutate Error objects — create new error)
if (!canStart) {
  const blockError = new Error('GUARDRAIL_BLOCKED: ' + guardResult.guardrail_reason + ' (issue #' + issueNumber + ')');
  throw blockError;
}

return [{
  json: guardResult
}];
```

---

## Validation Checks

| Check | Status |
|---|---|
| No `$('Manual Trigger')` reference | ✅ Removed |
| No hard trigger dependency | ✅ Uses only `$input.first().json` |
| No Error object mutation | ✅ Creates new Error via `new Error()` |
| Output format n8n-compatible | ✅ `return [{ json: guardResult }];` |
| Issue #3 hard block | ✅ `isIssue3` in canStart check |
| agent:ready guard | ✅ `hasReady` in canStart check |
| Already-processed guard | ✅ `isAlreadyProcessed` in canStart check |
| Double-start protection | ✅ `hasRunning` in canStart check |
| Blocked/done guard | ✅ `hasBlocked` / `hasDone` in canStart check |
| No secrets in code | ✅ All values are static or from input |
| Static owner/repo | ✅ Hardcoded for single-repo dispatcher |
