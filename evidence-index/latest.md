# Evidence Report — opencode-runner-integration-20260623T100000Z

## Status: GREEN_PARTIAL

**Session ID:** opencode-runner-integration
**Completed:** 2026-06-23T10:00:00Z
**Previous Session:** runner-permission-fix
**Orchestrator:** issue-orchestrator (opencode)

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote branch | `main` |
| Previous commit | `4599829` |
| New commit | `06ea982` |
| Push status | ✅ Pushed to GitHub |

## 2. OpenCode Installation

| Field | Value |
|-------|-------|
| OpenCode previously installed | no |
| OpenCode installed | ✅ yes |
| Version | v1.17.9 |
| Install method | GitHub Releases direct download (`anomalyco/opencode`) |
| Binary location | `/opt/dev-fabric/opencode/opencode` (166,897,792 bytes) |
| Symlink | `/usr/local/bin/opencode` |
| Node.js required | no (standalone native binary) |
| Provider/Auth configured | ❌ no (needs separate approval) |
| `opencode --version` verified | ✅ 1.17.9 |
| `opencode --help` verified | ✅ all commands listed |
| `opencode providers list` | ✅ 0 credentials (expected) |
| `opencode run` without provider | ⚠️ hangs (waits for interactive provider config) |

## 3. OpenCode Security Profile (`opencode.json`)

| Field | Value |
|-------|-------|
| Template created | ✅ yes |
| Template location (runner) | `/opt/dev-fabric/workflows/templates/opencode.json` |
| Template location (repo) | `templates/opencode.json` |
| Default permission | `ask` |
| `git push*` | `deny` |
| `gh pr create*` | `deny` |
| `gh workflow run*` | `deny` |
| `rm -rf *` | `deny` |
| `docker *` | `deny` |
| `edit` | `ask` |
| `webfetch/websearch` | `ask` |
| `share` | `disabled` |
| `autoupdate` | `false` |
| `mcp` | `{}` (none configured) |
| Copied to new projects | ✅ by `start_blueprint_bootstrap.sh` |

## 4. Runner Script Enhancement

| Field | Value |
|-------|-------|
| Script updated | `start_blueprint_bootstrap.sh` |
| Lines | 503 (was 424) |
| `manual-terminal` default | ✅ yes |
| `opencode-run` supported | ✅ yes |
| Tmux session creation | ✅ yes |
| Graceful fallback on missing OpenCode | ✅ yes |
| OpenCode version in evidence | ✅ yes |
| OpenCode availability in evidence | ✅ yes |
| Tmux availability in evidence | ✅ yes |
| Syntax check (bash -n) | ✅ passed |

## 5. Adapter Layer

| File | Status |
|------|--------|
| `agent-adapters/manual_terminal_adapter.sh` | ✅ active, executable |
| `agent-adapters/opencode_adapter.sh` | ✅ active, executable |
| `agent-adapters/hermes_reviewer_adapter.sh.disabled` | ✅ placeholder, NOT executable |
| `agent-adapters/common/run_input_validate.sh` | ✅ active, executable |
| `agent-adapters/common/evidence_write.sh` | ✅ active, executable |
| `agent-adapters/common/security_guard.sh` | ✅ active, executable |

## 6. Tmux Status

| Field | Value |
|-------|-------|
| Tmux installed | ✅ yes |
| Tmux version | v3.3a |
| Binary location | `/usr/bin/tmux` |
| Available to runner | ✅ (via default PATH) |

## 7. Hermes Status

| Field | Value |
|-------|-------|
| Hermes installed | ❌ no (deliberately excluded) |
| Plan | Optional future sidecar for research, review, evidence analysis |
| Adapter placeholder | `hermes_reviewer_adapter.sh.disabled` (not executable) |

## 8. Smoke Test

| Test | Result |
|------|--------|
| Test project | `/opt/dev-fabric/workspaces/projects/opencode-smoke-test/` |
| BLUEPRINT.md | ✅ created |
| INITIALISIERUNG_PROMPT_BLUEPRINT.md | ✅ created |
| AGENTS.md, PROJECT_CONTEXT.md, README.md | ✅ created |
| opencode.json (copied from template) | ✅ present |
| `opencode --version` | ✅ 1.17.9 |
| `opencode --help` | ✅ all commands |
| `opencode providers list` | ✅ 0 credentials |
| `opencode run` without provider | ⚠️ hangs (expected — needs provider config) |
| No file changes during smoke test | ✅ confirmed |

