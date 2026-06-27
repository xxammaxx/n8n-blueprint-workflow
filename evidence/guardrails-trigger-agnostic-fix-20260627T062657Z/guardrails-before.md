# Guardrails Node — Live Code Analysis (BEFORE)

**Source:** Live n8n instance via Playwright
**Node:** Guardrails & Validate
**Node ID:** `848355a6-223e-4e84-8b34-b5e7b5f634dc`
**Captured:** 2026-06-27T08:30:00Z

---

## Current Code (BROKEN)

```javascript
// ============================================================================
// Guardrails: Validate issue state before dispatch
// Check: issue open, agent:ready present, no running/blocked/done
// ============================================================================

const prepRef = $('Manual Trigger (Smoke Test)').first().json;  // ← BUG: Hard dependency
const issueData = $input.first().json;

const owner = prepRef.owner || 'xxammaxx';
const repo = prepRef.repo || 'n8n-blueprint-workflow';
const issueNumber = prepRef.issue_number || issueData.number || 0;
const issueTitle = issueData.title || '';
const issueBody = issueData.body || '';
const issueState = issueData.state || 'unknown';
const labels = issueData.labels || [];

const labelNames = labels.map(function(l) { return typeof l === 'string' ? l : l.name; }).filter(Boolean);
const hasReady = labelNames.includes('agent:ready');
const hasRunning = labelNames.includes('agent:running');
const hasBlocked = labelNames.includes('agent:blocked');
const hasDone = labelNames.includes('agent:done');

var mode = 'manual-terminal';
if (labelNames.includes('mode:opencode-run')) mode = 'opencode-run';
else if (labelNames.includes('mode:hermes-review')) mode = 'hermes-review';

var risk = 'medium';
if (labelNames.includes('risk:low')) risk = 'low';
else if (labelNames.includes('risk:high')) risk = 'high';

const isOpen = issueState === 'open';
const canStart = isOpen && hasReady && !hasRunning && !hasBlocked && !hasDone;

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
  guardrail_reason: !isOpen ? 'issue not open' :
                    !hasReady ? 'label agent:ready missing' :
                    hasRunning ? 'already running' :
                    hasBlocked ? 'is blocked' :
                    hasDone ? 'is done' : 'unknown'
};

if (!canStart) {
  throw new Error('GUARDRAIL_BLOCKED: ' + guardResult.guardrail_reason + ' (issue #' + issueNumber + ')');
}

return [{
  json: guardResult
}];
```

---

## Bug Analysis

### Root Cause
**Line 6:** `const prepRef = $('Manual Trigger (Smoke Test)').first().json;`

This line unconditionally references the Manual Trigger node. When the Schedule Trigger fires:
1. The Manual Trigger node was **never executed**
2. n8n throws: `Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed`
3. The code likely has a try/catch elsewhere or the n8n runtime wraps it, leading to:
   `Cannot assign to read only property 'name' of object 'Error: ...'`

### What `prepRef` provides
- `prepRef.owner` → always falls back to `'xxammaxx'` (static)
- `prepRef.repo` → always falls back to `'n8n-blueprint-workflow'` (static)
- `prepRef.issue_number` → falls back to `issueData.number || 0`

**All three values are either static or fall back to `issueData` which is already available from `$input.first().json`.**

### Impact
- **Manual Trigger path:** Works correctly (Manual Trigger has pinData with owner/repo/issue_number)
- **Schedule Trigger path:** CRASHES — Manual Trigger never executed in this path
- **Result:** 100% of schedule-triggered executions fail

---

## Fix Strategy

Remove the `prepRef` dependency entirely. Use static values for owner/repo (single-repo dispatcher) and `issueData` for issue_number.

The GitHub export already has this fix applied (uses `$input.first().json` only).
