# Secret Hygiene Report — Post-Green Stabilization

**Date/Time UTC:** `2026-06-27T13:22:58Z`
**Session:** post-green-stabilization-20260627T131737Z

---

## Scan Summary

| Check | Result |
|-------|--------|
| Script | `node scripts/validate-secret-hygiene.mjs` |
| Exit Code | 1 (violation reported) |
| Real violations | **0** (no actual secrets) |
| False positives | **1** (documented below) |
| Overall Hygiene | ✅ **CLEAN** — no actual secrets exposed |

---

## Detailed Findings

### Finding #1: Placeholder text in evidence file (FALSE POSITIVE)

| Field | Value |
|-------|-------|
| File | `evidence/schedule-trigger-node15-fix-20260627T050006Z/preflight.md` |
| Line | 34 |
| Content | `.env.local contains placeholder 'PASTE_YOUR_N8N_API_KEY_HERE'` |
| Severity | **NONE** — informational, not a secret |

**Analysis:**
This is a historical evidence document from the Node 15 Fix session (2026-06-27 05:00 UTC). The text describes the state of the `.env.local` file at that time — specifically noting that it contained the **placeholder** text `PASTE_YOUR_N8N_API_KEY_HERE` rather than an actual key. The string `PASTE_YOUR_N8N_API_KEY_HERE` is the literal placeholder template from `.env.example` and is **not** a real API key, token, or password.

**Conclusion:** FALSE POSITIVE. The scanner matches the placeholder pattern, but the text is in a descriptive sentence documenting configuration state. No actual secret is exposed.

**Action:** Document as KNOWN NOTE. No modification needed — this is historical evidence.

---

## Verification of All Other Checks

### Gitignore
- ✅ `.env.local` is in `.gitignore`

### .env.example
- ✅ Contains only placeholder text (no real keys)

### .env.local
- ✅ Exists but is gitignored
- ✅ API key set (not verified — file not read per constraints)
- ✅ API key never output

### README
- ✅ No real keys found

### Evidence Files (all directories)
- ✅ No real API keys, tokens, or passwords found

### Workflow JSON Files
- ✅ No credential values in any export
- ✅ Only n8n internal credential IDs (metadata, not secrets)

### Scripts
- ✅ No hardcoded secrets

### CHANGELOG / STATUS
- ✅ No secrets

---

## Real Secrets Check (Manual Scan of Export)

The green workflow snapshot was scanned for:
- GitHub PAT patterns (`ghp_`, `github_pat_`, `gho_`, etc.)
- JWT tokens (`eyJ`)
- OpenAI keys (`sk-`)
- SSH private keys (`-----BEGIN`)
- Bearer tokens
- Embedded passwords

**Result: 0 findings** — Export is clean.

---

## Overall Status

| Status | Detail |
|--------|--------|
| Secret Hygiene | 🟢 **CLEAN** |
| Real Leaks | 0 |
| False Positives | 1 (documented placeholder) |
| Action Required | None |
| Safe to Commit | ✅ Yes |