## 9. n8n Integration Check

| Field | Value |
|-------|-------|
| Workflow JSON has `llm_command_mode` | ✅ yes |
| Valid modes in JS validation | `['opencode-run', 'hermes-run', 'manual-terminal']` |
| `opencode-run` flows to RUN_INPUT.json | ✅ yes |
| `start_blueprint_bootstrap.sh` reads mode | ✅ yes |
| Integration ready for `opencode-run` | ✅ structure verified |

## 10. Security Status

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
| opencode.json blocks push/PR/merge | ✅ VERIFIED |
| Secret scan on new files | ✅ PASSED |
| Forbidden file check (.env, .sqlite, .pem, .key) | ✅ NONE FOUND |

## 11. What the System Can Do Now

| Capability | Before | After |
|------------|--------|-------|
| OpenCode installed on runner | ❌ Not installed | ✅ v1.17.9 standalone binary |
| Security profile for agents | ❌ None | ✅ Restrictive opencode.json template |
| Controlled agent launch in tmux | ❌ Not supported | ✅ opencode-run mode in script |
| Adapter layer for agent modes | ❌ None | ✅ 3 adapters + 3 common utilities |
| Evidence includes agent toolchain | ❌ Basic only | ✅ OpenCode version, tmux status |
| Safe fallback when agents missing | ❌ Implicit | ✅ Explicit manual-terminal with reason |
| Block push/PR/merge from agents | ❌ No enforcement | ✅ Deny rules in opencode.json |
| Agent smoke test capability | ❌ Not possible | ✅ Isolated test project ready |

## 12. Open Constraints

1. **OpenCode provider/API-key not configured** — blocks autonomous agent runs
2. **Interactive provider prompt** blocks non-interactive execution (secure by design)
3. **Hermes not installed** — deliberate, planned as optional sidecar
4. **No real `opencode-run` execution yet** — pending provider configuration

## 13. Next Steps

1. Obtain approval for LLM provider API key configuration on runner
2. Configure provider via: `opencode providers login`
3. Run first controlled `opencode-run` execution via n8n form with `llm_command_mode=opencode-run`
4. Verify evidence production and tmux session behavior
5. Optional: Hermes as secondary agent (separate, approved run)

## 14. Files Changed in This Run

### Modified
- `CHANGELOG.md` — new entry for OpenCode integration
- `STATUS.md` — updated component status table
- `docs/architecture.md` — added agent runtime layer
- `docs/security-boundaries.md` — added OpenCode security profile
- `scripts/start_blueprint_bootstrap.sh` — extended with opencode-run support

### Created
- `agent-adapters/manual_terminal_adapter.sh`
- `agent-adapters/opencode_adapter.sh`
- `agent-adapters/hermes_reviewer_adapter.sh.disabled`
- `agent-adapters/common/run_input_validate.sh`
- `agent-adapters/common/evidence_write.sh`
- `agent-adapters/common/security_guard.sh`
- `templates/opencode.json`

## 15. Runner Paths Summary

```
/opt/dev-fabric/
├── opencode/opencode              (159 MB binary, v1.17.9)
├── workflows/templates/
│   └── opencode.json              (restrictive security profile)
├── agent-adapters/
│   ├── manual_terminal_adapter.sh
│   ├── opencode_adapter.sh
│   ├── hermes_reviewer_adapter.sh.disabled
│   └── common/
│       ├── run_input_validate.sh
│       ├── evidence_write.sh
│       └── security_guard.sh
├── workspaces/projects/
│   └── opencode-smoke-test/       (isolated test project)
└── scripts/
    └── start_blueprint_bootstrap.sh (enhanced, 503 lines)

/usr/local/bin/opencode → /opt/dev-fabric/opencode/opencode
/usr/bin/tmux (v3.3a)
```
