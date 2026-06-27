# n8n Execution Detail — Execution #53

**Session:** final-green-canary-issue-6-20260627T073906Z
**API Source:** n8n Public API v1 (authenticated)

---

## Raw Execution Data

| Field | Value |
|---|---|
| ID | 53 |
| Finished | true |
| Mode | trigger |
| Retry Of | null |
| Retry Attempt ID | null |
| Status | error |
| Started At | 2026-06-27T08:00:28.023Z |
| Stopped At | 2026-06-27T08:01:57.524Z |
| Created At | 2026-06-27T08:00:28.024Z |
| Stored At | 2026-06-27T08:01:57.525Z |
| Workflow ID | Sv12QTo56NoPUu2D |

---

## Duration Analysis

| Duration | Value |
|---|---|
| Total | 89.501s |
| Compared to #48 (Issue #4 via trigger) | 86.327s (Δ: +3.17s) |
| Compared to #51 (Issue #5 via trigger) | 85.752s (Δ: +3.75s) |
| Average full pipeline | ~87.2s |

---

## Trigger Verification

| Check | Value |
|---|---|
| Mode | `trigger` ✅ |
| NOT manual | ✅ (manual would show `mode=manual`) |
| Schedule alignment | ✅ 08:00:28 (within 30s of :00) |
| Previous schedule | ✅ #52 at 07:45:28 (15 min interval) |
| Next schedule expected | ~08:15:28 |

---

## Status Classification

The `error` status is **EXPECTED** and **COSMETIC**. It is caused by the pre-existing Format Final Result comment typo (line 3: `====` → should be `// ====`). All functional work (Guardrails, Labels, Runner, Evidence) completed successfully before this node executed.

The status would change to `success` once the manual UI fix is applied.
