# Provider Error Analysis — opencode-go vs Direct DeepSeek

**Timestamp (UTC):** 2026-06-28T08:40:00Z

## Last Smoke Test Findings

The last provider smoke test produced:

| Stage | Result |
|-------|--------|
| Stage 1 — Version | ✅ 1.17.9 |
| Stage 2 — Secret Loader | ✅ All 5 variables loaded |
| Stage 3 — Provider Config | ✅ `opencode-go` / `deepseek-v4-pro` |
| Stage 4 — Model List | ✅ 13 models, `deepseek-v4-pro` available |
| Stage 5 — Hello Test | ❌ `Invalid API key` |

## Root Cause Analysis

### Technical Working Hypothesis

The API key stored in `/opt/dev-fabric/secrets/opencode-provider.env` is a **direct DeepSeek API key** (`sk-` prefix, format matches DeepSeek API keys from [platform.deepseek.com](https://platform.deepseek.com)).

This key was being validated against the **OpenCode Platform** (`opencode-go` provider), which expects OpenCode Platform API keys (from [opencode.ai/auth](https://opencode.ai/auth)).

### Why Stage 4 Worked But Stage 5 Failed

- **Stage 4 (Model List):** `opencode models` without auth — OpenCode 1.17.9 listed models from cache/models.dev without needing valid credentials for the listing itself.
- **Stage 5 (Hello Test):** `opencode hello --provider opencode-go` — Sent the DeepSeek API key to OpenCode Platform's authentication endpoint, which rejected it as `Invalid API key`.

### Provider Architecture

| Provider | Key Type | Key Source | Endpoint |
|----------|----------|------------|----------|
| `opencode-go` | OpenCode Platform Key | opencode.ai/auth | opencode.ai/zen/v1 |
| `opencode` (Zen) | OpenCode Platform Key | opencode.ai/auth | opencode.ai/zen/v1 |
| DeepSeek (built-in) | DeepSeek API Key | platform.deepseek.com | api.deepseek.com/v1 |
| DeepSeek (custom) | DeepSeek API Key | platform.deepseek.com | api.deepseek.com/v1 |

## Decision

**DO NOT use `opencode-go` or `opencode` provider with a direct DeepSeek API key.**

The correct approach is:
1. Use the built-in `deepseek` provider (available in OpenCode 1.17.9)
2. OR create a custom `deepseek-direct` provider via `opencode.json` config using `@ai-sdk/openai-compatible` with base URL `https://api.deepseek.com/v1`

## Target

- **Desired path:** Direct DeepSeek provider configuration
- **Key usage:** Existing DeepSeek API key used exclusively against DeepSeek's API endpoints
- **Never:** Route the DeepSeek key through `opencode-go` proxy
