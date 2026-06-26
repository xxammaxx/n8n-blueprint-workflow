# GitHub Source of Truth — Agent Dispatch Flow

> **Evidence-based diagram.** Updated 2026-06-24 after dispatcher workflow build.
> All components shown exist in the validated system.

## Full Dispatch Flow (Mermaid)

```mermaid
flowchart TD
    ManualTrigger["Manual Trigger<br/>(n8n UI / API execution)<br/>No Schedule Trigger present"] --> FetchIssue["GitHub Fetch Issue<br/>via issue_number parameter"]
    FetchIssue --> GH_Issue["GitHub Issue #3<br/>Source of Truth"]

    GH_Issue --> Guard["Guardrails<br/>open issue, ready label,<br/>not running, not blocked, not done"]
    Guard -->|valid| MarkRunning["GitHub Labels<br/>remove agent:ready<br/>add agent:running"]
    Guard -->|invalid| Skip["Skip / BLOCKED_WITH_DIAGNOSIS<br/>no runner execution"]

    MarkRunning --> Prepare["Prepare RUN_INPUT.json<br/>source_of_truth=github"]
    Prepare --> SSHWrite["n8n SSH Write<br/>RUN_INPUT.json to Runner"]
    SSHWrite --> SSHStart["n8n SSH Start<br/>start_github_issue_run.sh"]
    SSHStart --> Runner["Runner LXC 102<br/>192.168.1.53"]

    Runner --> Evidence["Local Evidence<br/>status.json, run-report.md,<br/>agent.log, commands.log"]
    Evidence --> SSHRead["n8n SSH Read<br/>status.json"]
    SSHRead --> Format["Format Evidence Comment"]
    Format --> GHComment["GitHub Issue Comment<br/>visible evidence summary"]

    GHComment --> SuccessLabels["GitHub Labels<br/>remove agent:running<br/>add agent:needs-review<br/>add evidence:attached"]
    SuccessLabels --> HumanReview["Human Review<br/>Issue remains open"]

    Runner -->|failure| FailureComment["GitHub Issue Comment<br/>BLOCKED_WITH_DIAGNOSIS"]
    FailureComment --> FailureLabels["GitHub Labels<br/>remove agent:running<br/>add agent:blocked<br/>add evidence:attached"]

    classDef github fill:#f6f8fa,stroke:#57606a,stroke-width:1px;
    classDef n8n fill:#fff4e6,stroke:#d97706,stroke-width:1px;
    classDef runner fill:#eef6ff,stroke:#2563eb,stroke-width:1px;
    classDef evidence fill:#ecfdf5,stroke:#059669,stroke-width:1px;
    classDef blocked fill:#fef2f2,stroke:#dc2626,stroke-width:1px;
    classDef manual fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    class GH_Issue,GHComment,SuccessLabels,FailureComment,FailureLabels,HumanReview github;
    class ManualTrigger,FetchIssue,N8N_Dispatch,Guard,MarkRunning,Prepare,SSHWrite,SSHStart,SSHRead,Format n8n;
    class ManualTrigger manual;
    class Runner runner;
    class Evidence evidence;
    class Skip blocked;
```

## Label State Machine

```mermaid
stateDiagram-v2
    [*] --> Queued: agent:queued
    Queued --> Ready: user adds agent:ready
    Ready --> Running: dispatcher starts
    Running --> NeedsReview: success
    Running --> Blocked: failure
    NeedsReview --> Ready: user re-runs by adding agent:ready
    Blocked --> Ready: user fixes and re-runs
    NeedsReview --> Done: human approval only
    Done --> [*]

    note right of Ready
      Start only if:
      issue open
      no agent:running
      no agent:blocked
      no agent:done
    end note

    note right of Done
      Never automatic.
      Human approval required.
    end note
```

## Trigger Decision

