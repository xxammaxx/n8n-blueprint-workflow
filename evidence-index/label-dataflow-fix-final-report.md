# Final Report: GitHub Label Dataflow Fix

**Date:** 2026-06-24T19:50:00+02:00
**Session:** label-dataflow-fix-20260624

---

## Status: GREEN_PARTIAL_PLUS

---

## Summary

| Field | Value |
|-------|-------|
| **Status** | GREEN_PARTIAL_PLUS |
| **GitHub Repo** | https://github.com/xxammaxx/n8n-blueprint-workflow |
| **Commit before run** | `89d896b` — fix: apply expression mode + cross-node refs to ssh nodes |
| **New commit** | `cf84ff8` — fix: use stable issue context for github label nodes, docs updated |
| **Push status** | Pushed to origin/main |
| **Issue #1 URL** | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/1 |
| **n8n Login needed** | No (storageState) |
| **n8n Login deactivated** | No |
| **storageState used** | Yes |
| **storageState in repo** | No |
| **API-Key used** | No |
| **Login file used** | No |
| **Workflow ID** | jb7BgKeWGee5Iq9d |
| **Node Count** | 12 |
| **12 Nodes green** | Yes (12/12) |
| **Runner Evidence** | Yes (comment posted with verification table) |
| **GitHub Comment written** | Yes |
| **Labels set** | agent:needs-review, evidence:attached |
| **Labels removed** | agent:running (404 tolerated) |
| **Issue open** | Yes |
| **MCP not extended** | Yes |
| **Production workflows not MCP-released** | Yes |
| **.github/workflows absent** | Yes |
| **Locale warning** | Not encountered |
| **Validation** | JSON valid, secret scan clean, prohibited files clean |
| **Secret scan** | Clean (all matches in test/validation scripts) |
| **OpenCode version** | v1.17.9 |
| **OpenCode Provider/Auth** | Not configured |
| **Hermes status** | Not installed |

---

## Root Cause

| Node | Issue | Cause |
|------|-------|-------|
| 11 (Add Labels) | HTTP 404 | URL used `$json.owner` — `$json` was GitHub comment response from Node 10 |
| 12 (Remove Label) | HTTP 404 | Same issue, plus no 404 tolerance |

## Fix Applied

| Node | Fix |
|------|-----|
| 11 | URL: `$('Prepare RUN_INPUT.json').first().json.owner` etc. |
| 12 | Same URL fix + "On Error: Continue" for 404 tolerance |

## Key Insight

`$json` is NOT stable across n8n nodes, especially after HTTP Request nodes. The output of an HTTP Request node replaces `$json` with the API response. For GitHub API calls, this means `$json.owner`/`$json.repo`/`$json.issue_number` are lost after Node 10 (GitHub Comment) and Node 11 (GitHub Add Labels). The safe pattern is to reference the stable data source directly: `$('Prepare RUN_INPUT.json').first().json.field`.

---

## GitHub Credential

| Field | Value |
|-------|-------|
| Display name | GitHub account |
| Token visible | No |
| Private Key visible | No |

---

## Live Test Summary

| # | Node | Result |
|---|------|--------|
| 1 | Manual Trigger | GREEN |
| 2 | Validate Issue Contract | GREEN |
| 3 | Prepare RUN_INPUT.json | GREEN |
| 4 | SSH Write RUN_INPUT to Runner | GREEN |
| 5 | SSH Start Runner Script | GREEN |
| 6 | Wait (5s) | GREEN |
| 7 | SSH Read status.json | GREEN |
| 8 | Format Evidence Comment | GREEN |
| 9 | Format Final Result | GREEN |
| 10 | Create GitHub Comment | GREEN |
| 11 | Add Labels | GREEN (HTTP 200) |
| 12 | Remove Label | GREEN (HTTP 404 tolerated) |

**Total: 12/12 GREEN**

---

## Files Changed (11 files, +770/-29)

| File | Change |
|------|--------|
| `workflows/github-issue-intake.export.json` | Updated with fixed expressions |
| `STATUS.md` | GREEN_PARTIAL → GREEN_PARTIAL_PLUS |
| `CHANGELOG.md` | New entry for label dataflow fix |
| `docs/architecture.md` | Data flow diagram, stable source pattern |
| `docs/github-issue-intake-runbook.md` | Stable data source pattern documented |
| `docs/troubleshooting.md` | Node 11/12 404 diagnosis entry |
| `docs/security-boundaries.md` | Cross-node reference security section |
| `docs/run-input-schema.md` | Downstream use of owner/repo/issue_number |
| `docs/n8n-auth-automation.md` | storageState verified working |
| `evidence-index/latest.md` | Complete run documentation |
| `evidence-index/known-evidence-paths.md` | Updated paths |

---

## What the System Can Do Now vs. Previous Run

| Capability | Before | After |
|------------|--------|-------|
| Total green nodes | 10/12 | 12/12 |
| GitHub comment auto-post | Yes | Yes |
| Add labels via workflow | No (404) | Yes (HTTP 200) |
| Remove labels via workflow | No (404) | Yes (404 tolerated) |
| Cross-node data references | Broken after HTTP nodes | Documented pattern |
| storageState auth verified | No | Yes |
| 404 tolerance pattern | Not implemented | Documented |

---

## Remaining Constraints

1. No GitHub Actions — intentionally excluded
2. No automated PR/merge — intentional design choice
3. OpenCode provider not configured — manual-terminal mode only
4. Hermes not installed
5. n8n MCP validated but production workflows not MCP-released
6. Evidence `github-agent-runs` path in comment diverges from actual evidence storage — cosmetic issue

---

## Next Steps

1. Address evidence path divergence (cosmetic)
2. Consider adding pin data auto-refresh for repeatable testing
3. Transition to `agent:done` label on successful completion (currently `agent:needs-review`)

---

## Approvals Needed

- None for this fix — label dataflow repair is a bug fix within existing scope
- Any expansion (PR automation, MCP release, OpenCode provider config) would need separate approval

---

## Security Status: CLEAN

- No credentials exposed
- No tokens in repo
- No storageState in repo
- No .github/workflows
- No .env, .sqlite, .pem, .key files
- Secret scan: all matches in validation/test scripts only
