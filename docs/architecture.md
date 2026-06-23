# Architecture — n8n Blueprint Bootstrap Workflow

## System Overview

```
User Browser (form)
       |
       | HTTP POST multipart/form-data
       v
 n8n Instance (LXC 101, 192.168.1.52:5678)
       |
       | n8n Form Trigger → Code Nodes → SSH Nodes
       |
       v
 Runner (LXC 102, internal network)
       |
       | start_blueprint_bootstrap.sh
       | speckit_iteration.sh
       v
 Evidence Directory / Workspace
```

## Component Architecture

### n8n Workflow (V2)

```
[Form Trigger] → [Validate + Extract Blueprint] → [Prepare RUN_INPUT]
                                                        |
                                                        v
                                              [Write RUN_INPUT to Runner] (SSH)
                                                        |
                                                        v
                                              [Start Blueprint Bootstrap] (SSH)
                                                        |
                                                        v
                                              [Wait/Delay]
                                                        |
                                                        v
                                              [Read Status] (SSH)
                                                        |
                                                        v
                                              [Format Result] → [Respond to Webhook]
```

### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| project_slug | text | yes | Project identifier (a-z0-9, hyphens) |
| project_title | text | yes | Human-readable project name |
| blueprint_file | file | no | Markdown blueprint upload |
| blueprint_text | textarea | no | Text-based blueprint input |
| llm_command_mode | dropdown | yes | manual-terminal / opencode-run / hermes-run |
| opencode_model | text | no | Optional model override |
| max_runtime_minutes | number | yes | Maximum runtime (default: 30) |
| dry_run | checkbox | no | Dry-run mode (default: on) |
| allow_github_issue_script_generation | checkbox | no | Allow issue scripts (default: on) |
| allow_github_actions_files | checkbox | no | Allow actions files (default: on) |
| extra_instruction | textarea | no | Additional instructions |

### Runner Scripts

| Script | Purpose |
|--------|---------|
| `start_blueprint_bootstrap.sh` | Main bootstrap orchestrator (supports manual-terminal + opencode-run) |
| `speckit_iteration.sh` | Speckit workflow iteration runner |
| `agent-adapters/manual_terminal_adapter.sh` | Safe default — no agent autonomy |
| `agent-adapters/opencode_adapter.sh` | Controlled OpenCode launch in tmux with security profile |
| `agent-adapters/hermes_reviewer_adapter.sh.disabled` | Placeholder for future Hermes integration |
| `agent-adapters/common/run_input_validate.sh` | Validates RUN_INPUT.json structure and security |
| `agent-adapters/common/evidence_write.sh` | Standardized evidence writing |
| `agent-adapters/common/security_guard.sh` | Pre-execution security checks |

### Agent Runtime Layer

```
n8n Form → RUN_INPUT.json → start_blueprint_bootstrap.sh
                                  |
                    ┌─────────────┼─────────────┐
                    |             |             |
              manual-terminal  opencode-run  (hermes-run)
              (safe default)   (tmux)        (planned)
                                    |
                              OpenCode v1.17.9
                              /opt/dev-fabric/opencode/opencode
                                    |
                              opencode.json (restrictive)
                              • git push → deny
                              • gh pr create → deny
                              • gh workflow run → deny
                              • edit → ask
                              • bash → ask (selective allow)
```

### Evidence Structure

```
/opt/dev-fabric/evidence/blueprint-bootstrap/
  └── <project_slug>/
      └── run-<timestamp>-<shortid>/
          ├── RUN_INPUT.redacted.json
          ├── commands.log
          ├── agent.log
          ├── preflight.md
          ├── run-report.md
          ├── operator-commands.md
          ├── status.json
          └── specify-init.log / specify-check.log
```

## Security Architecture

See `docs/security-boundaries.md` for detailed security architecture.
