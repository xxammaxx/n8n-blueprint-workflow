# OpenCode Provider Discovery Report

**Timestamp (UTC):** 2026-06-28T08:45:00Z

## OpenCode Version
- **Runner:** 1.17.9 (`/opt/dev-fabric/opencode/opencode`)
- **Local:** 1.15.0

## CLI Discovery Results

### `opencode --help`
- `opencode providers` — manage AI providers and credentials (aliases: `auth`)
- `opencode models [provider]` — list all available models
- Subcommands: `providers list`, `providers login [url]`, `providers logout [provider]`

### `opencode providers --help`
```
Commands:
  opencode providers list               list providers and credentials
  opencode providers login [url]        log in to a provider
  opencode providers logout [provider]  log out from a configured provider
```

### `opencode providers login --help`
```
opencode providers login [url]
  -p, --provider    provider id or name to log in to (skips provider selection)
  -m, --method      login method label (skips method selection)
```

### `opencode models --help`
```
opencode models [provider]
  --verbose    use more verbose model output (includes metadata like costs)
  --refresh    refresh the models cache from models.dev
```

## Current Provider Credentials State

- `opencode providers list`: **0 credentials** — `auth.json` empty
- `~/.config/opencode/`: **Empty** — no `opencode.json` config file
- `~/.local/share/opencode/`: No `auth.json`
- No OPENCODE environment variables set on the runner

## Provider Mechanism Discovery

### Built-in Providers
OpenCode 1.17.9 ships with **75+ built-in LLM providers** via Models.dev. DeepSeek is one of them.

When running `opencode models` (without env vars), models appear under the `opencode` provider (OpenCode Platform default).

**Test Results:**
- `opencode models deepseek` → ❌ "Provider not found: deepseek" (not authenticated yet)
- `opencode providers login --provider deepseek` → Interactive prompt for API key (provider EXISTS but needs auth)

### Custom Provider Configuration
From OpenCode documentation (`https://opencode.ai/docs/providers/`):

Custom providers are configured in `opencode.json`:

```json
{
  "provider": {
    "my-custom-provider": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Display Name",
      "options": {
        "baseURL": "https://api.example.com/v1"
      },
      "models": {
        "model-id": {
          "name": "Model Display Name"
        }
      }
    }
  }
}
```

Key capabilities:
- `npm`: AI SDK package (`@ai-sdk/openai-compatible` for OpenAI-compatible APIs)
- `options.baseURL`: Custom API endpoint
- `options.headers`: Custom HTTP headers
- `models`: Map of model IDs to display configs

### DeepSeek API Endpoint
- **Base URL:** `https://api.deepseek.com/v1` (OpenAI-compatible)
- **Confirmed:** DeepSeek API uses standard OpenAI-compatible `/v1/chat/completions` format
- **Model names:** `deepseek-chat` (V3/V4 series), `deepseek-reasoner` (R1 series)
- **API key format:** `sk-` prefix (our key matches this format)

## OpenCode Env Var Discovery

From binary analysis (`strings /opt/dev-fabric/opencode/opencode`):
- OpenCode uses the `@ai-sdk/openai-compatible` package internally
- `new OpenAI({ apiKey, dangerouslyAllowBrowser: true })` pattern
- Supports `OPENAI_API_KEY` env var (for OpenAI SDK)
- Custom provider API keys via `auth.json`

Provider-specific env vars documented for built-in providers:
- `NVIDIA_API_KEY`, `DIGITALOCEAN_ACCESS_TOKEN`, `GITLAB_TOKEN`, etc.
- DeepSeek env var: Not specifically documented, but `DEEPSEEK_API_KEY` is the standard convention

## Configuration Approach Decision

For the headless runner (no TUI/`/connect` available), the viable approaches are:

### Approach A: Custom Provider via opencode.json (RECOMMENDED)
Create `/home/runner/.config/opencode/opencode.json` with DeepSeek as custom provider using `@ai-sdk/openai-compatible`. API key via `DEEPSEEK_API_KEY` env var.

### Approach B: Built-in DeepSeek Provider via auth.json
Manually create `~/.local/share/opencode/auth.json` with DeepSeek credentials. Risk: format may change between versions.

### Approach C: Use OPENAI_API_KEY with DeepSeek base URL
Set `OPENAI_API_KEY` and `OPENAI_BASE_URL` for OpenAI SDK compatibility. Risk: conflicts with other providers.

**Selected: Approach A** — Custom provider offers full control, documented format, and clear separation from opencode-go.

## Status
- ✅ Discovery complete
- ✅ DeepSeek API endpoint validated: `https://api.deepseek.com/v1`
- 🟡 Model names must be validated (not guessed)
- 🟡 `deepseek-v4-pro` may not be a valid direct DeepSeek model name
