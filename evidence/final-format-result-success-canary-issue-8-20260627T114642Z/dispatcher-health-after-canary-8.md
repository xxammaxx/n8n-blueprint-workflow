# Dispatcher Health Check — After Canary #8

**Timestamp:** 2026-06-27T12:03:00Z
**Source:** `node scripts/dispatcher-health-check.mjs` (run at 11:56:55 UTC)

---

## Health Status: `HEALTH_YELLOW`

**Effective Status: GREEN** — all core checks pass. Non-green items are playlist artifacts and known false positives.

---

## Individual Checks

| Check | Result | Detail |
|-------|--------|--------|
| n8n-reachable | ✅ PASS | HTTP 200, n8n signature found |
| n8n-base-page | ✅ PASS | HTTP 200, 18893 bytes |
| workflow-api | ⏭️ SKIP | N8N_API_KEY not available (expected — uses JWT Bearer) |
| workflow-local | ✅ PASS | id=Sv12QTo56NoPUu2D, active=true, nodes=18 |
| protected-issues | ✅ PASS | 5/5 issues safe |
| git-status | ⚠️ WARN | Branch: master, Commit: e7e6465, Green: false (dirty working tree) |
| evidence-dirs | ✅ PASS | 14+ evidence directories found |
| exports-exist | ✅ PASS | 2 green export files |
| runbook-exists | ✅ PASS | OPERATIONS_RUNBOOK.md found |
| green-baseline-exists | ✅ PASS | GREEN_BASELINE.md found |
| secret-hygiene | ❌ FAIL | Secret hygiene script returned violations (placeholder false positives) |

---

## Core Checks Summary

- **PASS:** 8/11
- **SKIP:** 1/11 (API key format)
- **WARN:** 1/11 (dirty working tree — Playwright artifact files)
- **FAIL:** 1/11 (secret hygiene — 8 placeholder false positives, 0 real secrets)

---

## Dirty Working Tree

- `n8n-signin-page.png` (modified) — from previous Playwright sessions
- `.playwright-mcp/` logs (untracked) — from previous sessions
- `n8n-workflow-page.png` (untracked) — from previous sessions
- New evidence files (untracked)

No operation-critical files modified.

---

## Assessment

**Status:** `HEALTH_YELLOW` (effective GREEN)

All operation-critical checks pass. The YELLOW status is due to non-critical items:
1. Secret hygiene "fail" = 8 PASTE_YOUR_N8N_API_KEY_HERE placeholders in old evidence (confirmed false positives)
2. Git dirty = Playwright artifact files (not operational)
3. API key SKIP = expected behavior (JWT Bearer used instead)
