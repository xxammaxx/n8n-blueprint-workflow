# Root Documents Created

**Date/Time UTC:** `2026-06-29T09:06:31Z`  

---

## Decision Recap

Per `root-docs-decision.md`, the recommended approach was **Root Pointer Files** (Option A). Root mirror copies were deemed unnecessary since the complete documents are already available in the evidence directory and linked from the pointers.

---

## Files Created

### 1. `GREEN_BASELINE.md` (Root Pointer)

```markdown
# Green Baseline

Current operational baseline for this repository.

See the latest frozen baseline and evidence index:

- `evidence-index/latest.md`
- `STATUS.md`
- `CHANGELOG.md`

This file is intentionally a root-level pointer so GitHub visitors can find the current operational baseline quickly.
```

**Size:** ~200 bytes (pointer) vs ~6KB (full mirror)  
**Maintenance:** Minimal — only needs update if evidence paths change

### 2. `OPERATIONS_RUNBOOK.md` (Root Pointer)

```markdown
# Operations Runbook

Current operations runbook pointer for the n8n dispatcher system.

Start here:

- `STATUS.md`
- `evidence-index/latest.md`
- latest operations evidence under `evidence/`

This repository's default branch is `master`, which is the current source of truth.
```

**Size:** ~230 bytes (pointer) vs ~11KB (full mirror)  
**Maintenance:** Minimal — only needs update if evidence paths change

---

## Why Pointers, Not Mirrors

| Factor | Decision |
|--------|----------|
| **Staleness risk:** | Mirrors would quickly go stale (source documents reference old commit `869fa69`, not current `8de09e1`) |
| **Discoverability:** | Pointers achieve the same goal — visitors find operational docs from the root |
| **Maintenance burden:** | Pointers are 20x smaller and never go stale as long as paths are stable |
| **Single source of truth:** | Canonical versions remain in evidence directories; pointers avoid duplication |

---

## Verification

- ✅ Both files created at repo root
- ✅ Both files contain 0 secrets
- ✅ Both files are plain Markdown (no executable content)
- ✅ Both files correctly reference `STATUS.md`, `evidence-index/latest.md`, and `CHANGELOG.md`
- ✅ Both files acknowledge `master` as the default branch / source of truth
