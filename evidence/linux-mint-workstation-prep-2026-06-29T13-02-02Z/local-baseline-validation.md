# Local Baseline Validation

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Machine:** Linux Mint 22.1 (xxammaxx-desktop)

## Git State

| Check | Result |
|-------|--------|
| Repo clean | YES (only untracked: new evidence dir) |
| Branch | master |
| Up to date with origin | YES |
| Last commit | a78d427 — docs(ops): add linux mint new machine migration validation |

## Health Check Results

Dispatched `scripts/dispatcher-health-check.mjs`:

| Test | Status | Notes |
|------|--------|-------|
| n8n-reachable | PASS | HTTP 200, n8n signature confirmed |
| n8n-base-page | PASS | HTTP 200, 18893 bytes |
| workflow-api | SKIP | N8N_API_KEY not available |
| workflow-local | PASS | id=Sv12QTo56NoPUu2D, active=true, nodes=18 |
| protected-issues | PASS | 5/5 issues safe |
| git-status | WARN | master, commit a78d427, Green: false |
| evidence-dirs | WARN | powershell not found (expected on Linux) |
| exports-exist | WARN | powershell not found (expected on Linux) |
| runbook-exists | PASS | OPERATIONS_RUNBOOK.md found |
| green-baseline-exists | PASS | GREEN_BASELINE.md found |
| secret-hygiene | FAIL | `scripts/validate-secret-hygiene.mjs` failed |

**Overall Health:** `HEALTH_YELLOW`

## Notes
- `HEALTH_YELLOW` is expected — known `.playwright-mcp/` tracked files and powershell unavailable on Linux Mint
- Secret hygiene script failure relates to tracked `.playwright-mcp/` files (known incident)
- No runtime was changed during this validation
- Workflow `Sv12QTo56NoPUu2D` confirmed present (18 nodes, active)