| Option | Status | Detail |
|--------|--------|--------|
| GitHub Trigger (issues:labeled) | ❌ NOT AVAILABLE | Requires public webhook URL — n8n instance (192.168.1.52) is on internal network, GitHub cannot deliver webhooks to private IP. |
| Polling (Schedule + Search API) | ❌ NOT IMPLEMENTED | Schedule Trigger node was not added to deployed workflow. Only Manual Trigger exists in current deployment. |
| Manual Trigger | ✅ ACTIVE | Dispatcher workflow `Sv12QTo56NoPUu2D` has only Manual Trigger. Execution #44 (Issue #3) succeeded for nodes 1-14, node 15 has pre-existing JS syntax error. |

## Component Map

```
┌──────────────────────────────────────────────────────────────┐
│                    GitHub (Source of Truth)                    │
│  ┌──────────────────┐  ┌────────────┐  ┌───────────────────┐ │
│  │   Issue Body     │  │  Labels    │  │   Comments        │ │
│  │  (Auftrag + AC)  │  │  (Status)  │  │   (Evidence)      │ │
│  └────────┬─────────┘  └─────┬──────┘  └───────────────────┘ │
│           │                  │                                 │
└───────────┼──────────────────┼─────────────────────────────────┘
            │                  │
            ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│         n8n Dispatcher (Orchestrator)                          │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ GitHub Trigger   │  │ Guardrails       │                   │
│  │ (issues:labeled) │  │ (anti-double-run)│                   │
│  └────────┬─────────┘  └────────┬─────────┘                   │
│           │                      │                             │
│           │   Mark Running       │                             │
│           │   (label update)     │                             │
│           └──────────┬───────────┘                             │
│                      ▼                                         │
│           ┌──────────────────────┐                             │
│           │ Prepare RUN_INPUT    │                             │
│           │ (from GitHub Issue)  │                             │
│           └──────────┬───────────┘                             │
│                      │ SSH                                     │
└──────────────────────┼────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              Runner LXC 102 (Execution Boundary)                │
│  ┌──────────────────────┐  ┌──────────────────────────────┐   │
│  │ RUN_INPUT.json       │  │ start_github_issue_run.sh    │   │
│  └──────────┬───────────┘  └──────────────┬───────────────┘   │
│             │                             │                    │
│             ▼                             ▼                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Runner Evidence                             │  │
│  │  status.json, run-report.md, commands.log, agent.log     │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                       │
                       │ n8n SSH Read
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         n8n (Evidence Handler)                                 │
│  Format Comment → GitHub Comment → Update Labels → Done       │
└──────────────────────────────────────────────────────────────┘
```

## Dual-Start Protection

The dispatcher enforces these rules before any runner execution:

1. Issue MUST be open
2. Label `agent:ready` MUST be present
3. Label `agent:running` MUST NOT be present
4. Label `agent:blocked` MUST NOT be present
5. Label `agent:done` MUST NOT be present
6. Repository MUST be `xxammaxx/n8n-blueprint-workflow`

If `agent:running` is already present: skip, optionally comment.

If `evidence:attached` is present and `agent:ready` is re-added: new run is allowed with a NEW run_id.

## Idempotency

Each run receives a unique Run ID:
```
gh-issue-<issue_number>-<YYYYMMDDTHHMMSSZ>
```

Evidence path:
```
/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-<number>/<run_id>/
```

## Workflow References

| Name | ID | Role | Active | Trigger |
|------|----|------|--------|---------|
| GitHub Issue -> Runner Agent Intake | `jb7BgKeWGee5Iq9d` | Manual fallback (12 nodes) | No | Manual |
| GitHub Ready Issue -> Runner Agent Dispatch | `Sv12QTo56NoPUu2D` | Auto-dispatcher via Manual Trigger (15 nodes) | **Yes** — UI shows active | **Manual only** (no Schedule Trigger) |

## Issue #3 Processing Result

| Detail | Value |
|--------|-------|
| Issue | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/3 |
| Execution | #44 — Manual trigger, 1m 28.494s |
| Nodes 1-14 | ✅ SUCCESS |
| Node 15 (Format Final Result) | ❌ ERROR — pre-existing JS syntax error |
| Pre-state | `agent:ready`, `mode:manual-terminal`, `risk:low` |
| Post-state | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| Runner Evidence | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-3/gh-issue-3-20260626T073802Z/` |
| status.json | `GREEN_PARTIAL`, `source_of_truth=github`, `issue_number=3` |
