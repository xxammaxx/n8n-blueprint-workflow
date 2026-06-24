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

## GitHub Source-of-Truth Architecture

```
┌─────────────────────────────────────────┐
│         GitHub (Source of Truth)        │
│  Issue ← Auftrag                        │
│  Labels ← Status                        │
│  Issue Comments ← Evidence-Zusammenfassung│
└──────────────┬──────────────────────────┘
               │ read/write (GitHub API)
               ▼
┌─────────────────────────────────────────┐
│     n8n (Orchestrator / Router)         │
│  GitHub Trigger / Manual Trigger        │
│  Validate Issue Contract                │
│  Prepare RUN_INPUT.json                 │
│  SSH Write/Start/Read → Runner          │
│  Format Evidence Comment                │
│  Create GitHub Comment (API)            │
│  Add Labels (API)                       │
│  Remove agent:running (API, 404-tolerant)│
│  Format Final Result                    │
└──────────────┬──────────────────────────┘
               │ SSH (key-based auth)
               ▼
┌─────────────────────────────────────────┐
│     Runner (LXC 102)                    │
│  start_github_issue_run.sh              │
│  Evidence: status.json, run-report.md   │
│  Mode: manual-terminal (default)        │
│  OpenCode v1.17.9 (vorbereitet)         │
└─────────────────────────────────────────┘
```

### GitHub Agent Workflow

1. **Intake:** GitHub Issue mit Template `agent-task.yml` erstellen
2. **Queue:** Labels `agent:queued`, `mode:*`, `risk:*`, `human-approval-required`
3. **Ready:** Label `agent:queued` → `agent:ready` (NUR mit explizitem Nutzer-Start)
4. **Execute:** n8n liest Issue → Runner führt aus → Evidence wird geschrieben
5. **Report:** n8n kommentiert Issue mit Evidence-Zusammenfassung
6. **Labels:** n8n setzt `agent:needs-review` + `evidence:attached`, entfernt `agent:running`
7. **Done:** Labels `agent:done` + `evidence:attached` setzen

### Data Flow: Prepare Node as Stable Context Source

**Critical Pattern:** The `Prepare RUN_INPUT.json` node (Node 3) is the **stable data source** for issue context. It produces `owner`, `repo`, `issue_number`, `run_input_remote`, `run_input_b64`, and `evidence_dir` BEFORE any API calls. All downstream nodes that need this data MUST reference Node 3 directly.

```
Node 3: Prepare RUN_INPUT.json  ← produces stable context (owner, repo, issue_number)
  │
  ├──▶ Node 4/5/7 (SSH nodes)  → use $('Prepare RUN_INPUT.json').first().json.*
  │
  ├──▶ Node 8 (Format Comment)  → $json still has Prepare data at this point
  │
  ├──▶ Node 10 (GitHub Comment) → HTTP Request → $json is OVERWRITTEN with API response
  │
  └──▶ Node 11/12 (Labels)      → MUST use $('Prepare RUN_INPUT.json').first().json.*
                                  → $json now contains comment API response, NOT issue data
```

**Why This Matters:**
- After Node 10 (GitHub Comment API), `$json` contains the comment response — NOT the original issue identifiers
- Nodes 11 and 12 need `owner`, `repo`, `issue_number` — these are ONLY available from Node 3
- Using `$json.owner` after an API call causes HTTP 404 because the value is `undefined`
- Cross-node references (`$('Node Name').first().json.field`) bypass this problem

### Labelmodell

| Label | Bedeutung |
|-------|-----------|
| `agent:queued` | Auftrag existiert, nicht startbereit |
| `agent:ready` | **Startsignal** für n8n |
| `agent:running` | Lauf aktiv |
| `agent:blocked` | Lauf blockiert |
| `agent:needs-review` | Human Review nötig |
| `agent:done` | Abgeschlossen |
| `evidence:attached` | Evidence-Kommentar geschrieben |
| `human-approval-required` | Nächster Schritt braucht Freigabe |
| `mode:manual-terminal` | Default (keine Autonomie) |
| `mode:opencode-run` | OpenCode in tmux (braucht Provider) |
| `mode:hermes-review` | Hermes-Sidecar (zukünftig) |
| `risk:low/medium/high` | Risikostufe |

## Security Architecture

See `docs/security-boundaries.md` for detailed security architecture.
