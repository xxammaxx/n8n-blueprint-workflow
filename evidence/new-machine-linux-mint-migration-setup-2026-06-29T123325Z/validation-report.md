# Validation Report — New Machine Migration

**Date/Time (UTC):** 2026-06-29T12:37:00Z
**Session:** new-machine-linux-mint-migration-setup-2026-06-29T123325Z

## Validation Checklist

### Repository

| # | Check | Result |
|---|-------|--------|
| 1 | Repo cloned | ✅ PASS |
| 2 | Branch is master | ✅ PASS |
| 3 | Remote correct | ✅ PASS |
| 4 | Working tree clean | ✅ PASS |
| 5 | Latest commit is operational state | ✅ PASS |

### Secret Hygiene

| # | Check | Result |
|---|-------|--------|
| 6 | No secrets/ tracked | ✅ PASS |
| 7 | No .env.local tracked | ✅ PASS |
| 8 | No DB/backup files tracked | ✅ PASS |
| 9 | .playwright-mcp/ tracked | ⚠️ KNOWN (token revoked) |
| 10 | No new JWT/token leaks | ✅ PASS |
| 11 | Secret values NOT output | ✅ PASS |

### Local Secrets

| # | Check | Result |
|---|-------|--------|
| 12 | secrets/ directory exists | ✅ PASS |
| 13 | secrets/ has 700 permissions | ✅ PASS |
| 14 | Template file created | ✅ PASS |
| 15 | Template is gitignored | ✅ PASS |
| 16 | No real values in template | ✅ PASS |

### Infrastructure

| # | Check | Result |
|---|-------|--------|
| 17 | n8n reachable (healthz) | ✅ PASS |
| 18 | n8n UI serving | ✅ PASS |
| 19 | Runner network reachable | ✅ PASS |
| 20 | Runner SSH configured | ⚠️ KEY_REQUIRED |

### Playwright

| # | Check | Result |
|---|-------|--------|
| 21 | Old artifacts NOT copied from old machine | ✅ PASS |
| 22 | Old artifacts NOT used on new machine | ✅ PASS |
| 23 | Policy documented | ✅ PASS |

### Runtime Integrity

| # | Check | Result |
|---|-------|--------|
| 24 | No runtime changes | ✅ PASS |
| 25 | No workflow changes | ✅ PASS |
| 26 | No SQLite changes | ✅ PASS |
| 27 | No runner changes | ✅ PASS |
| 28 | No issues modified | ✅ PASS |
| 29 | No GitHub Actions triggered | ✅ PASS |
| 30 | No auto-merge | ✅ PASS |

## Summary

| Category | Pass | Warn | Fail |
|----------|------|------|------|
| Repository | 5 | 0 | 0 |
| Secret Hygiene | 5 | 1 | 0 |
| Local Secrets | 5 | 0 | 0 |
| Infrastructure | 3 | 1 | 0 |
| Playwright | 3 | 0 | 0 |
| Runtime Integrity | 7 | 0 | 0 |
| **Total** | **28** | **2** | **0** |

## Warnings

1. `.playwright-mcp/` files with revoked tokens in git history — known, documented, history rewrite pending
2. Runner SSH key not configured on new machine — user must set up

## Status

**VALIDATION_PASSED_WITH_NOTES** — 28 of 30 checks passed. 2 warnings are known pre-existing conditions requiring user action.
