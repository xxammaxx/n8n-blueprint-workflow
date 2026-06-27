# Secret Hygiene — Day 2 Read-Only Scan

## Metadata
- **Date/Time UTC:** 2026-06-27T17:14:00Z
- **Script:** `scripts/validate-secret-hygiene.mjs`

---

## Script Result

| Metric | Value |
|--------|-------|
| **Script Status** | ✅ Ran successfully |
| **Violations Reported** | 24 |
| **False Positives** | 24 (100%) |
| **Real Secrets Found** | 0 |

---

## Violations Analysis

### Category 1: Evidence Files — API Key References (3 findings)
All three are `PASTE_YOUR_N8N_API_KEY_HERE` or similar placeholder strings in documentation/planning files.

| File | Verdict |
|------|---------|
| `evidence/.../n8n-write-access-plan.md` | ✅ FP — template placeholder |
| `evidence/.../secret-hygiene-post-success.md` | ✅ FP — meta-report |
| `evidence/.../secret-hygiene-day-1.md` | ✅ FP — Day 1 hygiene report referencing placeholders |

### Category 2: Placeholder Strings (21 findings)
All are `PASTE_YOUR_N8N_API_KEY_HERE` appearing in evidence reports documenting hygiene scan results.

**All 24: FALSE POSITIVES** — keine echten Secrets.

---

## Manual Verification

| Area | Files | Real Secrets |
|------|-------|:-----------:|
| `.env.example` | 1 | 0 (placeholder only) |
| `.env.local` | 1 | Key present but NOT read/output |
| `.gitignore` | 1 | ✅ Effective |
| `README.md` | 1 | 0 (2 hits are docs about Windows KEY filtering) |
| `STATUS.md` | 1 | 0 |
| `CHANGELOG.md` | 1 | 0 |
| `GREEN_BASELINE.md` | 1 | 0 |
| `OPERATIONS_RUNBOOK.md` | 1 | 0 |
| `scripts/` | 13 files | 0 |
| `exports/green/` | 2 files | 0 |
| `evidence/` | ~120+ .md files | 0 (24 FP) |

### Secret Pattern Scan

| Pattern | Found |
|---------|:-----:|
| `ghp_` (GitHub PAT) | ❌ 0 |
| `gho_` (GitHub OAuth) | ❌ 0 |
| `github_pat_` | ❌ 0 |
| `sk-` (OpenAI) | ❌ 0 |
| `xox[baprs]-` (Slack) | ❌ 0 |
| `-----BEGIN` (SSH/PEM) | ❌ 0 |
| Real n8n API keys | ❌ 0 |

---

## Day-over-Day Comparison

| Metric | Day 0 | Day 1 | Day 2 |
|--------|:-----:|:-----:|:-----:|
| Script ran | ❌ FAIL | ✅ SUCCESS | ✅ SUCCESS |
| Violations | 17 | 20 | 24 |
| False Positives | 17 | 20 | 24 |
| Real Secrets | 0 | 0 | 0 |
| Growth | — | +3 | +4 |

> Growth explained: Day 1 added 3 FP (Day 0 final reports), Day 2 adds 4 FP (Day 1 evidence files: secret-hygiene-day-1.md, final-report.md, 2026-06-28.md, reliability-day-1). All are meta-references to `PASTE_YOUR_N8N_API_KEY_HERE` placeholder.

---

## Assessment

**SECRET_HYGIENE_GREEN** ✅ — 0 echte Secrets, 24 False Positives (alle Placeholder-Referenzen in Evidence-Dokumentation). `.env.local` geschützt durch `.gitignore`. Kein Secret-Leak. Dreitägiger Trend: sauber.
