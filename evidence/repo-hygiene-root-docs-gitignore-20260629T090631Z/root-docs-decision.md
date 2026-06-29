# Root Documents Decision

**Date/Time UTC:** `2026-06-29T09:06:31Z`  

---

## Document Status

| Document | Root Present | Found Elsewhere | Path | Age |
|----------|-------------|-----------------|------|-----|
| `GREEN_BASELINE.md` | ❌ No | ✅ Yes | `evidence/post-green-stabilization-20260627T131737Z/GREEN_BASELINE.md` | ~2 days old (2026-06-27) |
| `OPERATIONS_RUNBOOK.md` | ❌ No | ✅ Yes | `evidence/post-green-stabilization-20260627T131737Z/OPERATIONS_RUNBOOK.md` | ~2 days old (2026-06-27) |

---

## Source Document Analysis

### GREEN_BASELINE.md (249 lines)

- **Status:** Comprehensive operational baseline
- **References commit:** `869fa69` (not current HEAD `8de09e1`)
- **Content:** n8n instance details, dispatcher workflow info, schedule config, runner info, canary history, double-run protection, known tooling insights, prohibited actions, safe operations, risk operations, rollback references, evidence index, comment-sync update (2026-06-29)
- **Relevance:** HIGH — essential landing-page documentation for anyone visiting the repository

### OPERATIONS_RUNBOOK.md (416 lines)

- **Status:** Complete operations manual
- **References commit:** `869fa69` (not current HEAD `8de09e1`)
- **Content:** Health checks, instance identification, dispatcher monitoring, schedule verification, issue processing verification, runner evidence, double-run detection, label reference, canary creation guide, incident response scenarios, routine maintenance, database patching procedure
- **Relevance:** HIGH — critical operational reference for the n8n dispatcher system

---

## Decision

### Option Analysis

| Option | Pros | Cons |
|--------|------|------|
| **Root Pointer** | Lightweight, auto-points to latest, no duplication | Requires pointer updating if paths change |
| **Root Mirror** | Self-contained, full content at root | ~665 lines duplication, risk of staleness, larger repo footprint |
| **No Action** | Zero work | Hard to discover, GitHub visitors miss critical docs |

### Chosen: **Root Pointer Files** (Option A)

**Rationale:**

1. **Discovery:** GitHub visitors landing on the repo root should immediately see links to the operational baseline and runbook
2. **Staleness risk:** Full mirror copies would quickly go stale; pointers to `evidence-index/latest.md` and `STATUS.md` ensure visitors find current information
3. **Single source of truth:** The canonical versions remain in their evidence directories; pointers avoid duplication
4. **Low maintenance:** Pointers only need updating if evidence paths are reorganized

---

## Implementation

### GREEN_BASELINE.md (Root Pointer)

Small pointer file directing to:
- `STATUS.md`
- `CHANGELOG.md`
- `evidence-index/latest.md`
- Latest operational baseline

### OPERATIONS_RUNBOOK.md (Root Pointer)

Small pointer file directing to:
- `STATUS.md`
- `evidence-index/latest.md`
- Latest operations evidence under `evidence/`
- Default branch declaration (`master`)

---

## Verdict

**`CREATE_ROOT_POINTERS`** — Root pointer files are the recommended approach. They maximize discoverability while minimizing maintenance burden and staleness risk.
