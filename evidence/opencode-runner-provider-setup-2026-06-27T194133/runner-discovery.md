# Runner Read-Only Discovery

**Timestamp:** 2026-06-27T19:41:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  

---

## Runner Identity

| Item | Value |
|------|-------|
| Hostname | lxc-dev-runner |
| OS | Debian GNU/Linux 12 (bookworm) |
| Shell | /bin/bash 5.2.15 |
| User | root |
| Working Directory | /root |
| Proxmox CT ID | 102 |
| Proxmox Status | running |
| Access Method | `pct enter 102` from Proxmox host (pve) |

## Installed Tools

| Tool | Version | Path |
|------|---------|------|
| OpenCode | v1.17.9 | /opt/dev-fabric/opencode/opencode (symlink: /usr/local/bin/opencode) |
| Node.js | v22.23.0 | (system) |
| npm | 10.9.8 | (system) |
| Git | 2.39.5 | (system) |
| Bash | 5.2.15 | /bin/bash |
| Tmux | 3.3a | (system) |
| jq | present | (system, required by runner scripts) |

## Directory Structure

### /opt/dev-fabric/
```
/opt/dev-fabric/
├── agent-adapters/       (root:root)
├── evidence/             (runner:runner)
│   ├── blueprint-bootstrap/
│   ├── blueprint-smoke-demo/
│   ├── github-agent-runs/
│   │   └── xxammaxx/n8n-blueprint-workflow/issue-{4,5,6,7,8}/
│   ├── n8n-blueprint-workflow/
│   └── speckit-smoke-test/
├── logs/                 (runner:runner)
│   └── blueprint-bootstrap/
├── opencode/             (runner:runner)
│   └── opencode          (167MB binary, v1.17.9)
├── scripts/              (runner:runner)
│   ├── render_blueprint_workflow_json.sh
│   ├── speckit_iteration.sh
│   ├── start_blueprint_bootstrap.sh
│   └── start_github_issue_run.sh
├── workflows/            (runner:runner)
│   ├── README-blueprint-bootstrap.md
│   ├── blueprint-speckit-opencode-bootstrap.json
│   ├── speckit-smoke-workflow.json
│   └── templates/
│       └── opencode.json
└── workspaces/           (runner:runner)
    └── projects/
        ├── blueprint-smoke-demo/
        ├── blueprint-smoke-demo.bak-*/
        ├── blueprint-smoke-ui-demo/
        ├── blueprint-smoke-ui-demo-textarea/
        ├── opencode-smoke-test/
        └── perm-fix-test/
```

## Owner/Permissions

- Most files: `runner:runner` (the service user)
- Some files: `root:root` (initial deployment artifacts)
- Evidence directories: `runner:runner`

## OpenCode Configuration Files

| File | Exists | Content |
|------|--------|---------|
| /root/.config/opencode/opencode.jsonc | YES | Minimal — only `$schema` |
| /root/.local/share/opencode/auth.json | NO | No credentials configured |
| /opt/dev-fabric/workflows/templates/opencode.json | YES | Template with permissions |
| Workspace opencode.json files | YES | Multiple project configs |

## Provider Configuration

| Item | Status |
|------|--------|
| OpenCode installed | ✅ v1.17.9 |
| Provider configured | ❌ **0 credentials** (`opencode providers list` shows empty) |
| Auth file | ❌ Not found |
| .env file | ❌ None in /opt/dev-fabric/ |
| secrets/ directory | ❌ None in /opt/dev-fabric/ |
| .gitignore | ❌ None in /opt/dev-fabric/ |
| OPENCODE_* env vars | ❌ None set |

## Runner Script Analysis

The primary runner script is `/opt/dev-fabric/scripts/start_github_issue_run.sh`:

- Accepts `--input-json` with RUN_INPUT data
- Checks `source_of_truth` must be "github"
- Extracts GitHub issue data, approval policies, runner paths
- Determines effective mode:
  - `manual-terminal` — always safe, no agent autonomy
  - `opencode-run` — requires: OpenCode available + provider configured + tmux available
  - Falls back to `manual-terminal` if any requirement is missing
- Creates structured evidence directories
- Outputs status.json for n8n consumption

**Critical finding:** When `opencode_provider_configured` is `false` in the input JSON, the runner falls back to `manual-terminal` mode. This confirms that provider configuration is the missing link for full agent automation.

## Key Finding

The runner is fully operational for `manual-terminal` mode (read-only, status reporting). To enable `opencode-run` mode (real AI agent execution), **only the provider/API key configuration is missing**. All other prerequisites are met:
- OpenCode v1.17.9 installed ✅
- Tmux available ✅
- Node.js 22.x available ✅
- Git available ✅
- Runner scripts operational ✅
