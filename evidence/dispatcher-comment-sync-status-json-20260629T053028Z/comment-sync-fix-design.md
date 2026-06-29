# Comment-Sync Fix Design

## Target

Replace stale `RUN_INPUT.json` values in GitHub comment with real Runner Evidence from `status.json`.

## Priority Logic

```
1. Echte Runner-Evidence aus status.json (via SSH stdout → JSON.parse)
2. Falls status.json fehlt/Parse-Fehler: SSH-Ausgabe unverändert durchreichen
3. Falls SSH fehlschlägt: ursprüngliche RUN_INPUT.json-Werte
4. Nur als letzter Fallback: Hardcoded defaults ('UNKNOWN', 'manual-terminal')
```

## Fix Point

**Node 11: "Format Evidence Comment"** (ID `25d2cbd3-b919-4f19-9f41-5aac51841742`)

Only this node's JS code needs updating. No other nodes need changes.

## Desired Comment Structure

```markdown
## Runner Result

Status: GREEN
Mode: opencode-run
Provider configured: true
Provider: deepseek
Model: deepseek-v4-pro
OpenCode: 1.17.9

Evidence: /opt/dev-fabric/evidence/.../issue-12/gh-issue-12-20260628T123030Z/

Safety:
- No secrets emitted
- No auto-merge
- No GitHub Actions

---
Evidence source: status.json
```

## Fix Logic (Pseudocode)

```javascript
const prepData = $('Prepare RUN_INPUT.json').first().json;
const sshOutput = $input.first().json;

// ── Extract status.json from SSH output ──
let statusData = null;
let evidenceSource = 'fallback';

if (sshOutput && sshOutput.stdout && typeof sshOutput.stdout === 'string') {
  try {
    statusData = JSON.parse(sshOutput.stdout);
    evidenceSource = 'status.json';
  } catch (e) {
    // Parse failed — use fallback
  }
}

// ── Build fields from status.json (with fallbacks) ──
const status = statusData?.status || 'UNKNOWN';
const effectiveMode = statusData?.mode?.effective || prepData.mode || 'manual-terminal';
const providerConfigured = statusData?.agent_runtime?.opencode_provider_configured;
const provider = statusData?.provider || 'deepseek';
const model = statusData?.model || 'deepseek-v4-pro';
const openCodeVersion = statusData?.agent_runtime?.opencode_version || 'unknown';
const exitCode = sshOutput?.exitCode;
const evidencePath = prepData.evidence_dir || 'unknown';

// ── Format comment ──
const commentBody = `## Runner Result

Status: ${status}
Mode: ${effectiveMode}
Provider configured: ${providerConfigured !== undefined ? providerConfigured : 'unknown'}
Provider: ${provider}
Model: ${model}
OpenCode: ${openCodeVersion}

Evidence: ${evidencePath}

Safety:
- No secrets emitted
- No auto-merge
- No GitHub Actions

---
Evidence source: ${evidenceSource}`;

return [{
  json: {
    owner: prepData.owner,
    repo: prepData.repo,
    issue_number: prepData.issue_number,
    comment_body: commentBody,
    evidence_source: evidenceSource
  }
}];
```

## What Does NOT Change

| Item | Status |
|------|--------|
| SSH Read status.json node | ❌ Unchanged |
| Create GitHub Comment node | ❌ Unchanged |
| Prepare RUN_INPUT.json node | ❌ Unchanged |
| Schedule Trigger | ❌ Unchanged |
| Manual Trigger | ❌ Unchanged |
| Guardrails | ❌ Unchanged |
| Issue selection logic | ❌ Unchanged |
| Runner start logic | ❌ Unchanged |
| Guardrail hard blocks | ❌ Unchanged |
| Format Final Result | ⚠️ Optionally update to use status.json too |

## Optional: Format Final Result (Node 15)

Node 15 also uses stale `prepData` values. It currently hardcodes:
- `status: 'GREEN_PARTIAL_PLUS'`
- `dispatch_mode: 'manual-terminal'`

This could be updated to use the same status.json data, but it's not part of the GitHub comment — it's the workflow's internal result. Can be updated minimally to reflect accurate dispatch_mode.

## Rollback

If the fix breaks, simply revert Node 11's JS code to the previous version. No structural workflow changes needed.
