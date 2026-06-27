# Workflow Green Export

**Date/Time UTC:** `2026-06-27T13:17:37Z`
**Session:** post-green-stabilization

---

## Export Summary

| Field | Value |
|-------|-------|
| Export created | ✅ YES |
| Workflow ID | `Sv12QTo56NoPUu2D` |
| Workflow Name | `GitHub Ready Issue → Runner Agent Dispatch` |
| Node Count | 18 |
| Active / Published | ✅ Yes |
| Source | `evidence/final-green-canary-issue-6-20260627T073906Z/workflow-fixed.json` |
| Export path | `exports/green/dispatcher-green-20260627T131737Z.json` |
| File size | 131,177 bytes |
| SHA256 | `E002E97F1C24F3BC679DB0993194E254FFBF0895FFDEB188843663AC91949E9A` |
| Secret scan | ✅ CLEAN — no API keys, tokens, passwords found |
| Credential values exposed | ❌ No — only n8n internal credential IDs (type references) |
| Node types | Manual Trigger, HTTP Request (GitHub APIs), Code (Guardrails), Code (Format Final Result), SSH (Runner), etc. |

---

## Secret Scan Details

| Pattern | Match | Status |
|---------|-------|--------|
| `ghp_` (GitHub PAT classic) | No match | ✅ |
| `github_pat_` (GitHub PAT fine-grained) | No match | ✅ |
| `gho_` / `ghu_` / `ghs_` / `ghr_` (OAuth tokens) | No match | ✅ |
| JWT tokens (`eyJ`) | No match | ✅ |
| OpenAI/GitHub API keys (`sk-`) | No match | ✅ |
| Embedded passwords | No match | ✅ |
| Private key headers (`-----BEGIN`) | No match | ✅ |
| Bearer tokens | No match | ✅ |

---

## Credential References (non-secret metadata)

The workflow references these n8n internal credentials:
- `GitHub account` (id: `M5hvZu2nCwFcHBYX`) — GitHub API authentication
- Any SSH credentials — referenced by n8n internal IDs only

These are **n8n internal identifiers** (not actual GitHub tokens, SSH keys, or passwords). The actual credential values are stored encrypted in n8n's database and are **NOT present** in this export.

---

## Verification

- ✅ File exists in `exports/green/`
- ✅ SHA256 generated and consistent
- ✅ Secret scan passed: 0 findings
- ✅ No actual credential values in export
- ✅ Workflow structure verified (18 nodes, correct IDs)
- ✅ Active/Published status confirmed
