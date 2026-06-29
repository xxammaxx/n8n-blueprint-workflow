# Operations Runbook — n8n Blueprint Dispatcher

**Date:** `2026-06-27T13:17:37Z`
**Baseline:** `GREEN_BASELINE_FROZEN`
**Workflow:** `Sv12QTo56NoPUu2D` — `GitHub Ready Issue → Runner Agent Dispatch`

---

## 1. How to Check: Is n8n Alive?

### Quick Health Check
```powershell
# From any machine with network access to 192.168.1.52
Invoke-WebRequest -Uri "http://192.168.1.52:5678/healthz" -UseBasicParsing -TimeoutSec 10
```

### Expected Response
- **HTTP 200** — n8n is running
- **HTTP 503 / No response** — n8n is down or unreachable
- **HTML content with "n8n" text** — confirms it's actually n8n (not some other service)

### Alternative: Browser Check
Open `http://192.168.1.52:5678` in a browser. You should see the n8n login/sign-in page.

---

## 2. How to Identify the CORRECT n8n Instance

| Feature | Correct Instance | Wrong Instance (Zombie) |
|---------|-----------------|------------------------|
| Location | **CT 101** (LXC container on Proxmox) | Proxmox host (bare metal) |
| IP | `192.168.1.52` | Unknown (host IP) |
| Port | 5678 | Unknown |
| Healthz | ✅ HTTP 200 | 🔴 Restart-loop, down |
| Service | `n8n.service` inside CT 101 | `n8n.service` via systemd on host |
| Status | Running, stable | Constantly restarting |

### Quick Test
```powershell
curl -s http://192.168.1.52:5678/healthz
# Expected: {"status":"ok"}
```

### If You Get a Response But It's Wrong
- Check the HTML content for a different n8n version or instance name
- The Proxmox host zombie is the WRONG instance — do not interact with it
- Only CT 101 / 192.168.1.52:5678 is the correct dispatcher

---

## 3. How to Identify the WRONG Instance (Proxmox Host Zombie)

### Symptoms
- systemd `n8n.service` restart-loop on the Proxmox host
- Service starts → fails → restarts → fails → ...
- May respond briefly on a different port before crashing

### What to Do
1. **DO NOT TOUCH IT** — any modification risks destabilizing Proxmox
2. Document any new observations in the evidence directory
3. Do NOT try to stop, restart, or reconfigure the service
4. Do NOT confuse it with CT 101's n8n

### What NOT to Do
- ❌ `systemctl stop n8n` on Proxmox host
- ❌ `systemctl disable n8n` on Proxmox host
- ❌ Modify n8n config files on Proxmox host
- ❌ Delete n8n data on Proxmox host
- ❌ Start debugging the zombie before completing current operational tasks

---

## 4. How to Check the Dispatcher

### Via GitHub Issues
```powershell
gh issue list --repo xxammaxx/n8n-blueprint-workflow --label "agent:ready"
```

If the list is empty, the dispatcher has cleared all ready issues (GOOD).
If an issue with `agent:ready` persists for >30 minutes, the dispatcher may be stuck.

### Via n8n Execution History (Browser)
1. Open `http://192.168.1.52:5678` in browser
2. Navigate to Workflows → `GitHub Ready Issue → Runner Agent Dispatch`
3. Click "Executions" tab
4. Look for recent executions with status "Success"

### Expected Pattern
- One execution every ~15 minutes (or whenever a GitHub event triggers it)
- Status: "Success" for proper dispatches
- Duration: ~85-90 seconds for full pipeline

---

## 5. How to Check: Schedule Trigger

### Verify Schedule is Active
1. n8n UI → Workflows → `GitHub Ready Issue → Runner Agent Dispatch`
2. Check the workflow card shows ▶️ (Active indicator)
3. Open the workflow — Schedule Trigger node should show next fire time

### Verify Schedule is Firing
Check n8n execution history for entries with `mode=trigger`:
- One execution approximately every 15 minutes
- Look for consistent timing (e.g., :00, :15, :30, :45 past each hour)
- If gaps >30 minutes, the schedule may have stopped

### Troubleshooting: Schedule Not Firing
1. Verify workflow is **Active** (not Inactive)
2. Verify Schedule Trigger node has correct cron expression
3. Check n8n logs inside CT 101
4. Check if workflow was modified — schedule may need re-activation

---

## 6. How to Check: GitHub Issue Processing

### Verify a Specific Issue Was Processed
```powershell
gh issue view <ISSUE_NUMBER> --repo xxammaxx/n8n-blueprint-workflow --json labels,comments
```

### Expected After Processing
- Label `agent:ready` removed
- Label `agent:needs-review` added
- Label `evidence:attached` added
- A comment from the runner with the evidence path

### Verify Runner Evidence Exists
The runner comment on the issue should contain:
```
Evidence path: /opt/dev-fabric/evidence/github-agent-runs/.../issue-X/gh-issue-X-YYYYMMDDTHHMMSSZ
```

