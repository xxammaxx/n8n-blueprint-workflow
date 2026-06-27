// ============================================================================
// Guardrails: Validate issue state before dispatch
// Check: issue open, agent:ready present, no running/blocked/done
// ============================================================================

const prepRef = $('Manual Trigger (Smoke Test)').first().json;
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
