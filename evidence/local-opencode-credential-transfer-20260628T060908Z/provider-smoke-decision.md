# Provider Smoke Decision — Evidence

## Decision
**BLOCKED** — Provider smoke test CANNOT proceed.

## Decision Criteria Evaluation

| Criterion | Required | Actual | Met? |
|-----------|----------|--------|------|
| Local OpenCode credentials uniquely found | yes | no (all placeholders) | ❌ |
| Normalized local secret file written | yes | yes (but contains placeholders) | ❌ |
| File copied to runner | yes | no (blocked by placeholder detection) | ❌ |
| Remote Loader successful | yes | not applicable | ❌ |
| OpenCode present on runner | yes | yes (v1.17.9) | ✅ |
| Secret Hygiene green | yes | yes | ✅ |
| OPENCODE_ALLOW_PROVIDER_CALL=true | required | false (set by safety defaults) | ❌ |
| Cost limit set | yes | yes (0.25 USD) | ✅ |

## Final Status
**GREEN_PARTIAL_CREDENTIAL_NOT_FOUND** — No real OpenCode credentials available locally. Provider smoke test is blocked.

## Required Action
Real OpenCode credentials must be provided before provider smoke test can proceed:
1. Set real values in `C:\Spec-kit_n8n\secrets\opencode-provider.env` (replace PASTE_* placeholders)
2. Re-run `export-local-opencode-credentials.ps1 -WriteLocalSecret`
3. Re-run `copy-opencode-provider-credentials.ps1`
4. Set `OPENCODE_ALLOW_PROVIDER_CALL=true` when ready for testing
