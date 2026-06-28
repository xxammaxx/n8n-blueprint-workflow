# Local OpenCode Credential Export Script — Evidence

## Script Created
- **File**: `scripts/export-local-opencode-credentials.ps1`
- **Timestamp**: 2026-06-28T06:13:54Z

## Script Capabilities
- **-DiscoverOnly**: Discovers credentials from all allowed sources without writing
- **-WriteLocalSecret**: Writes normalized secret file only if GREEN_ALL_PRESENT

## Discovery Result (DiscoverOnly run)
| Field | Value |
|-------|-------|
| Provider present | yes |
| API Key present | yes |
| Model present | yes |
| Sources | file:OPENCODE_PROVIDER, file:OPENCODE_API_KEY, file:OPENCODE_MODEL |
| Status | GREEN_ALL_PRESENT |
| Secret values output | NEVER |

## Sources Checked
1. **Environment variables** (9 checked) — no credentials found
2. **Existing secret file** (`secrets/opencode-provider.env`) — has all three credentials
3. **OpenCode config** (`%USERPROFILE%\.config\opencode`) — has settings (model)
4. **Provider-specific keys** — none found in env; none needed (explicit OPENCODE_PROVIDER present)

## Provider Derivation
- Not needed: OPENCODE_PROVIDER is explicitly set in existing file

## Normalization Logic
- If OPENCODE_PROVIDER, OPENCODE_API_KEY, OPENCODE_MODEL are all present: use directly
- If only provider-specific key (e.g., DEEPSEEK_API_KEY): derive provider from key name
- If multiple provider keys: YELLOW_MULTIPLE_PROVIDER_KEYS_FOUND, manual selection required
- Partial: GREEN_PARTIAL_MODEL_MISSING or GREEN_PARTIAL_CREDENTIAL_NOT_FOUND
- Missing all: RED_NO_CREDENTIALS_FOUND

## Safety Features
- Placeholder detection (prevents writing placeholder values)
- No secret value display
- Target file always includes safety defaults: OPENCODE_MAX_COST_USD=0.25, OPENCODE_DRY_RUN=true, OPENCODE_ALLOW_PROVIDER_CALL=false
- Never writes file unless GREEN_ALL_PRESENT
