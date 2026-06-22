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
| `start_blueprint_bootstrap.sh` | Main bootstrap orchestrator |
| `speckit_iteration.sh` | Speckit workflow iteration runner |

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
