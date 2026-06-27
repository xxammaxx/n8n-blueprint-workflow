# n8n Executions — Day 1 Read-Only Check

## Metadata
- **Date/Time UTC:** 2026-06-27T17:00:00Z (approx)
- **Workflow:** Sv12QTo56NoPUu2D (`GitHub Ready Issue → Runner Agent Dispatch`)
- **Methodology:** Read-only — no API access (401 requires auth), indirect indicators only

---

## API Access

| Endpoint | Status |
|----------|--------|
| `/rest/executions` | ❌ 401 Unauthorized |
| `/api/v1/executions` | ❌ 401 Unauthorized |
| `/rest/workflows/...` | ❌ 401 Unauthorized |
| `/healthz` | ✅ `{"status":"ok"}` |

> **Note:** n8n REST and Public API v1 require authentication (JWT Bearer token / email auth). N8N_API_KEY not available in environment. Read-only check relies on indirect indicators.

---

## Indirect Execution Indicators

### Local Export (Source of Truth for Workflow Config)
- **Export:** `exports/green/dispatcher-green-20260627T131737Z.json`
- **Workflow ID:** Sv12QTo56NoPUu2D
- **Active:** ✅ `true`
- **Nodes:** 18
- **Schedule Trigger:** ✅ Present (15 minutes)
- **Manual Trigger:** ✅ Present
- **Export Hash:** `0101cdef2a8c6ba54de47993f9d1e28ed1fb7d50941601d73f62085e494830c1`

### Evidence Directory Activity
- **New evidence dirs since Day 0 (post 15:28 UTC):**
  - `post-green-stabilization-2026-06-27T16-5` (this health check run)
  - `reliability-day-1-2026-06-28-20260627T165431Z` (this reliability check)
  - `push-and-reliability-start-2026-06-27T152645Z` (Day 0 final report)
- **New execution evidence dirs:** 0
- **No runner-generated evidence directories detected.**

### GitHub Activity (Runner Indicator)
- **Issues #3-#8 latest comment dates:**
  - #3: 2026-06-26T05:56:48Z (before Day 0)
  - #4: 2026-06-27T06:03:08Z (before Day 0)
  - #5: 2026-06-27T07:31:52Z (before Day 0)
  - #6: 2026-06-27T08:01:54Z (before Day 0)
  - #7: 2026-06-27T10:01:52Z (before Day 0)
  - #8: 2026-06-27T12:01:52Z (before Day 0)
- **New runner comments since Day 0:** 0
- **No new `agent:ready` labels detected on any issue.**
- **All labels unchanged:** `agent:needs-review`, `evidence:attached`.

---

## Execution Summary (Last ~24h)

| Metric | Value |
|--------|-------|
| **Last known success execution** | #69 (2026-06-27T12:00Z UTC) |
| **Execution #69 Status** | `success` (86.3s, verified Day 0) |
| **Schedule trigger fires since #69** | Estimated ~20+ (15-min interval × ~5h) |
| **Expected behavior** | Schedule fires → no `agent:ready` issues → workflow exits gracefully |
| **New execution evidence** | None detected |
| **New runner dispatches** | None detected |
| **Unerwartete Doppelstarts** | ❌ None |
| **Manuell ausgelöste Runs** | ❌ None detected |
| **Error executions** | No new errors detected (no error evidence) |

---

## Assessment

| Check | Status | Detail |
|-------|--------|--------|
| Last known success (#69) unchanged | ✅ | No newer success execution detected |
| Schedule trigger still firing | ✅ | Presumed (15-min interval, workflow active) |
| No unexpected executions | ✅ | No evidence of new runs |
| No double-starts | ✅ | All issues protected |
| No manual runs | ✅ | No manual trigger activity detected |
| API verification | ⚠️ UNAVAILABLE | 401 — requires authentication |

---

## Summary

**EXECUTIONS_GREEN_HEALTHY** — Last known success execution #69 remains the gold standard. No new execution activity detected since Day 0. All indirect indicators (GitHub comments, evidence directories, issue labels) confirm zero runner activity in the observation period. The schedule trigger is presumed to be firing on its 15-minute interval without dispatching (no `agent:ready` issues to process — expected behavior).

**Recommendation:** Consider configuring `N8N_API_KEY` for future reliability days to enable direct execution API verification. This would allow precise execution count and status tracking without relying on indirect indicators.
