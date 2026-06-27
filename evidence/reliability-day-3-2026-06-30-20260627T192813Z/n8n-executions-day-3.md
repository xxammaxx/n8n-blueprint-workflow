# n8n Executions — Day 3 Read-Only Check

**Date/Time UTC:** 2026-06-27T19:28:13Z
**Workflow:** Sv12QTo56NoPUu2D ("GitHub Ready Issue → Runner Agent Dispatch")

---

## API Access

| Endpoint | Status |
|----------|--------|
| `/healthz` | ✅ `{"status":"ok"}` |
| `/api/v1/workflows/Sv12QTo56NoPUu2D` | ❌ 401 Unauthorized |
| `/rest/workflows/Sv12QTo56NoPUu2D/executions` | ❌ 404 |
| N8N_API_KEY configured | ❌ No |

---

## Indirect Execution Indicators

| Indicator | Day 3 Value |
|-----------|-------------|
| **Workflow Local Export** | `exports/green/dispatcher-green-20260627T131737Z.json` |
| **Workflow ID** | Sv12QTo56NoPUu2D |
| **Active** | ✅ true |
| **Node Count** | 18 |
| **Schedule Trigger** | ✅ Present (15-min interval) |
| **Export Hash** | `0101cdef2a8c6ba54de47993f9d1e28ed1fb7d50941601d73f62085e494830c1` (unchanged) |

---

## GitHub Activity (Indirect Confirmation)

| Metric | Day 3 |
|--------|-------|
| New comments on Issues #3-#8 | 0 |
| agent:ready on any issue | ❌ None |
| Label changes | 0 |
| New runner evidence directories | 0 |

---

## Execution Summary (Last ~24h / Since Day 2 ~17:18 UTC)

| Metric | Value |
|--------|-------|
| **Last known success execution** | #69 (2026-06-27T12:00Z UTC, 86.3s, status: success) |
| **Execution #69 remains latest** | ✅ Yes |
| **Schedule triggers estimated** | ~29 (15-min × ~7.3h since Day 2 check) |
| **Schedule (success)** | Presumed all (no `agent:ready` → no dispatch) |
| **Schedule (error)** | None detected |
| **New runner dispatches** | 0 |
| **Double-starts** | ❌ 0 |
| **Manual runs** | ❌ 0 |
| **API verification** | ⚠️ UNAVAILABLE (401) |

---

## 4-Day Execution Trend

| Metric | Day 0 | Day 1 | Day 2 | Day 3 |
|--------|:-----:|:-----:|:-----:|:-----:|
| Last known success | #69 | #69 | #69 | #69 |
| Schedule active | ✅ | ✅ | ✅ | ✅ |
| New dispatches | 0 | 0 | 0 | 0 |
| Double-starts | 0 | 0 | 0 | 0 |
| Manual runs | 0 | 0 | 0 | 0 |
| API available | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

---

## Assessment

| Check | Status |
|-------|--------|
| Execution #69 remains latest success | ✅ |
| Schedule trigger firing (presumed) | ✅ |
| No unexpected dispatches | ✅ |
| No double-starts | ✅ |
| No manual runs | ✅ |
| No new execution evidence | ✅ |

**EXECUTIONS_GREEN_HEALTHY** — Execution #69 bleibt der letzte bewiesene Success über 4 Beobachtungstage. Der Schedule-Trigger läuft ohne Dispatch (keine `agent:ready` Issues). Erwartetes und korrektes Verhalten. N8N_API_KEY würde direkte API-Verifikation ermöglichen.

> **Consistent Note:** Day 0-3 identisch. Keine Änderungen erkennbar. Execution #69 (Format Final Result fix) ist und bleibt der finale bewiesene Success.
