# Guardrails Static Validation

**Validated:** 2026-06-27T08:33:00Z

---

## 1. JavaScript Syntax

| Check | Result |
|---|---|
| `node -e "new Function(code)"` | ✅ SYNTAX_VALID: true |
| No syntax errors detected | ✅ |

---

## 2. Trigger Dependency Check

| Check | Result | Detail |
|---|---|---|
| `$('Manual Trigger')` in executable code | ✅ NOT PRESENT | Only in comment header |
| `$input.first().json` used | ✅ YES | Trigger-agnostic data source |
| No other trigger-specific `$('NodeName')` calls | ✅ YES | Only `$input` used |

---

## 3. Error Object Mutation Check

| Check | Result |
|---|---|
| `error.name = ...` | ✅ NOT PRESENT |
| `error.message = ...` | ✅ NOT PRESENT |
| Error property assignment | ✅ NOT PRESENT |
| New Error via `new Error()` | ✅ YES (safe pattern) |

---

## 4. Return Format

| Check | Result |
|---|---|
| Format: `return [{ json: ... }]` | ✅ YES |
| n8n Code node compatible | ✅ YES |
| Array of items returned | ✅ YES |

---

## 5. Security Guards

| Check | Result |
|---|---|
| Issue #3 hard block (`isIssue3`) | ✅ `const isIssue3 = issueNumber === 3;` in canStart |
| `agent:ready` required (`hasReady`) | ✅ In canStart check |
| `agent:running` duplicate block (`hasRunning`) | ✅ In canStart check |
| `agent:blocked` block (`hasBlocked`) | ✅ In canStart check |
| `agent:done` block (`hasDone`) | ✅ In canStart check |
| Already-processed guard (`isAlreadyProcessed`) | ✅ `needsReview && evidenceAttached` in canStart |

---

## 6. No Secrets

| Check | Result |
|---|---|
| GitHub tokens (ghp_*, github_pat_*) | ✅ NOT PRESENT |
| API keys (sk-*, xox*, AIza*) | ✅ NOT PRESENT |
| Private keys (BEGIN ... PRIVATE KEY) | ✅ NOT PRESENT |
| Credential references | ✅ NOT PRESENT |

---

## 7. Static Values

| Check | Result |
|---|---|
| `owner = 'xxammaxx'` | ✅ Static, safe |
| `repo = 'n8n-blueprint-workflow'` | ✅ Static, safe |
| `issue_number` from input | ✅ `issueData.number` |

---

## 8. n8n Compatibility

| Check | Result |
|---|---|
| Uses `$input.first().json` | ✅ Standard n8n pattern |
| Returns array of `{ json: ... }` | ✅ Standard n8n pattern |
| No unsupported JS features | ✅ ES5-compatible |
| `var`/`const` correctly used | ✅ |

---

## 9. Label Handling

| Check | Result |
|---|---|
| GitHub API label format (`l.name`) | ✅ `typeof l === 'string' ? l : l.name` |
| All expected labels parsed | ✅ agent:ready, agent:running, agent:blocked, agent:done, agent:needs-review, evidence:attached |
| Mode labels | ✅ mode:opencode-run, mode:hermes-review, mode:manual-terminal |
| Risk labels | ✅ risk:low, risk:high, risk:medium |

---

## 10. guardrail_reason Cases (7 total)

| Condition | Reason |
|---|---|
| `canStart = true` | "Ready to dispatch" |
| `isIssue3` | "HARD BLOCK: Issue #3 is a completed smoke test — never re-process" |
| `isAlreadyProcessed` | "Already processed (agent:needs-review + evidence:attached present)" |
| `!isOpen` | "Issue is not open" |
| `!hasReady` | "Missing agent:ready label" |
| `hasRunning` | "agent:running already set — duplicate run blocked" |
| `hasBlocked` | "Issue is blocked" |
| `hasDone` | "Issue already done" |
| (fallback) | "Unknown guardrail failure" |

---

## Overall Result: ✅ PASS — Ready for live deployment
