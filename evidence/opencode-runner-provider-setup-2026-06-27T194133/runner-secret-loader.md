# Runner Secret Loader

**Timestamp:** 2026-06-27T19:52:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  

---

## Loader Script

| Item | Value |
|------|-------|
| Path | `/opt/dev-fabric/bin/load-opencode-provider-env.sh` |
| Permissions | `-rwxr-xr-x` (755) |
| Owner | runner:runner |
| Syntax valid | YES (bash -n passed) |

## Functionality

The loader script:
1. Checks if `/opt/dev-fabric/secrets/opencode-provider.env` exists
2. Sources the file safely (`set -a; source; set +a`)
3. Validates each variable against placeholder patterns
4. Reports status for each variable: `loaded` or `placeholder (value not configured)`
5. Reports `SECRET_STATUS: api_key_present=true/false`
6. NEVER outputs actual secret values

## Test Results

```
OPENCODE_DRY_RUN: loaded
OPENCODE_MAX_COST_USD: loaded
OPENCODE_PROVIDER: placeholder (value not configured)
OPENCODE_API_KEY: placeholder (value not configured)
OPENCODE_MODEL: placeholder (value not configured)
SECRET_STATUS: api_key_present=false
```

Exit code: 2 (PLACEHOLDER_DETECTED) — expected with placeholder values.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All variables loaded with real values |
| 1 | Secret file missing |
| 2 | Placeholder values detected (not yet configured) |
| 3 | Empty/missing values |

## Placeholder Detection

The loader detects these patterns as placeholders:
- `PASTE_*` (e.g., `PASTE_PROVIDER_NAME_HERE`)
- `PLACEHOLDER*`
- `YOUR_*`
- `<*` (angle bracket templates)
- Empty/blank values

## Security

- Secret values are NEVER echoed or displayed
- Only boolean status: `loaded` vs `placeholder`
- API key presence reported only as `true/false`
- No secret content in any output
