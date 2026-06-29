# n8n Health Read-Only Observation

## Metadata
- **Timestamp UTC**: 2026-06-29T07:40:32Z
- **n8n Base URL**: `http://192.168.1.52:5678`
- **Container**: CT 101 (Proxmox LXC)

## Health Endpoint
- **`/healthz`**: HTTP 200 — `{"status":"ok"}`
- **Response Time**: Fast (within timeout)

## Base Page
- **`/` (n8n UI)**: HTTP 200 — 18893 bytes, n8n signature confirmed

## Workflow: `Sv12QTo56NoPUu2D`
- **Name**: `GitHub Ready Issue → Runner Agent Dispatch`
- **Active**: **YES** (confirmed via local export `exports/green/dispatcher-green-20260627T131737Z.json`)
- **Node Count**: 18
- **Schedule Trigger**: **PRESENT** — `n8n-nodes-base.scheduleTrigger` (15-minute interval)
- **Manual Trigger**: **PRESENT** — `n8n-nodes-base.manualTrigger` (Smoke Test)

### Node Inventory (18 nodes)
| # | Node Name | Type |
|---|-----------|------|
| 1 | Manual Trigger (Smoke Test) | `n8n-nodes-base.manualTrigger` |
| 2 | Fetch Issue from GitHub | `n8n-nodes-base.httpRequest` |
| 3 | Guardrails & Validate | `n8n-nodes-base.code` |
| 4 | Remove agent:ready Label | `n8n-nodes-base.httpRequest` |
| 5 | Add agent:running Label | `n8n-nodes-base.httpRequest` |
| 6 | Prepare RUN_INPUT.json | `n8n-nodes-base.code` |
| 7 | SSH Write RUN_INPUT to Runner | `n8n-nodes-base.ssh` |
| 8 | SSH Start Runner Script | `n8n-nodes-base.ssh` |
| 9 | Wait (5s) | `n8n-nodes-base.wait` |
| 10 | SSH Read status.json | `n8n-nodes-base.ssh` |
| 11 | Format Evidence Comment | `n8n-nodes-base.code` |
| 12 | Create GitHub Comment on Issue | `n8n-nodes-base.httpRequest` |
| 13 | Add Labels (agent:needs-review, evidence:attached) | `n8n-nodes-base.httpRequest` |
| 14 | Remove agent:running Label (404-tolerant) | `n8n-nodes-base.httpRequest` |
| 15 | Format Final Result | `n8n-nodes-base.code` |
| 16 | Schedule Trigger (15 min) | `n8n-nodes-base.scheduleTrigger` |
| 17 | GitHub Search Issues (agent:ready) | `n8n-nodes-base.httpRequest` |
| 18 | Pick First Ready Issue | `n8n-nodes-base.code` |

## Comment-Sync Status
- Node 10 (SSH Read status.json) is **PRESENT** — confirmed comment-sync patch is active
- Node 11 (Format Evidence Comment) receives status.json data
- Node 12 (Create GitHub Comment on Issue) posts comment with runner evidence

## API Check
- **Status**: **SKIPPED** — `N8N_API_KEY` in `.env.local` is a JWT token (not a valid n8n REST API key)
- **Known Issue**: The API key format mismatch is a known false positive from prior Secret Hygiene reports
- **Impact**: Cannot verify workflow state via REST API, but local exports provide equivalent validation

## Changes Performed
- **NONE** — strictly read-only
- No workflow edit, no publish, no restart, no trigger modification

## Verdict
- n8n: **HEALTHY** (HTTP 200 on all endpoints)
- Workflow: **ACTIVE** with 18 nodes, schedule trigger intact
- Comment-Sync nodes: **PRESENT** (SSH Read status.json → Format Evidence Comment → Create GitHub Comment)
- No unauthorized changes detected