---

## 7. How to Check: Runner Evidence

The runner (lxc-dev-runner / 192.168.1.53) stores evidence at:
```
/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/
```

Each issue gets a subdirectory:
```
issue-<NUMBER>/gh-issue-<NUMBER>-<YYYYMMDDTHHMMSSZ>/
```

### What Evidence Should Exist
- Runner execution log
- Any output from the dispatched agent
- Timestamp file or metadata

---

## 8. How to Recognize: Double-Run Problems

### Symptoms of Double-Run
1. **Same issue processed twice** — two execution entries for the same issue within the same 15-minute window
2. **`agent:running` label persists** — normally removed after processing
3. **Multiple runner evidence directories** for the same issue

### Protection Layers (all must fail for double-run)
1. `isIssue3` hard block — Issue #3 never re-processed
2. `isAlreadyProcessed` check — any issue with `agent:needs-review` or `evidence:attached` is skipped
3. `agent:ready` requirement — only processes issues with this label
4. State check — only processes open issues
5. Guardrails Validate node — trigger-agnostic, runs on every execution

### How to Verify Protection
Check the labels on suspicious issues:
```powershell
gh issue view <NUMBER> --repo xxammaxx/n8n-blueprint-workflow --json labels
```

If `agent:needs-review` or `evidence:attached` is present, the issue was already processed.

---

## 9. Label Reference — What Each Label Means

### Agent State Labels
| Label | Meaning | Set By | Removed By |
|-------|---------|--------|------------|
| `agent:ready` | Issue is ready for dispatch | Human or Canary creator | Dispatcher (removes + sets `running`) |
| `agent:running` | Dispatcher is actively processing | Dispatcher | Dispatcher (sets `needs-review`) |
| `agent:needs-review` | Processing complete, needs human review | Dispatcher | Human (sets `done`) |
| `agent:blocked` | Issue cannot be processed | Human or Guardrails | Human |
| `agent:done` | Human confirmed complete | Human | — |

### Evidence Labels
| Label | Meaning |
|-------|---------|
| `evidence:attached` | Runner evidence has been generated and commented |

### Test Labels
| Label | Meaning |
|-------|---------|
| `test:canary` | This is a canary test issue (not production) |
| `dispatcher:e2e` | End-to-end test of the full dispatcher pipeline |

### Mode Labels
| Label | Meaning |
|-------|---------|
| `mode:manual-terminal` | Manual processing required (terminal mode) |
| `mode:opencode-run` | Full OpenCode automated run |
| `mode:hermes-review` | Hermes review mode |

### Risk Labels
| Label | Meaning |
|-------|---------|
| `risk:low` | Low risk change |
| `risk:medium` | Medium risk change |
| `risk:high` | High risk change |

---

## 10. How to Safely Create a Canary Issue

### When a Canary IS Allowed
- ✅ Green baseline is confirmed frozen
- ✅ No production issues with `agent:ready` in queue
- ✅ Schedule Trigger is confirmed active (at least 2 successful fires)
- ✅ Purpose is purely health-check verification
- ✅ New canary is created with unique content (not reusing old canary)

### When a Canary is NOT Allowed
- ❌ Production issues are pending
- ❌ Schedule or guardrails are unstable
- ❌ Less than 15 minutes since last canary
- ❌ To test a speculative fix
- ❌ When you suspect the dispatcher is broken

### Canary Creation Checklist
1. Verify dispatcher is running and active
2. Verify no `agent:ready` issues exist
3. Create issue with labels: `agent:ready`, `test:canary`
4. Wait for next 15-minute window
5. Check execution history
6. Verify labels transitioned: `agent:ready` → `agent:needs-review` + `evidence:attached`
7. Document results in evidence

---

## 11. Incident Response — What To Do When...

### 11.1 n8n is DOWN

**Symptoms:** HTTP 503, timeout, or no response from `http://192.168.1.52:5678`

**Response:**
1. Check if CT 101 is running on Proxmox
2. Check if n8n service is running inside CT 101: `systemctl status n8n`
3. Check CT 101 resource usage (CPU, RAM, disk)
4. Check n8n logs: `journalctl -u n8n -n 100`
5. If service is stopped: `systemctl start n8n` (inside CT 101, NOT Proxmox host)
6. Verify healthz endpoint recovers

**DO NOT:**
- ❌ Start n8n on Proxmox host
- ❌ Delete n8n database
- ❌ Restore from unknown backup

### 11.2 Schedule Trigger NOT FIRING

**Symptoms:** No executions in >30 minutes

**Response:**
1. Verify workflow is Active (n8n UI: ▶️ icon)
2. Open workflow → check Schedule Trigger node settings
3. Deactivate and re-activate workflow (triggers schedule re-registration)
4. Wait 15 minutes for next window
5. Check n8n logs for cron errors

### 11.3 Guardrails CRASH

**Symptoms:** Execution shows "error" with guardrails-related message

