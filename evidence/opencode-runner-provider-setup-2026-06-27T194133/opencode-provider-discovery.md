# OpenCode Provider Model Discovery

**Timestamp:** 2026-06-27T19:42:00Z  
**Session:** opencode-runner-provider-setup-2026-06-27T194133  

---

## OpenCode Installation

| Item | Value |
|------|-------|
| Installed | YES |
| Version | v1.17.9 |
| Binary Path | /opt/dev-fabric/opencode/opencode (166,897,792 bytes) |
| Symlink | /usr/local/bin/opencode → /opt/dev-fabric/opencode/opencode |
| Global npm | Not installed via npm (standalone binary) |
| Binary Date | Jun 20 23:07 UTC |

## Provider Configuration Method

OpenCode v1.17.9 uses **two possible methods** for provider configuration:

### Method 1: `opencode providers login` (CLI-based)
```
opencode providers login [url] [--provider <id>] [--method <label>]
```
- Stores credentials in `~/.local/share/opencode/auth.json`
- Interactive or URL-based OAuth/API key flow
- `opencode providers list` shows configured providers

### Method 2: Environment Variables (documented in existing plan)
From the existing `opencode-runner-provider-plan.md`:
```env
OPENCODE_PROVIDER=<provider_name>
OPENCODE_API_KEY=<api_key>
OPENCODE_MODEL=<model_name>
OPENCODE_BASE_URL=<optional_custom_endpoint>
OPENCODE_MAX_TOKENS=<optional_token_limit>
```

### Method 3: `opencode.json` / `opencode.jsonc` config
The `--model` flag shown in `opencode --help`:
```
-m, --model    model to use in the format of provider/model
```
And the `--agent` flag to specify agent type.

## Current Configuration State

| Item | Status |
|------|--------|
| opencode.jsonc (global) | Minimal — only `$schema` entry |
| auth.json | NOT FOUND — no credentials stored |
| Provider list | **0 credentials** |
| OPENCODE_PROVIDER env | NOT SET |
| OPENCODE_API_KEY env | NOT SET |
| OPENCODE_MODEL env | NOT SET |
| .env file in /opt/dev-fabric/ | NOT FOUND |

## Expected Configuration

Based on the existing plan and how the runner script (`start_github_issue_run.sh`) checks for provider readiness:

### Provider Variable Names
| Variable | Required | Description |
|----------|----------|-------------|
| OPENCODE_PROVIDER | YES | Provider identifier (e.g., `deepseek`, `openai`, `anthropic`) |
| OPENCODE_API_KEY | YES | Provider API key |
| OPENCODE_MODEL | YES | Model identifier (e.g., `deepseek-v4-pro`, `gpt-4o`) |
| OPENCODE_BASE_URL | NO | Custom API endpoint (for self-hosted/proxy) |
| OPENCODE_MAX_TOKENS | NO | Token limit override |

### How Runner Script Checks Provider Readiness
The runner script `start_github_issue_run.sh` reads `agent_runtime.opencode_provider_configured` from the input JSON:
```json
{
  "agent_runtime": {
    "opencode_provider_configured": false  // currently always false
  }
}
```
When `false`, the runner falls back to `manual-terminal` mode, regardless of OpenCode being installed.

## Provider Call Feasibility

| Question | Answer |
|----------|--------|
| Is a read-only provider test possible? | YES — `opencode models <provider>` lists available models (read-only) |
| Does the test potentially incur costs? | `opencode models` is likely FREE (metadata query, no inference) |
| Is API key required for model listing? | Probably YES (needs authentication) |
| Can we test without modifying anything? | YES — `opencode --version`, `opencode providers list` are safe |

## Permissions Model

The OpenCode template config (`/opt/dev-fabric/workflows/templates/opencode.json`) shows:
- Shell commands: `ask` for most, `allow` for read-only (git status, ls, cat, pwd)
- `git push*`: `deny`
- `gh pr create*`: `deny`
- `gh workflow run*`: `deny`
- `docker *`: `deny`
- `rm -rf *`: `deny`
- `task`: `deny` for subagents
- `skill`: `deny`

This is a **safe default configuration** that blocks destructive actions.

## Recommendation

Two configuration paths exist:

**Path A (recommended): Environment Variables**
- Create `/opt/dev-fabric/.env` with provider vars
- Runner script already prepared to source `.env`
- Easy to rotate keys
- No OpenCode CLI interaction needed

**Path B: `opencode providers login`**
- Uses OpenCode's native credential store
- May require interactive browser session (not suitable for headless runner)
- Less transparent for key rotation

**Recommended:** Path A (environment variables) combined with a secure loader script.
