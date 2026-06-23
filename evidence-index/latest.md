# Evidence Report — runner-permission-fix-20260623T073000Z

## Status: GREEN_PARTIAL

**Session ID:** runner-permission-fix
**Completed:** 2026-06-23T07:30:00Z
**Previous Session:** ssh-credential-runner-test
**Orchestrator:** issue-orchestrator (opencode)

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote branch | `main` |
| Previous commit | `b9022d6` |
| Push status | Pending (after doc updates) |

## 2. Permission Fix

### Problem Diagnosed
```
/opt/dev-fabric/workspaces/       runner:runner  drwxr-x--- ✅
├── projects/                      root:root      drwxr-xr-x ❌ runner can't write!
/opt/dev-fabric/evidence/         runner:runner  drwxr-x--- ✅
├── blueprint-bootstrap/           root:root      drwxr-xr-x ❌ runner can't write!
/opt/dev-fabric/logs/             runner:runner  drwxr-x--- ✅
└── blueprint-bootstrap/           root:root      drwxr-xr-x ❌ runner can't write!
```

### Fix Applied (Limited Scope)
```bash
chown -R runner:runner /opt/dev-fabric/workspaces/projects
chown -R runner:runner /opt/dev-fabric/evidence/blueprint-bootstrap
chown -R runner:runner /opt/dev-fabric/logs/blueprint-bootstrap
chmod 750 /opt/dev-fabric/workspaces/projects /opt/dev-fabric/evidence/blueprint-bootstrap /opt/dev-fabric/logs/blueprint-bootstrap
```

### NOT Changed (Safety)
- `/opt/dev-fabric/n8n` — untouched ✅
- `/opt/dev-fabric/workspaces/spec-kit-src` — untouched (world-readable) ✅
- `/opt/dev-fabric/scripts` — untouched (already runner-owned) ✅
- `/opt/dev-fabric/evidence/n8n-blueprint-workflow` — untouched ✅
- No private keys, no backups, no system paths changed ✅

### Write Test as `runner`
```
PASS: /opt/dev-fabric/workspaces/projects → ok
PASS: /opt/dev-fabric/evidence/blueprint-bootstrap → ok
PASS: /opt/dev-fabric/logs/blueprint-bootstrap → ok
```

## 3. Form Submission (Browser)

| Field | Value |
|-------|-------|
| URL | `http://192.168.1.52:5678/form/ae9f52c1-b02f-4ebc-b7ba-a91f8ddc6e60` |
| Method | Browser submit (Playwright) |
| project_slug | `perm-fix-test` |
| project_title | `Permission Fix Test` |
| llm_command_mode | `manual-terminal` |
| Response | "Your response has been recorded" ✅ |

## 4. n8n Execution #14

| # | Node | Status | Duration |
|---|------|--------|----------|
| 1 | Form Trigger | ✅ success | ~1ms |
| 2 | Validate + Extract Blueprint | ✅ success | ~14ms |
| 3 | Prepare RUN_INPUT | ✅ success | ~7ms |
| 4 | SSH — Write RUN_INPUT to Runner | ✅ success | ~25s |
| 5 | SSH — Start Blueprint Bootstrap | ✅ success | ~25s |
| 6 | Wait — Initial Status Delay | ✅ success | ~10s |
| 7 | SSH — Read Status | ✅ success | ~25s |
| 8 | Format Result | ✅ success | ~17ms |

**Overall: SUCCESS — 87s total runtime.**

## 5. Runner Evidence Produced

### Project Directory
```
/opt/dev-fabric/workspaces/projects/perm-fix-test/
├── BLUEPRINT.md ✅
├── BLUEPRINT_FINAL.md ✅
├── INITIALISIERUNG_PROMPT_BLUEPRINT.md ✅
├── README.md, ARCHITECTURE.md, PROJECT_CONTEXT.md ✅
├── ROADMAP.md, ISSUE_ROADMAP.md, OPEN_QUESTIONS.md ✅
├── PROMPTS.md, AGENTS.md, CONTRIBUTING.md ✅
├── SECURITY.md, LICENSE ✅
├── opencode.json, .editorconfig, .env.example, .gitignore ✅
├── .git/ (initialized) ✅
├── .github/, .opencode/, .specify/ ✅
├── docs/, portfolio/, scripts/, specs/ ✅
```

### Evidence Directory
```
/opt/dev-fabric/evidence/blueprint-bootstrap/perm-fix-test/run-20260623T072332Z-7d3488/
├── agent.log ✅
├── commands.log ✅
├── operator-commands.md ✅
├── preflight.md ✅
├── RUN_INPUT.json ✅
├── RUN_INPUT.redacted.json ✅
├── run-report.md ✅
├── specify-check.log ✅
├── specify-init.log ✅
└── status.json ✅
```

### status.json
```json
{
  "status": "GREEN_PARTIAL",
  "effective_mode": "manual-terminal",
  "manual_reason": "Manual-Terminal-Modus vorbereitet; OpenCode/Hermes/LLM wurde nicht automatisch gestartet.",
  "project_slug": "perm-fix-test",
  "project_title": "Permission Fix Test"
}
```

## 6. Security Status

| Check | Status |
|-------|--------|
| No private keys in repo | ✅ VERIFIED |
| No .env files in repo | ✅ VERIFIED |
| No database files in repo | ✅ VERIFIED |
| No credentials in workflow JSON | ✅ VERIFIED |
| .gitignore enforced | ✅ VERIFIED |
| No force-push | ✅ VERIFIED |
| No SQL patches | ✅ VERIFIED |
| /opt/dev-fabric/n8n untouched | ✅ VERIFIED |
| Private keys untouched | ✅ VERIFIED |
| Limited chown scope only | ✅ VERIFIED |

## 7. What the System Can Do Now

| Capability | Before | After |
|------------|--------|-------|
| End-to-end execution | ✅ (Execution #10) | ✅ (Execution #14 confirmed) |
| Runner evidence production | ❌ Permission denied | ✅ Full evidence produced |
| Project directory creation | ❌ Permission denied | ✅ Full SpecKit structure |
| Git repo init on runner | ❌ Failed | ✅ .git/ created |
| BLUEPRINT.md written | ❌ Failed | ✅ Written correctly |
| INITIALISIERUNG_PROMPT written | ❌ Failed | ✅ Written correctly |
| status.json produced | ❌ Failed | ✅ GREEN_PARTIAL |

## 8. Open Constraints

1. **OpenCode/Hermes** not yet installed on runner (needed for full GREEN)
2. **curl form submissions** — use browser or `field-N` names as workaround
3. **UUID volatility** — production URL changes on republish

## 9. Next Steps

1. Install OpenCode on runner for full GREEN status
2. Optional: Hermes as secondary agent
3. Optional: Investigate `field-N` form naming for curl compatibility
