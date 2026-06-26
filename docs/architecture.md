# Architecture — n8n Blueprint Bootstrap Workflow

## System Overview

```
User Browser (form)
       |
       | HTTP POST multipart/form-data
       v
 n8n Instance (Proxmox HOST 192.168.1.136, listens on 192.168.1.52:5678)
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

### 🏗️ Architecture Correction: n8n runs on Proxmox HOST, NOT in Container 101

**Discovered 2026-06-26:** n8n does NOT run inside container (LXC) 101 as previously assumed. It runs directly on the Proxmox host:

| Aspect | Previous Assumption | Actual |
|--------|-------------------|--------|
| **n8n location** | LXC 101 | **Proxmox HOST** (192.168.1.136) |
| **n8n PID** | — | 420195 |
| **n8n user** | — | 100999 |
| **n8n listening** | Container 101 | Host → 192.168.1.52:5678 routes to host |
| **Container 101 content** | n8n + dependencies | **Only system processes** |
| **Host n8n service** | n/a | **FAILED** — `/bin/n8n` not found, restart loop (independent from working n8n) |

**Implications:**
- All `pct exec 101` commands for n8n service management may be incorrect — n8n is not in that container
- The failed system service (`n8n.service` looking for `/bin/n8n`) on the host is a **separate issue** — it does NOT affect the working n8n instance
- The working n8n was started directly (not via systemd) by user 100999
- For service management: use `ssh root@192.168.1.136` directly (not `pct exec 101`) for n8n-related operations

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

### GitHub Ready Issue Dispatcher Workflow

The **dispatcher workflow** (`Sv12QTo56NoPUu2D`, 18 nodes) provides automated polling-based dispatching for GitHub Issues with `agent:ready` label.

```
[Schedule Trigger (10 min)] ─→ [GitHub Search Issues] ─→ [Pick First Ready Issue]
        │                                                    │
        │  (if found)                                        │  (if none → stop)
        ▼                                                    │
[Fetch Issue from GitHub] ←──────────────────────────────────┘
        │
        ▼
[Guardrails & Validate] ─→ (fails → stop if no agent:ready)
        │
        ▼
[Remove agent:ready] → [Add agent:running] → [Prepare RUN_INPUT.json]
        │
        ▼
[SSH Write] → [SSH Start] → [Wait 10s] → [SSH Read status.json]
        │
        ▼
[Format Evidence Comment] → [GitHub Comment API] → [Add Labels: agent:needs-review, evidence:attached]
        │
        ▼
[Remove agent:running] → [Format Final Result]
```

**Activation Mechanism — Critical Finding (2026-06-26):**

In n8n regular deployment mode, Schedule Trigger registration requires **UI-level Publish + Active-Toggle**. Neither CLI publish (`n8n publish:workflow`) nor direct database update (`UPDATE workflow_entity SET active=1`) suffices:

| Method | DB `active` Flag | Schedule Registered | Runtime Active |
|--------|-----------------|---------------------|----------------|
| UI Publish + Active Toggle | ✅ = 1 | ✅ Yes | ✅ Yes |
| CLI `n8n publish:workflow` | ✅ = 1 | ❌ No | ❌ No |
| DB `UPDATE SET active=1` | ✅ = 1 | ❌ No | ❌ No |
| API Import only | ❌ = 0 | ❌ No | ❌ No |
| API PATCH + POST /activate | ✅ = 1 | ⚠️ **UNVERIFIED** | ⚠️ **UNVERIFIED** |

**Code Node Lint Requirement:** n8n v2.26.8's Code node linter flags **unused variables** as blocking issues. This prevents the Publish button from being enabled. Before activation, ensure all Code nodes have no lint warnings:
```javascript
// BROKEN — unused variable blocks Publish:
const data = $input.first().json;  // ← REMOVE THIS LINE
const prepData = $('Prepare RUN_INPUT.json').first().json;

// FIXED:
const prepData = $('Prepare RUN_INPUT.json').first().json;
```

**API Activation Endpoints:**
- `PATCH /rest/workflows/<ID>` — Update workflow (e.g., fix code node)
- `POST /rest/workflows/<ID>/activate` — Activate workflow (returns `{"active":true}`)
- Requires: `n8n-auth` JWT cookie + `browser-id` header (SHA-256 hashed)

**⚠️ API Activation Caveat:** While `POST /rest/workflows/<ID>/activate` returns `active: true` with HTTP 200, it may NOT register the Schedule Trigger for n8n startup activation. Only UI Publish + Active Toggle is confirmed to register Schedule Triggers. After API activation, verify by:
1. Checking n8n UI Active toggle status
2. Waiting for next Schedule Trigger cycle and checking if issues are processed
3. Checking n8n startup logs for `"Currently active workflows"` after n8n restart

**Verification:** Check n8n startup logs for `"Currently active workflows"` — only UI-activated workflows appear. This is confirmed for n8n v2.26.8.

**Trigger:** Polling (Schedule + GitHub Search API: `is:issue is:open label:agent:ready repo:xxammaxx/n8n-blueprint-workflow&per_page=1`, every 10 minutes) — selected because n8n is on internal network without public URL for GitHub webhooks.

**Guardrails:** Anti-double-start protection prevents concurrent runs. See `docs/architecture/github-source-of-truth-flow.md` for full Mermaid diagrams.

**Old Dispatcher:** `k1c2d3FfWHee6Jr0e` (15 nodes, embedded export ID only) — kept as inactive backup. Live ID is `Sv12QTo56NoPUu2D`.

**Integration:** The dispatcher reuses the same runner scripts, evidence structure, and label conventions as the manual intake workflow.

### Architecture Diagrams

Full Mermaid diagrams are available in `docs/architecture/github-source-of-truth-flow.md`:
- **Full Dispatch Flow** — end-to-end flowchart
- **Label State Machine** — state diagram for label transitions
- **Trigger Decision** — polling vs webhook comparison
- **Component Map** — system architecture overview
- **Dual-Start Protection** — guardrail rules

Standalone diagram files:
- `docs/architecture/system-map.mmd` — system component map
- `docs/architecture/evidence-flow.mmd` — evidence flow sequence diagram

## Security Architecture

See `docs/security-boundaries.md` for detailed security architecture.
