# Issues #3, #4, #5 — Baseline Before Canary #6

**Timestamp:** 2026-06-27T07:47:59Z

---

## Issue #3 Baseline

| Field | Value |
|---|---|
| State | OPEN |
| Labels | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| Comment Count | 5 |
| Last Updated | 2026-06-26T07:56:33Z |
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/3 |

**Status:** NOT processed recently. Last update 2026-06-26. Should NOT be processed by Canary #6.

---

## Issue #4 Baseline

| Field | Value |
|---|---|
| State | OPEN |
| Labels | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| Comment Count | 3 |
| Last Updated | 2026-06-27T07:04:16Z |
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/4 |

**Status:** Already processed (has `agent:needs-review` + `evidence:attached`). Should NOT be re-processed.

---

## Issue #5 Baseline

| Field | Value |
|---|---|
| State | OPEN |
| Labels | `agent:needs-review`, `evidence:attached`, `test:canary`, `dispatcher:e2e` |
| Comment Count | 1 |
| Last Updated | 2026-06-27T07:31:53Z |
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/5 |

**Status:** Already processed (Canary #5 via Execution #51). Should NOT be re-processed.

---

## Guard: All 3 issues have `agent:needs-review` — not `agent:ready`

This means:
- GitHub Search for `agent:ready` will NOT return #3, #4, or #5
- The dispatcher will ONLY find Issue #6 (has `agent:ready`)
- Double-run protection is inherently enforced by label state