**Response:**
1. Read the error message in n8n execution detail
2. Common cause: unexpected input format from GitHub API
3. Check if GitHub API response format changed
4. Do NOT modify guardrails code without creating a specification first
5. Rollback to last green workflow export if needed

### 11.4 Runner DOES NOT START

**Symptoms:** Execution successful but no runner evidence, or SSH error

**Response:**
1. Check SSH connectivity to lxc-dev-runner (192.168.1.53)
2. Verify runner container is running: `docker ps | grep n8n-runners`
3. Check runner logs
4. Verify SSH credentials in n8n are still valid
5. Check disk space on runner

### 11.5 Evidence IS MISSING

**Symptoms:** Issue processed but no evidence comment or empty evidence directory

**Response:**
1. Check runner execution logs
2. Verify write permissions on evidence directory
3. Check disk space on runner
4. Check if runner agent crashed mid-execution

### 11.6 Issue STUCK on `agent:ready`

**Symptoms:** Issue with `agent:ready` label not processed for >30 minutes

**Possible Causes:**
- Guardrails blocking (check execution log)
- Issue #3 hard block (intentional, never processed)
- `agent:blocked` guard triggered
- Schedule not firing
- GitHub API rate limit

**Response:**
1. Check n8n execution history for recent errors
2. Verify schedule is firing
3. Check GitHub API rate limits
4. Remove `agent:ready` and re-add if issue needs re-processing

### 11.7 DOUBLE PROCESSING Detected

**Symptoms:** Same issue processed twice

**Response:**
1. IMMEDIATELY: Check if any guardrails were bypassed
2. Check if someone manually removed `agent:needs-review` label
3. Check execution history for timing overlap
4. Document the incident with exact timestamps
5. Add `agent:blocked` to prevent further re-processing
6. Investigate root cause before re-enabling

### 11.8 Suspected SECRET LEAK

**Symptoms:** API key, token, or password visible in logs, evidence, or repo

**Response:**
1. IMMEDIATELY: Do NOT commit, push, or share
2. Identify the leaked value and its source
3. Rotate the compromised credential in its source system
4. Purge the leak from all affected files
5. Run `node scripts/validate-secret-hygiene.mjs` to verify cleanup
6. Document the incident (without the secret value itself)

---

## 12. Routine Maintenance

### Daily Checks
- [ ] `http://192.168.1.52:5678/healthz` responds 200
- [ ] At least one successful dispatcher execution in last 24h
- [ ] No issues stuck with `agent:ready` > 1 hour
- [ ] Runner evidence directory has recent files

### Weekly Checks
- [ ] Secret hygiene scan clean
- [ ] Evidence backup status
- [ ] Disk space on CT 101 and runner
- [ ] GitHub API rate limit status

### Monthly Checks
- [ ] Full health check script run
- [ ] Workflow export compared against green baseline
- [ ] Runner OpenCode version check

---

## 12b. Workflow Database Patch (Advanced)

### Location
- Database: `/opt/dev-fabric/n8n/data/.n8n/database.sqlite` (CT 101)
- Backup: `/opt/dev-fabric/n8n/data/.n8n/database.sqlite.bak.20260629T0600Z`

### Critical: Dual-Table Architecture
n8n uses TWO tables for workflow storage:
| Table | Role |
|-------|------|
| `workflow_entity` | Workflow definition (all versions) |
| `workflow_history` | Version history; `activeVersionId` links to active version |

**Execution uses `workflow_history.nodes` via `workflow_entity.activeVersionId`, NOT `workflow_entity.nodes` directly.**

### Patching Procedure
1. Stop n8n service: `systemctl stop n8n` (in CT 101)
2. Backup database: `cp database.sqlite database.sqlite.bak.$(date +%Y%m%dT%H%M%SZ)`
3. Patch `workflow_entity.nodes` — update JSON in nodes column
4. Patch `workflow_history.nodes` — same update for active version
5. Start n8n service: `systemctl start n8n`
6. Verify: Check healthz → 200, Workflow active, Schedule Trigger present

### Rollback (Emergency Only)
1. Stop n8n
2. `cp database.sqlite.bak.20260629T0600Z database.sqlite`
3. Start n8n
4. Verify: n8n reachable, Workflow active, Issues protected

**Warning:** Rollback only for RED/production errors, not cosmetic notes.

---

## 13. Key Contacts / References

| Item | Reference |
|------|-----------|
| GitHub Repo | `xxammaxx/n8n-blueprint-workflow` |
| n8n Instance | CT 101, `192.168.1.52:5678` |
| Runner Host | `lxc-dev-runner`, `192.168.1.53` |
| Proxmox Host | `192.168.1.136` |
| Green Baseline | `evidence/post-green-stabilization-20260627T131737Z/GREEN_BASELINE.md` |
| Workflow Export | `exports/green/dispatcher-green-20260627T131737Z.json` |
| Health Script | `scripts/dispatcher-health-check.mjs` |
| Secret Hygiene | `scripts/validate-secret-hygiene.mjs` |
