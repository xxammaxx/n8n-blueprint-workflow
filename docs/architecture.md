# Architecture — n8n Blueprint Bootstrap Workflow

## System Overview

```
User Browser (form)
       |
       | HTTP POST multipart/form-data
       v
 n8n Instance (CT 101 / 192.168.1.52, listens on 192.168.1.52:5678)
       |
       | n8n Form Trigger → Code Nodes → SSH Nodes
       |
       v
 Runner (CT 102 / lxc-dev-runner / 192.168.1.53, internal network)
       |
       | start_blueprint_bootstrap.sh
       | speckit_iteration.sh
       v
 Evidence Directory / Workspace
```

### n8n Location: CT 101 (Container), NOT Proxmox Host

**Verified 2026-06-26:** n8n runs inside container (LXC) 101 on the Proxmox host:

| Aspect | Detail |
|--------|--------|
| **n8n location** | **CT 101** (192.168.1.52) |
| **n8n PID** | 420195 inside CT 101 |
| **n8n user** | `n8n` (system user within container) |
| **n8n process** | `node /usr/bin/n8n start` |
| **Listening** | CT 101 binds to 192.168.1.52:5678 — confirmed via `curl healthz` |
| **Proxmox host** | 192.168.1.136 — has **defective n8n.service** in restart loop (80850+ restarts), looking for `/bin/n8n` which does not exist. This is NOT the live instance — it is a separate, failed systemd unit. |
| **CT 102** | `lxc-dev-runner` at 192.168.1.53 — running, used as execution boundary |

**Correct commands for n8n service management:**
- Container-level: `pct exec 101 -- <command>` for n8n operations inside CT 101
- Host-level: `ssh root@192.168.1.136` for Proxmox host management
- The defective host n8n.service does NOT affect the working n8n in CT 101

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

The **dispatcher workflow** (`Sv12QTo56NoPUu2D`, 15 nodes) provides dispatching for GitHub Issues with `agent:ready` label via Manual Trigger. No Schedule Trigger node is present in the deployed workflow.

```
[Manual Trigger] ─→ [GitHub: Get Issue] ─→ [Guardrails & Validate]
        │                                            │
        │                                            ▼
        │                          (pass) → [Remove agent:ready] → [Add agent:running]
        │                                            │
        │                                            ▼
        │                                   [Prepare RUN_INPUT.json]
        │                                            │
        │                                            ▼
        │                              [SSH Write] → [SSH Start] → [Wait 5s] → [SSH Read status.json]
        │                                            │
        │                                            ▼
        │                              [Format Evidence Comment] → [GitHub Comment API]
        │                                            │
        │                                            ▼
        │                              [Add Labels: agent:needs-review, evidence:attached]
        │                                            │
        │                                            ▼
        │                              [Remove agent:running] (404-tolerant) → [Format Final Result]
        │                                            │
        │                                            ▼
        │                                    (Node 15: JS Syntax Error)
```

**Activation Mechanism — Key Finding (2026-06-26):**

The dispatcher workflow (`Sv12QTo56NoPUu2D`) is **active** in the n8n UI (shows ▶️ icon, all nodes show "Deactivate"). It uses a **Manual Trigger** only — no Schedule Trigger node is present in the deployed workflow. For Schedule auto-run, a Schedule Trigger node must be added via the n8n UI, followed by UI-Publish and UI-Active-Toggle.

| Method | DB `active` Flag | Trigger Type | Result |
|--------|-----------------|--------------|--------|
| UI Import + Manual Trigger only | ✅ = 1 | Manual only | ✅ Active, manual execution works |
| UI Publish + Active Toggle (with Schedule node) | ✅ = 1 | Schedule | ✅ Schedule registered at startup |
| API PATCH + POST /activate (no Schedule node) | ✅ = 1 | Manual only | ✅ Active, but no auto-run |
| CLI `n8n publish:workflow` | ✅ = 1 | N/A | ❌ Doesn't add Schedule Trigger |
| DB `UPDATE SET active=1` | ✅ = 1 | N/A | ❌ Schedule NOT registered |

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

**Current Dispatcher State:**
- **Workflow ID:** `Sv12QTo56NoPUu2D`
- **Active:** YES (UI shows active with ▶️ icon)
- **Nodes:** 15
- **Trigger:** Manual Trigger (NOT Schedule Trigger)
- **Manual execution #44 (Issue #3):** Nodes 1-14 ✅ SUCCESS, Node 15 ❌ ERROR (pre-existing JS syntax error in "Format Final Result")

**For Schedule auto-run, the following steps are required:**
1. Add a Schedule Trigger node to the workflow via n8n UI
2. UI-Publish the workflow
3. Toggle Active to register the Schedule Trigger at n8n startup
4. Verify: next cycle should auto-process issues with `agent:ready`

**Trigger Decision:** GitHub webhooks are not viable (n8n is on internal network without public URL). Polling (Schedule + GitHub Search API) is the intended strategy but requires the Schedule Trigger node to be added to the workflow first.

**Guardrails:** Anti-double-start protection prevents concurrent runs. See `docs/architecture/github-source-of-truth-flow.md` for full Mermaid diagrams.

**Old Dispatcher (export reference):** `k1c2d3FfWHee6Jr0e` (embedded export ID only — not a live workflow). Live ID is `Sv12QTo56NoPUu2D` (15 nodes).

**Integration:** The dispatcher reuses the same runner scripts, evidence structure, and label conventions as the manual intake workflow.

## Issue #3 Processing Result

| Detail | Value |
|--------|-------|
| Issue | [#3](https://github.com/xxammaxx/n8n-blueprint-workflow/issues/3) — "[smoke] Scheduler-Dispatcher Dauerbetrieb" |
| Execution | #44 — Manual trigger, 1m 28.494s |
| Nodes 1-14 | ✅ SUCCESS (all core nodes: Fetch Issue, Guardrails, Labels, SSH Write/Start/Read, Comment API) |
| Node 15 (Format Final Result) | ❌ ERROR — pre-existing JS syntax error (unrelated to dispatcher logic) |
| Pre-state labels | `agent:ready`, `mode:manual-terminal`, `risk:low` |
| Post-state labels | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| `agent:ready` | ✅ REMOVED |
| `agent:running` | ✅ Set then removed |
| `agent:done` | ❌ NOT set (requires human approval) |
| Issue remains | OPEN |
| Comment posted | ✅ Agent Run Result — Run ID `gh-issue-3-20260626T073802Z` |
| Runner Evidence | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-3/gh-issue-3-20260626T073802Z/` |
| status.json | `GREEN_PARTIAL`, `source_of_truth=github`, `issue_number=3` |

### Key Finding: Only Manual Trigger Present

The deployed workflow has **no Schedule Trigger node**. The previous assumption that a 10-minute Schedule Trigger was configured was incorrect. The workflow export only contains a Manual Trigger. For scheduled auto-run:
1. A Schedule Trigger node must be added via n8n UI
2. The workflow must be UI-Published
3. The Active toggle must be cycled (Off → On) to register the Schedule Trigger

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
