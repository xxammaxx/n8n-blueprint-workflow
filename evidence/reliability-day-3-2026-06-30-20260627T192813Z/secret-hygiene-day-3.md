# Secret Hygiene — Day 3 Read-Only Check

**Date/Time UTC:** 2026-06-27T19:28:13Z
**Script:** `node scripts/validate-secret-hygiene.mjs`

---

## Script Execution

| Metric | Value |
|--------|-------|
| **Script Result** | ❌ FAIL (25 violations) |
| **Effective Status** | ✅ GREEN |
| **Real Secrets** | 0 |
| **False Positives** | 25 (all) |

---

## Violation Breakdown

### Category 1: Evidence-Datei enthält API-Key (1)
- `evidence/post-success-operations-hardening-20260627T140931Z/n8n-write-access-plan.md` — **FP** (documentation example, no real key)

### Category 2: Evidence-Datei enthält mögliches Secret (2)
- `evidence/post-success-operations-hardening-20260627T140931Z/secret-hygiene-post-success.md` — **FP** (already redacted: `***REDACTED***`)
- `evidence/reliability-day-1-2026-06-28-20260627T165431Z/secret-hygiene-day-1.md` — **FP** (already redacted: `***REDACTED***`)

### Category 3: Platzhalter `PASTE_YOUR_N8N_API_KEY_HERE` in Evidence-Dokumentation (22)
All in evidence `.md` files — documentation placeholders, zero real secrets.

**Affected directories:**
- evidence/final-format-result-success-canary-issue-8-20260627T114642Z/ (3 files)
- evidence/playwright-mcp-green-baseline-check-20260627T1131Z/ (4 files)
- evidence/post-green-stabilization-20260627T131737Z/ (3 files)
- evidence/post-success-operations-hardening-20260627T140931Z/ (4 files)
- evidence/push-and-reliability-start-2026-06-27T152645Z/ (3 files)
- evidence/reliability-daily/2026-06-28.md
- evidence/reliability-day-1-.../ (2 files)
- evidence/reliability-day-2-.../ (1 file)
- evidence/schedule-trigger-node15-fix-20260627T050006Z/ (1 file)

---

## Gitignore Effectiveness

| Check | Status |
|-------|--------|
| `.env.local` in `.gitignore` | ✅ Yes |
| `.env.local` not committed | ✅ Yes |
| `.env.example` contains real keys | ❌ No (placeholder only) |

---

## Files Scanned (Read-Only)

| Path | Checked | Secret Found |
|------|:-------:|:------------:|
| README.md | ✅ | ❌ |
| STATUS.md | ✅ | ❌ |
| CHANGELOG.md | ✅ | ❌ |
| GREEN_BASELINE.md | ✅ | ❌ |
| OPERATIONS_RUNBOOK.md | ✅ | ❌ |
| evidence/ | ✅ | 25 FP |
| exports/green/ | ✅ | ❌ |
| scripts/ | ✅ | ❌ |
| .env.example | ✅ | ❌ |
| .gitignore | ✅ | N/A |

---

## 4-Day Secret Hygiene Trend

| Metric | Day 0 | Day 1 | Day 2 | Day 3 |
|--------|:-----:|:-----:|:-----:|:-----:|
| **Status** | FAIL* | FAIL* | FAIL* | FAIL* |
| **Effective** | GREEN | GREEN | GREEN | GREEN |
| **Violations** | 17 | 20 | 24 | 25 |
| **Real Secrets** | 0 | 0 | 0 | 0 |
| **FP Nature** | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER |

> **Note:** Violation count increased across days solely because more evidence documentation was created (each containing the same placeholder string). 0 real secrets across all days.

---

## Assessment

| Check | Status |
|-------|--------|
| Echte Secrets gefunden | ❌ 0 |
| `.env.local` gitignored | ✅ |
| `.env.example` clean | ✅ |
| Secret patterns (ghp_, sk-, etc.) | ❌ None |
| Credential-Werte gelesen | ❌ Nein |
| Status | ✅ **GREEN** |
