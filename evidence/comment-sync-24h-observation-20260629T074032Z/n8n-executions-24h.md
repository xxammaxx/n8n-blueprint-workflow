# n8n Executions Read-Only — 24h Check

## Metadata
- **Timestamp UTC**: 2026-06-29T07:40:32Z
- **Workflow**: `Sv12QTo56NoPUu2D` (`GitHub Ready Issue → Runner Agent Dispatch`)
- **Schedule Interval**: 15 minutes
- **Observation Window**: ~2026-06-28T07:40Z to 2026-06-29T07:40Z

## Execution Assessment

### Methodology
- REST API access not available (N8N_API_KEY is JWT token, not n8n API key)
- Execution data inferred from GitHub issue activity and comment timestamps
- All Issue #3–#16 comments examined for unexpected activity

### Comment Activity in 24h Window
| Issue | Last Comment (UTC) | Status | Activity Since Freeze? |
|-------|---------------------|--------|------------------------|
| #3 | 2026-06-26T07:56:33Z | Open | No — outside window |
| #4 | 2026-06-27T07:04:16Z | Open | No — outside window |
| #5 | 2026-06-27T07:31:52Z | Open | No — outside window |
| #6 | 2026-06-27T08:51:33Z | Open | No — outside window |
| #7 | 2026-06-27T10:01:52Z | Open | No — outside window |
| #8 | 2026-06-27T12:01:52Z | Open | No — outside window |
| #9 | 2026-06-28T09:16:52Z | Open | No — last was baseline run |
| #10 | 2026-06-28T09:47:51Z | Open | No — last was baseline run |
| #11 | 2026-06-28T10:02:51Z | Open | No — last was baseline run |
| #12 | 2026-06-28T12:31:52Z | Open | No — last was baseline run |
| #13 | 2026-06-29T05:46:52Z | Open | No — last was baseline run |
| #14 | 2026-06-29T06:16:51Z | Open | No — last was baseline run |
| #15 | 2026-06-29T06:31:52Z | Open | No — last was baseline run |
| #16 | 2026-06-29T06:46:52Z | Open | **FROZEN BASELINE** — last comment is GREEN Comment-Sync verification |

### Baseline Freeze Point
- **Commit**: `cc1257e41fbb9555ff57c28d8fc7d76afc7ee472` — `docs(n8n): freeze comment sync green baseline`
- **Freeze Time**: ~2026-06-29T06:57Z
- **Since Freeze**: No new comments on any protected issue (#3–#16)

## Findings

### Unexpected Dispatches
- **None detected** — no new runner comments on any issue since freeze

### Doppelstarts (Double Dispatches)
- **None detected** — each issue has only 1 runner comment (the baseline run)

### New `agent:ready` Issues
- **None** — `gh issue list --search "label:agent:ready"` returned empty results

### Re-processed Issues
- **None** — Issues #3–#16 have not been re-processed since their last run

### New Productive Runs
- **None** — no new productive (non-dummy/non-canary) issue activity

## Verdict
- **Executions in past 24h**: Baseline runs only (issues #9–#16 were processed during the stabilization builds)
- **Success/Error Split**: Not directly measurable (no API access), but all runner comments show GREEN status
- **Unexpected Activity**: **NONE**
- **Issues Protected**: **YES** — all #3–#16 show no new activity since baseline freeze

### Note
Direct execution count from n8n API is unavailable because the stored `N8N_API_KEY` is a JWT token (likely an OpenCode provider key mislabeled), not an n8n REST API key. This is a **known false positive** from prior Secret Hygiene audits and does not affect the dispatcher's actual operation (the workflow dispatches via SSH, not via REST API).
