# DeepSeek Direct Provider Design

**Timestamp (UTC):** 2026-06-28T08:50:00Z

## Design Decision

### Approach: Custom Provider via opencode.json

Use OpenCode's custom provider mechanism to create `deepseek-direct` as a locally-defined provider using the `@ai-sdk/openai-compatible` package with DeepSeek's OpenAI-compatible API endpoint.

### Rationale
1. **Built-in `deepseek` provider requires interactive `/connect`** — not suitable for headless runner
2. **Custom provider format is documented and stable** — used by Ollama, LM Studio, llama.cpp, etc.
3. **Full control over base URL, models, and options**
4. **Clear separation** from `opencode-go` platform

## Target Configuration

### opencode.json (`/home/runner/.config/opencode/opencode.json`)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "deepseek-direct": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepSeek Direct",
      "options": {
        "baseURL": "https://api.deepseek.com/v1"
      },
      "models": {
        "deepseek-v4-pro": {
          "name": "DeepSeek V4 Pro (thinking)",
          "limit": {
            "context": 131072,
            "output": 32768
          }
        },
        "deepseek-v4-flash": {
          "name": "DeepSeek V4 Flash (fast)",
          "limit": {
            "context": 131072,
            "output": 32768
          }
        }
      }
    }
  },
  "model": "deepseek-direct/deepseek-v4-pro"
}
```

### Environment Variables (via /opt/dev-fabric/secrets/opencode-provider.env)

```env
OPENCODE_PROVIDER=deepseek-direct
OPENCODE_API_KEY=<deepseek_api_key>
OPENCODE_MODEL=deepseek-chat
OPENCODE_BASE_URL=https://api.deepseek.com/v1
OPENCODE_MAX_COST_USD=0.25
OPENCODE_DRY_RUN=true
OPENCODE_ALLOW_PROVIDER_CALL=false
```

### API Key Storage

The `@ai-sdk/openai-compatible` package used by custom providers reads the API key from:
1. Provider-specific env var (e.g., `DEEPSEEK_API_KEY`)
2. Falls back to `OPENAI_API_KEY`

The loader script must export `DEEPSEEK_API_KEY` from the stored `OPENCODE_API_KEY` value, ensuring the custom provider can authenticate.

### Model Naming (Validated via api-docs.deepseek.com)

| Model ID | Display Name | Context | Output | Status |
|----------|-------------|---------|--------|--------|
| `deepseek-v4-pro` | DeepSeek V4 Pro (thinking) | 131K | 8K+ | ✅ Valid — thinking/reasoning model |
| `deepseek-v4-flash` | DeepSeek V4 Flash (chat) | 131K | 8K+ | ✅ Valid — fast chat model |
| `deepseek-chat` | DeepSeek Chat (legacy) | 131K | 8K | ⚠️ Deprecated 2026/07/24 → maps to v4-flash |
| `deepseek-reasoner` | DeepSeek Reasoner (legacy) | 131K | 8K | ⚠️ Deprecated 2026/07/24 → maps to v4-flash thinking |

**Confirmed:** `deepseek-v4-pro` IS a valid direct DeepSeek model name (confirmed via official DeepSeek API docs). The existing model name in the secret file is correct.

**Model Name Status:** ✅ GREEN — validated against official docs.

### DeepSeek API Base URL (Validated)

- **Base URL (OpenAI-compatible):** `https://api.deepseek.com/v1`
- **Validated via:** Official docs show OpenAI SDK uses `base_url="https://api.deepseek.com"`
- **OpenCode custom provider format** requires `/v1` suffix per OpenCode convention — use `https://api.deepseek.com/v1`

### API Key Env Var

- **Standard DeepSeek env var:** `DEEPSEEK_API_KEY` (confirmed by official docs)

## Rules

- `OPENCODE_BASE_URL` = `https://api.deepseek.com/v1` (validated endpoint)
- `OPENCODE_PROVIDER` = `deepseek-direct` (custom provider name)
- `DEEPSEEK_API_KEY` exported by loader (derived from `OPENCODE_API_KEY`)
- Never send DeepSeek key to `opencode-go` endpoint
- No real keys in design documents
