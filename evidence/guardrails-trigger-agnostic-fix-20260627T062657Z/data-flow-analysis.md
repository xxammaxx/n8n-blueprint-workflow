# Data Flow Analysis — Guardrails & Validate Node

**Workflow:** Sv12QTo56NoPUu2D
**Target Node:** Guardrails & Validate (node 3, ID: 848355a6-...)

---

## Data Flow Paths

### Path A: Manual Trigger
```
Manual Trigger (Smoke Test) [node 1]
  ↓ (pinData: owner, repo, issue_number)
Fetch Issue from GitHub [node 2]
  ↓ (issueData: full GitHub issue JSON)
Guardrails & Validate [node 3]  ← $input = Fetch Issue output
```

### Path B: Schedule Trigger
```
Schedule Trigger [node 16]
  ↓ (no issue data, just timestamp)
GitHub Search Issues (agent:ready) [node 17]
  ↓ (search results: GitHub API response)
Pick First Ready Issue [node 18]
  ↓ (extracted issue: owner, repo, number, title)
Fetch Issue from GitHub [node 2]
  ↓ (issueData: full GitHub issue JSON)
Guardrails & Validate [node 3]  ← $input = Fetch Issue output
```

### Common Path (after Guardrails)
```
Guardrails & Validate [node 3]
  ↓ (guardResult: { owner, repo, issue_number, can_start, ... })
Remove agent:ready Label [node 4]
  ↓ ...
[dispatch continues]
```

---

## Node Input/Output Formats

### Manual Trigger (Smoke Test) — node 1
```json
{
  "owner": "xxammaxx",
  "repo": "n8n-blueprint-workflow",
  "issue_number": 4,
  "description": "Smoke Test Input"
}
```
⚠️ Only available in Manual Trigger path. NOT available in Schedule Trigger path.

### Fetch Issue from GitHub — node 2 (CONVERGENCE POINT)
```json
{
  "url": "https://api.github.com/repos/xxammaxx/n8n-blueprint-workflow/issues/4",
  "number": 4,
  "title": "[Schedule Test] Dispatcher auto-run canary",
  "body": "## Canary Test: ...",
  "state": "open",
  "labels": [
    { "name": "agent:ready" },
    { "name": "mode:manual-terminal" },
    { "name": "risk:low" }
  ],
  "created_at": "2026-06-27T05:20:35Z",
  "updated_at": "2026-06-27T06:03:08Z"
}
```
✅ Available in BOTH paths. This is the proper data source for the Guardrails node.

### Guardrails & Validate — node 3 (Output)
```json
{
  "owner": "xxammaxx",
  "repo": "n8n-blueprint-workflow",
  "issue_number": 4,
  "issue_title": "[Schedule Test] Dispatcher auto-run canary",
  "issue_body": "## Canary Test: ...",
  "issue_url": "https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4",
  "is_open": true,
  "has_ready": true,
  "has_running": false,
  "has_blocked": false,
  "has_done": false,
  "can_start": true,
  "mode": "manual-terminal",
  "risk": "low",
  "labels": [...],
  "label_names": ["agent:ready", "mode:manual-terminal", "risk:low"],
  "guardrail": "PASS",
  "guardrail_reason": "Ready to dispatch"
}
```
✅ Must work for BOTH paths.

---

## What the Old Code Accesses (Broken)

| Value | Source in old code | Actual need | Available from $input? |
|---|---|---|---|
| `owner` | `prepRef.owner \|\| 'xxammaxx'` | Static (`'xxammaxx'`) | ✅ Static |
| `repo` | `prepRef.repo \|\| 'n8n-blueprint-workflow'` | Static (`'n8n-blueprint-workflow'`) | ✅ Static |
| `issue_number` | `prepRef.issue_number \|\| issueData.number \|\| 0` | From issue data | ✅ `issueData.number` |
| `issue_title` | `issueData.title` | From issue data | ✅ `issueData.title` |
| `issue_body` | `issueData.body` | From issue data | ✅ `issueData.body` |
| `issue_state` | `issueData.state` | From issue data | ✅ `issueData.state` |
| `labels` | `issueData.labels` | From issue data | ✅ `issueData.labels` |

**Conclusion:** ALL values that `prepRef` provides are either static (owner/repo) or already available from `issueData` (which comes from `$input.first().json` → Fetch Issue from GitHub). The `prepRef` reference is **completely unnecessary**.

---

## Fix Plan

1. Remove `const prepRef = $('Manual Trigger (Smoke Test)').first().json;`
2. Use static values directly: `const owner = 'xxammaxx'; const repo = 'n8n-blueprint-workflow';`
3. Get issue_number from `issueData.number`
4. All other logic remains identical
5. No mutation of error objects
6. Maintain output format: `return [{ json: guardResult }];`
