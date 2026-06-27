# Preflight — Schedule Trigger + Node 15 Fix Session

**Generated:** 2026-06-27T05:00:06Z
**Agent:** issue-orchestrator
**Status:** YELLOW (TOOL_GAP: n8n API key not configured)

---

## Environment

| Item | Value |
|---|---|
| Hostname | `AQcer` |
| OS | Microsoft Windows 10 Pro Education (64-bit) |
| Shell | PowerShell 5.1 |
| Workspace | `C:\Spec-kit_n8n` |
| Git repo | **BROKEN** — `.git/HEAD` and `.git/config` missing |
| gh CLI | v2.92.0, authenticated as `xxammaxx` |
| GitHub repo | `xxammaxx/n8n-blueprint-workflow` |
| Date/Time (UTC) | 2026-06-27T05:00:06Z |

---

## n8n Live Instance

| Item | Value |
|---|---|
| CT / Host | CT 101 |
| IP:Port | `192.168.1.52:5678` |
| Healthz | `200 OK` — reachable |
| Port 5679 | NOT reachable |
| REST API | Requires `X-N8N-API-KEY` header |
| UI Login | Email/password required (signin page) |
| n8n API Key | **NOT configured** (`.env.local` contains placeholder `PASTE_YOUR_N8N_API_KEY_HERE`) |
| Version (UI) | Unknown — not in public settings, UI requires login |

---

## Dispatcher Workflow (GitHub Source)

**Workflow JSON fetched from GitHub:** `workflows/github-ready-issue-dispatch.export.json`

| Item | Value |
|---|---|
| Workflow Name | `GitHub Ready Issue -> Runner Agent Dispatch (Scheduled)` |
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Node Count | 18 |
| Manual Trigger | Node 1: `Manual Trigger (Smoke Test)` ✅ PRESENT |
| Schedule Trigger | Node 16: `Schedule Trigger (10 min)` ✅ PRESENT (interval: 10 min) |
| Format Final Result | Node 15: `Format Final Result` (Code node) ✅ PRESENT |

### Full Node List (GitHub JSON)

```
 1. [manualTrigger]   Manual Trigger (Smoke Test)
 2. [httpRequest]     Fetch Issue from GitHub
 3. [code]            Guardrails & Validate
 4. [httpRequest]     Remove agent:ready Label
 5. [httpRequest]     Add agent:running Label
 6. [code]            Prepare RUN_INPUT.json
 7. [ssh]             SSH Write RUN_INPUT to Runner
 8. [ssh]             SSH Start Runner Script
 9. [wait]            Wait (5s)
10. [ssh]             SSH Read status.json
11. [code]            Format Evidence Comment
12. [httpRequest]     Create GitHub Comment on Issue
13. [httpRequest]     Add Labels (agent:needs-review, evidence:attached)
14. [httpRequest]     Remove agent:running Label (404-tolerant)
15. [code]            Format Final Result
16. [scheduleTrigger] Schedule Trigger (10 min)
17. [httpRequest]     GitHub Search Issues (agent:ready)
18. [code]            Pick First Ready Issue
```

### Connection Flow

**Manual Trigger path:**
```
Manual Trigger → Fetch Issue → Guardrails → Remove agent:ready → Add agent:running
→ Prepare RUN_INPUT → SSH Write → SSH Start → Wait → SSH Read
→ Format Evidence Comment → Create GitHub Comment → Add Labels
→ Remove agent:running → Format Final Result
```

**Schedule Trigger path:**
```
Schedule Trigger → GitHub Search Issues (agent:ready) → Pick First Ready Issue
→ Fetch Issue → Guardrails → [...same path as Manual...]
```

---

## Node 15: Format Final Result — Current Code (GitHub JSON)

```javascript
// ============================================================================
// Final Result / Log Output
// ============================================================================

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

return result;
```

**Syntax Validation:**
- Plain JavaScript syntax: ✅ PASS (Node.js `--check` equivalent validates)
- n8n `$()` function call: ✅ standard JS syntax
- Object literal: ✅ valid
- String literals: ✅ valid
- No unused variables: ✅ (Issue #3 comment confirms fix was applied — unused line removed)

---

## Schedule Trigger (GitHub JSON)

```json
{
  "rule": {
    "interval": [
      {
        "field": "minutes",
        "minutesInterval": 10
      }
    ]
  }
}
```

Current interval: **10 minutes**. User requirement: **15 minutes or more conservative**.

---

## Guardrails & Validate — Double-Start Protection

The Guardrails node (node 3) implements comprehensive protection:

- ✅ Issue must be `open`
- ✅ Must have `agent:ready` label
- ✅ BLOCKS if `agent:running` present
- ✅ BLOCKS if `agent:blocked` present
- ✅ BLOCKS if `agent:done` present
- ✅ Extracts mode (`manual-terminal`, `opencode-run`, `hermes-review`)
- ✅ Extracts risk level

---

## Issue #3 Status

| Item | Value |
|---|---|
| Number | 3 |
| Title | `[smoke] Scheduler-Dispatcher Dauerbetrieb — automatisierter Smoke Test` |
| State | OPEN |
| Labels | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| `agent:ready` | ❌ NOT present (removed during execution #44) |
| `agent:running` | ❌ NOT present |
| Last Execution | #44 (manual trigger, 2026-06-26) |
| Node 15 in #44 | ERROR (pre-existing JS syntax) |

---

## Runner Script (LXC 102)

| Item | Value |
|---|---|
| Path (local) | `C:\Spec-kit_n8n\scripts\remote_runner_orchestrator.sh` |
| SHA256 | `BED755360E1D9FEECDF654A5DB571D169860EC01E8EA3CC5C17DCFD73677167C` |
| `bash -n` | Not testable (WSL not installed on this Windows host) |

---

## Proxmox Host Zombie

| Item | Value |
|---|---|
| Host | Proxmox Host (192.168.1.136) |
| PID | 420195 |
| Ports | None |
| systemd Service | Restart-Loop (83502+ restarts) |
| **ACTION** | **NOT TOUCHED** — only documented |

---

## Key TOOL_GAPs

| Gap | Reason | Impact |
|---|---|---|
| n8n REST API access | API key not configured | Cannot read/write live workflow |
| n8n UI access | Login credentials required | Cannot verify live workflow state |
| Git repo broken | `.git/HEAD`, `.git/config` missing | Cannot commit/push locally |
| WSL not installed | Windows host | Cannot run `bash -n` on runner script |

---

## Discrepancy: GitHub JSON vs Live n8n

| Feature | GitHub JSON | User Report (Live) |
|---|---|---|
| Manual Trigger | ✅ Present | ✅ Present |
| Schedule Trigger | ✅ Present (10 min) | ❌ Missing |
| Node 15 Syntax | ✅ Valid | ❌ Error in Execution #44 |
| Workflow Active | N/A (JSON only) | ACTIVE since 2026-06-26T08:52:32 |

**Hypothesis:** The GitHub JSON was updated with fixes (Schedule Trigger added, Node 15 fixed) and pushed to the repo, but the LIVE n8n instance may not have been updated with the latest version. The live instance may still have the old version without Schedule Trigger and with the Node 15 syntax error.

---

## Next Steps (This Session)

1. Document Node 15 state (before/after)
2. Prepare Schedule Trigger documentation
3. Prepare fixed workflow JSON for manual import
4. Create test issue via gh CLI
5. Document manual activation steps
6. Generate final report
