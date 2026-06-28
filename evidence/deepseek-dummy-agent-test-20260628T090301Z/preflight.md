# Preflight Report — DeepSeek Dummy Agent Test

**Timestamp (UTC):** 2026-06-28T09:03:59Z
**Evidence Dir:** `evidence/deepseek-dummy-agent-test-20260628T090301Z/`

## Environment Status

| Item | Value |
|------|-------|
| Date/Time UTC | 2026-06-28T09:03:59Z |
| Git Status | On master, 1 commit ahead of origin/master. Modified: n8n-signin-page.png (stale). Untracked: .playwright-mcp/*, evidence/* |
| Current Branch | `master` |
| Last Commit | `1b1ce59` — `test(runner): verify direct deepseek provider smoke` (2026-06-28 10:59:10 +0200) |
| Remote | `origin` = `https://github.com/xxammaxx/n8n-blueprint-workflow.git` |
| Remote Ahead | 1 commit (not yet pushed) |
| n8n Reachable | YES (via Proxmox SSH 192.168.1.136 → CT 101, n8n v2.26.8, systemctl=active) |
| n8n REST API | 401 Unauthorized (email auth required, not configured) |
| Workflow Active | YES (per STATUS.md — published, ▶️ icon) |
| Schedule Trigger Present | YES (15 minutes, confirmed) |
| Runner Reachable | YES (via Proxmox SSH 192.168.1.136 → CT 102 `lxc-dev-runner`, uptime 6d 22h) |
| OpenCode Version (Runner) | 1.17.9 ✅ |
| OpenCode Version (Local) | 1.15.0 |
| DeepSeek Provider Ready | YES (`provider=deepseek`, `model=deepseek-v4-pro`, `ALLOW_CALL=true`, `MAX_COST=0.25`) |
| Provider Smoke Green | YES (`DEEPSEEK_PROVIDER_SMOKE_GREEN` per STATUS.md) |
| Secret Hygiene Green | YES (`secrets/` gitignored, 0 real leaks confirmed) |
| Issues #3–#8 Protected | YES (all `agent:needs-review` + `evidence:attached`, none have `agent:ready`) |
| API-Key Output | NO (never included in evidence/preflight) |
| Dispatcher Unchanged | YES (Workflow `Sv12QTo56NoPUu2D` frozen, per STATUS.md) |

## Runner Provider Verification

```
Source: /opt/dev-fabric/secrets/opencode-provider.env (600 perms, runner:runner)
DEEPSEEK_API_KEY loaded: YES
Provider:              deepseek
Model:                 deepseek-v4-pro
ALLOW_PROVIDER_CALL:   true
MAX_COST_USD:          0.25
Secret values exposed: NO
```

## Runner Evidence Status

```
/opt/dev-fabric/evidence/
├── blueprint-bootstrap/
├── blueprint-smoke-demo/
├── github-agent-runs/
├── n8n-blueprint-workflow/
└── speckit-smoke-test/
```

## Proxmox Container Status

| CT ID | Name | Status |
|-------|------|--------|
| 101 | lxc-n8n-local | running |
| 102 | lxc-dev-runner | running (mounted) |
| 103 | pihole | running |
| 105 | heimdall-dashboard | running |
| 107 | docvault-ai | running |
| 110 | paperless-ai | running |
| 120 | positron-dev | stopped |
| 122 | paperless-ngx | running |

## Constraint Verification

| Constraint | Status |
|------------|--------|
| No dispatcher workflow modification | ✅ |
| No schedule trigger modification | ✅ |
| Issues #3–#8 not re-started | ✅ |
| No secrets output | ✅ |
| No GitHub Actions started | ✅ |
| No Proxmox configuration changes | ✅ |
| No Proxmox Host Zombie n8n touched | ✅ |
| No container/volume deletion | ✅ |
| Secret hygiene green | ✅ |

## Dispatcher Status (from STATUS.md)

- Workflow `Sv12QTo56NoPUu2D`: Published, active, 18 nodes
- Schedule Trigger: 15 min, firing correctly
- Last Execution: #69 — `success` (86.3s, Issue #8 processed)
- Guardrails: Trigger-agnostic, Issue #3 hard block operational
- All guardrails verified across 4 consecutive E2E tests (Issues #4-#8)

## Decision

### ✅ PREFLIGHT_COMPLETE — READY FOR DUMMY AGENT TEST

All preflight checks pass. The runner has a verified DeepSeek provider, the dispatcher is stable, issues #3-#8 are protected, and secret hygiene is green. Proceeding to Phase 2 (Runner Provider Readiness).
