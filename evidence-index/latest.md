# Evidence Report — v2-activation-ui-test-20260623T034500Z

## Status: GREEN_PARTIAL

**Session ID:** v2-activation-ui-test
**Completed:** 2026-06-23T03:45:00Z
**Previous Session:** blueprint-clean-reconstruct-v2
**Orchestrator:** issue-orchestrator (opencode)

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote branch | `main` |
| Previous commit | `c3a9b706bf7d277ef2c4f2caffaf3b5a84599aea` |
| Push status | Repo already live from previous session |

## 2. Remote Connection Used

| Field | Value |
|-------|-------|
| Remote infrastructure access | Yes (SSH to Proxmox 192.168.1.136) |
| Browser automation | Yes (delegated to playwright-agent) |
| Browser automation result | SUCCESS — session still valid, no login required |
| Manual login needed | No (previous session still authenticated) |

## 3. V2 Workflow — UI Activation Results

| Field | Value |
|-------|-------|
| Workflow found in UI | YES — "Blueprint -> SpecKit/OpenCode Bootstrap V2" |
| Session login required | NO — previous Playwright session still valid |
| Published status | YES — button shows "Published" (disabled) |
| Active status | YES — Form Trigger node shows "Deactivate", page title shows ▶️ |
| Production Checklist | NOT visible — previously dismissed (`N8N_READY_TO_RUN_WORKFLOWS_DISMISSED`) |
| Trigger indicators | ▶️ unicode prefix in page title (n8n doesn't show X/3 style indicators) |
| Deactivate/Reactivate | Performed successfully — fixed listening issue |
| Republish | Executed — generated new UUID production URL |

## 4. Production Form URLs

| URL Type | Path | Result |
|----------|------|--------|
| **Production (from node)** | `/form/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60` | **HTTP 200** ✅ |
| Test (from node) | `/form-test/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60` | HTTP 404 (expected) |
| Slug (never worked) | `/form/blueprint-speckit-bootstrap-v2` | HTTP 404 |
| Old UUID (stale) | `/form/42fd41ad-7f10-45d9-b6c2-af674bcabf8b` | HTTP 404 (stale) |
| Debug (reference) | `/form/debug-minimal-form-ui` | HTTP 200 ✅ |

⚠️ **IMPORTANT**: Form URLs are UUID-based. The UUID changes on deactivate/reactivate/republish. Always read from the Form Trigger Node in the UI — never guess.

## 5. Form Submission Test

| Field | Value |
|-------|-------|
| Method | POST |
| URL | `http://192.168.1.52:5678/form/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60` |
| Content-Type | `multipart/form-data` (REQUIRED) |
| Fields submitted | 11 (project_slug, project_title, blueprint_text, llm_command_mode, opencode_model, max_runtime_minutes, dry_run, allow_github_issue_script_generation, allow_github_actions_files, extra_instruction) |
| Response | HTTP 200 — `{"status":200}` |
| First attempt (urlencoded) | FAILED — "Expected multipart/form-data" |
| Second attempt (multipart) | SUCCESS — HTTP 200 |

## 6. Form Fields Verified

| Field Name | Label | Type |
|------------|-------|------|
| project_slug | Projekt-Kurzname | text (required) |
| project_title | Projektname | text (required) |
| blueprint_file | BLUEPRINT.md hochladen | file |
| blueprint_text | Blueprint als Markdown einfügen | textarea |
| llm_command_mode | Startmodus | dropdown |
| opencode_model | Modell optional | text |
| max_runtime_minutes | Maximale Laufzeit in Minuten | number (required) |
| dry_run | Dry Run | checkbox |
| allow_github_issue_script_generation | GitHub Issue Scripts erlauben | checkbox |
| allow_github_actions_files | GitHub Actions Dateien erlauben | checkbox |
| extra_instruction | Extra Prompt Instruction | textarea |

## 7. SSH Runner Connectivity

| Field | Value |
|-------|-------|
| Container 101 IP | `192.168.1.52` |
| Container 102 IP | `192.168.1.53` |
| TCP reachable (101→102:22) | YES |
| SSH auth from CLI | FAILED — "Permission denied (publickey,password)" |
| n8n credential | `dev-runner-ssh` (ID `42a60f05-16eb-493f-8257-3eeb5aef531a`) |
| Credential host verification | PENDING — needs n8n UI check |

## 8. localStorage Findings

| Key | Relevance |
|-----|-----------|
| `N8N_READY_TO_RUN_WORKFLOWS_DISMISSED` | Production Checklist dismissed — suppresses checklist dialog |
| Other keys | No checklist/activation/onboarding-related keys found |

## 9. Playwright Automation

| Field | Value |
|-------|-------|
| Agent | playwright-agent (subagent) |
| Screenshots saved | 11 screenshots in `.opencode/reports/screenshots/` |
| Key screenshots | `00-initial-page.png` through `10-final-state.png` |
| Login required | NO |
| Form Trigger URLs captured | YES |

## 10. What the System Can Do Now vs. Previous Session

| Capability | Previous Session | This Session |
|------------|-----------------|--------------|
| V2 workflow in UI | Imported (not published) | Published + Active |
| Production form | HTTP 404 | HTTP 200 (UUID-based) |
| Form submission | Untested | Tested — HTTP 200 with multipart |
| UI automation | Blocked by login | Successful (session active) |
| Form URL knowledge | Guessed (slug) | Verified (UUID from node) |
| Checklist status | Unknown | Dismissed (known key) |
| Runner connectivity | Unknown | TCP confirmed, SSH auth pending |
| Production Checklist | Unknown | Previously dismissed |

## 11. Security Status

| Check | Status |
|-------|--------|
| No private keys in repo | VERIFIED |
| No .env files in repo | VERIFIED |
| No database files in repo | VERIFIED |
| No credentials in workflow JSON | VERIFIED |
| .gitignore enforced | VERIFIED |
| No GitHub Actions | VERIFIED |
| No force-push | VERIFIED |
| No SQL patches applied | VERIFIED |
| No credential export | VERIFIED |

## 12. Open Constraints

1. **SSH credential host** may need reconfiguration — `dev-runner-ssh` needs host `192.168.1.53` (check in n8n UI)
2. **Runner evidence** not produced — SSH execution didn't complete
3. **OpenCode/Hermes** not yet installed on runner (needed for full GREEN)
4. **UUID volatility** — republishing changes the production URL (limitation, not a bug)
5. **Slug URL** never worked — form path is UUID-based, not slug-based

## 13. Next Steps

1. **Check `dev-runner-ssh` credential** in n8n UI → verify host is `192.168.1.53`
2. **Re-run form submission** with verified SSH credential
3. **Verify Runner evidence** after successful execution
4. **Install OpenCode** on runner for real processing
5. Optional: Re-export updated workflow JSON with new UUID

## 14. Required Approvals

- SSH credential modification (if host needs changing)
- OpenCode/Hermes installation on runner
- Old broken workflow removal (if desired)
