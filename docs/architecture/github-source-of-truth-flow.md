# GitHub Source of Truth — Agent Dispatch Flow

> **Evidence-based diagram.** Updated 2026-06-24 after dispatcher workflow build.
> All components shown exist in the validated system.

## Full Dispatch Flow (Mermaid)

```mermaid
flowchart TD
    GH_Issue["GitHub Issue<br/>Source of Truth"] --> GH_LabelReady["Label: agent:ready"]
    GH_LabelReady --> N8N_Dispatch["n8n Dispatcher<br/>GitHub Ready Issue -> Runner Agent Dispatch"]

    N8N_Dispatch --> Guard["Guardrails<br/>open issue, ready label,<br/>not running, not blocked, not done"]
    Guard -->|valid| MarkRunning["GitHub Labels<br/>remove agent:ready<br/>add agent:running"]
    Guard -->|invalid| Skip["Skip / BLOCKED_WITH_DIAGNOSIS<br/>no runner execution"]

    MarkRunning --> Prepare["Prepare RUN_INPUT.json<br/>source_of_truth=github"]
    Prepare --> SSHWrite["n8n SSH Write<br/>RUN_INPUT.json to Runner"]
    SSHWrite --> SSHStart["n8n SSH Start<br/>start_github_issue_run.sh"]
    SSHStart --> Runner["Runner LXC 102<br/>local execution boundary"]

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

    class GH_Issue,GH_LabelReady,GHComment,SuccessLabels,FailureComment,FailureLabels,HumanReview github;
    class N8N_Dispatch,Guard,MarkRunning,Prepare,SSHWrite,SSHStart,SSHRead,Format n8n;
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
| GitHub Trigger (issues:labeled) | ✅ SELECTED | 42 GitHub trigger nodes available in n8n v2.26.8. `On issues` trigger with label filter is the preferred approach. |
| Polling (Schedule + Search API) | 🔄 FALLBACK | Available if GitHub Trigger proves unreliable. Uses GitHub Search API with `label:agent:ready` query. |
| Manual Trigger | ✅ FALLBACK | Existing 12-node workflow `jb7BgKeWGee5Iq9d` retains Manual Trigger as developer fallback. |

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

| Name | ID | Role | Active |
|------|----|------|--------|
| GitHub Issue -> Runner Agent Intake | `jb7BgKeWGee5Iq9d` | Manual fallback (12 nodes) | No |
| GitHub Ready Issue -> Runner Agent Dispatch | (new) | Auto-dispatcher via GitHub Trigger | TBD |
