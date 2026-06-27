# Secret Hygiene — Playwright MCP Check

**Date/Time UTC:** `2026-06-27T11:31Z`
**Script:** `scripts/validate-secret-hygiene.mjs`
**Mode:** READ-ONLY

---

## 1. Result

**Secret Hygiene:** ❌ `4 VERSTÖSSE`
**Classification:** `YELLOW (false-positives only)`

---

## 2. Violations Found

All 4 violations are the SAME placeholder string in evidence files:

| # | File | Found |
|---|------|-------|
| 1 | `evidence/post-green-stabilization-20260627T131737Z/final-report.md` | `PASTE_YOUR_N8N_API_KEY_HERE` |
| 2 | `evidence/post-green-stabilization-20260627T131737Z/secret-hygiene-report.md` | `PASTE_YOUR_N8N_API_KEY_HERE` |
| 3 | `evidence/post-green-stabilization-20260627T131737Z/validation-report.md` | `PASTE_YOUR_N8N_API_KEY_HERE` |
| 4 | `evidence/schedule-trigger-node15-fix-20260627T050006Z/preflight.md` | `PASTE_YOUR_N8N_API_KEY_HERE` |

---

## 3. Analysis

### Are these real secrets? **NO.**
These are all documentation/template placeholder strings, not actual API keys. The script is designed to catch ANY placeholder string outside of `.env.example` — this is a strict but safe default.

### Evidence
- No real API keys found in any file
- `.env.local` has its real key properly protected by `.gitignore` (confirmed by gitignore check: ✅)
- No secrets found in `README.md`, workflow JSON, or evidence files
- No GitHub tokens, SSH keys, or passwords found

---

## 4. Other Checks (All Passed)

| Check | Result |
|-------|--------|
| `.gitignore` protects `.env.local` | ✅ |
| `.env.example` has placeholder only | ✅ |
| `.env.local` exists, API key set | ✅ (key NOT output) |
| `README.md` no real keys | ✅ |
| Evidence files no real secrets | ✅ |
| Workflow JSON no secrets | ✅ |

---

## 5. Recommendation

**No action required.** The 4 findings are documentation placeholders, not operational secrets. They exist in evidence files that document setup procedures. The hygiene script is correctly strict, but the violations are false-positives for operational security purposes.

If desired, the placeholder strings could be removed from evidence files in a separate cleanup session, but this is cosmetic and does not affect system security.
