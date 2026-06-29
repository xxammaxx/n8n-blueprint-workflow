# Static Validation Report

**Timestamp (UTC):** 2026-06-29T05:36:00Z

## Validation Results

### JSON Syntax
| Check | Result |
|-------|--------|
| JSON valid | ✅ YES |
| Node count | ✅ 18 |
| Workflow name | ✅ "GitHub Ready Issue → Runner Agent Dispatch" |

### Node 11 — Format Evidence Comment Code
| Check | Result |
|-------|--------|
| Parses status.json from SSH stdout | ✅ PASS |
| Extracts `status` from parsed data | ✅ PASS |
| Extracts `effective_mode` | ✅ PASS |
| Extracts `opencode_provider_configured` | ✅ PASS |
| Extracts `provider` field | ✅ PASS |
| Extracts `model` field | ✅ PASS |
| Extracts `opencode_version` | ✅ PASS |
| Has fallback chain (status.json → prepData → hardcoded) | ✅ PASS |
| Labels evidence source | ✅ PASS |
| Has safety section (no secrets, no auto-merge, no actions) | ✅ PASS |
| No API keys in code | ✅ PASS |
| No passwords in code | ✅ PASS |
| No hardcoded secrets | ✅ PASS |

### Node 15 — Format Final Result Code
| Check | Result |
|-------|--------|
| Uses evidenceFormat data instead of hardcoded | ✅ PASS |
| dispatch_mode from evidenceFormat | ✅ PASS |
| status from evidenceFormat | ✅ PASS |

### Structural Integrity
| Check | Result |
|-------|--------|
| Trigger unchanged (Manual + Schedule) | ✅ PASS |
| Schedule unchanged (15 min) | ✅ PASS |
| Credentials unchanged (10 matching) | ✅ PASS |
| Guardrails unchanged | ✅ PASS |
| Issue selection unchanged | ✅ PASS |
| Runner start logic unchanged | ✅ PASS |
| Node count unchanged (18 → 18) | ✅ PASS |
| Active status maintained (true → true) | ✅ PASS |

### Secret Hygiene in Patch
| Check | Result |
|-------|--------|
| No API keys in exported JSON | ✅ PASS |
| No passwords in exported JSON | ✅ PASS |
| No credentials exposed | ✅ PASS |
| Only credential metadata (IDs, names) | ✅ PASS |

## Summary

**17/17 structural checks PASS**  
**1 false negative resolved** (regex check for `status.status` didn't account for `statusData` variable name — actual code uses `statusData.status` correctly)

**Status:** ✅ STATIC_VALIDATION_GREEN
