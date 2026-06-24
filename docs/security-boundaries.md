# Security Boundaries — Blueprint Bootstrap Workflow

## Trust Zones

```
Zone 0: User Browser (untrusted)
  ↓ HTTP (internal network only)
Zone 1: n8n Instance (LXC 101)
  ↓ SSH (key-based auth)
Zone 2: Runner (LXC 102)
  ↓ Filesystem
Zone 3: Evidence / Workspace (read-only for n8n)
```

## Credential Flow

```
[dev-runner-ssh credential]
  stored in n8n credential store (encrypted)
       ↓ n8n credential reference
  SSH Node (never exposes key)
       ↓ SSH protocol
  Runner (accepts key-based auth)
```

### NEVER:
- Hardcode private key in workflow JSON
- Export decrypted credential
- Log SSH output containing keys
- Expose port 22 to public internet

## SSH Node Expression Mode Security

### Expression Mode Prevents Secret Leakage
All SSH nodes in the GitHub Issue Intake workflow **MUST** use **Expression Mode** (fx toggle) instead of Fixed Mode. This has security implications:

| Aspect | Fixed Mode (INSECURE) | Expression Mode (SECURE) |
|--------|----------------------|--------------------------|
| `{{ }}` resolution | NOT resolved — literal string | ✅ Resolved at runtime |
| Secrets in node config | Could contain hardcoded paths/keys | ✅ References n8n credential store |
| Audit trail | Opaque — no way to verify what was executed | ✅ n8n logs the resolved expression |
| Credential exposure | Higher risk if node config is exported | ✅ Credentials stay in n8n encrypted store |

### storageState Security (2026-06-24)
- storageState stored OUTSIDE repo: `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json`
- storageState NEVER in repo, logs, evidence, or screenshots
- `.gitignore` includes: `n8n-api-key*`, `.n8n-automation/`
- storageState contains authentication cookies — treat as sensitive credential

### Expression Mode Security
- Expression mode is REQUIRED for SSH nodes with template variables
- In Fixed mode, template literals pass through to bash unexpanded — NOT a security issue but a correctness issue
- However, Fixed mode can cause subtle failures (silent data corruption, wrong paths) that appear as green nodes

### Credential References via n8n Store Only
- SSH credentials (`dev-runner-ssh`) are stored exclusively in n8n's encrypted credential store
- Workflow JSON files reference credentials **by ID only** — never by private key content
- Node configurations use `{{ }}` expressions to reference node outputs, not hardcoded values
- SSH commands use `$json.run_input_remote` and `$json.run_input_b64` — no hardcoded paths in node config

### Cross-Node Data Reference Security

**`$json` is overwritten by API calls — use explicit references instead.**

When an HTTP Request node executes an API call, its output replaces `$json` with the API response. This has security implications:

| Aspect | `$json.field` (UNSAFE after API) | `$('Node').first().json.field` (SAFE) |
|--------|----------------------------------|---------------------------------------|
| Data provenance | Implicit — depends on last node executed | Explicit — always references the named node |
| After API calls | Contains API response, NOT upstream data | ✅ Stable — always returns the requested node's output |
| Debugging | Hard to trace where data comes from | ✅ Clear audit trail |
| Risk | Silent data corruption — wrong paths/URLs | ✅ Predictable behavior |

**Rule:** Any node after an HTTP Request (API call) MUST use explicit cross-node references to access upstream data. Do NOT rely on `$json` — it will contain the API response.

**Affected nodes in the workflow:**
- Node 11 (Add Labels): Uses `$('Prepare RUN_INPUT.json').first().json.*` (FIXED)
- Node 12 (Remove Label): Uses `$('Prepare RUN_INPUT.json').first().json.*` (FIXED)
- Node 5/7 (SSH nodes): Use `$('Prepare RUN_INPUT.json').first().json.*` (FIXED in previous session)

### Best Practices
1. Always use Expression Mode for SSH node commands (fx toggle in n8n UI)
2. Never hardcode file paths or IP addresses in SSH commands — use node references
3. Never store private keys, passwords, or tokens in workflow JSON
4. Verify SSH credential references are correct in n8n credential store before export
5. Use `set +e` in commands to handle errors gracefully without leaking stack traces
6. After any API call, use `$('Node Name').first().json.field` instead of `$json.field`

## Input Validation Boundaries

| Boundary | Validation |
|----------|------------|
| Form → n8n | n8n built-in validation |
| Code Node | project_slug regex, file type check |
| SSH → Runner | Filesystem path sanitization |
| Runner → Script | Template variable escaping |

## OpenCode Security Profile

| Permission | Policy | Rationale |
|-----------|--------|-----------|
| `*` (default) | ask | No silent operations |
| read, grep, glob | allow | Read-only inspection safe |
| edit | ask | File modifications require approval |
| git push* | deny | No remote writes |
| gh pr create* | deny | No pull requests |
| gh workflow run* | deny | No CI/CD triggers |
| rm -rf * | deny | No destructive operations |
| docker * | deny | No container manipulation |
| webfetch/websearch | ask | External access needs approval |
| task/skill | deny | No subagent delegation |
| external_directory | deny | No filesystem escape |

### OpenCode Safe Defaults
- `share`: disabled (no remote sharing)
- `autoupdate`: false (no automatic updates)
- `mcp`: {} (no MCP servers configured)
- `--yolo`: never (approval always required)
- Provider/Auth: explicitly NOT configured (requires separate approval)

## GitHub API Security Boundaries

### Token Requirements
- **Scopes needed:** `repo` (Issues read/write, Contents read), `read:org` (optional)
- **Scopes NOT needed:** `workflow`, `admin:*`, `secrets`, `packages`
- **Credential:** Stored in n8n credential store (encrypted), referenced by name
- **Credential Name:** `github-n8n-blueprint`
- **Token Storage:** NEVER in repo, logs, evidence, or screenshots

### Credential Verification Rules
- Check credential EXISTS in n8n credential store: ✅ Allowed
- Check Connection Test result: ✅ Allowed
- View token value: ❌ PROHIBITED
- Copy/Export token: ❌ PROHIBITED
- Log token anywhere: ❌ PROHIBITED
- Include in screenshots: ❌ PROHIBITED

### Node-Level Security
- HTTP Request Nodes use **Predefined Credential Type** → `githubApi`
- NEVER hardcode tokens in URL, headers, or body
- NEVER use `Authorization: token ...` header manually
- Always reference credential by n8n credential store

### Operations Allowed via GitHub API
| Operation | Allowed | Gate |
|-----------|---------|------|
| Read Issue | ✅ | Automatic |
| Read Labels | ✅ | Automatic |
| Set/Remove Labels | ✅ | Workflow logic |
| Create Comment | ✅ | After evidence written |
| Read Repo Contents | ✅ | For context |
| **Push code** | ❌ | Requires separate approval |
| **Create PR** | ❌ | Requires separate approval |
| **Merge PR** | ❌ | Requires separate approval |
| **Trigger Actions** | ❌ | Prohibited |
| **Modify Secrets** | ❌ | Prohibited |

## MCP Security Boundaries

### n8n Instance-Level MCP

| Permission | Policy | Rationale |
|-----------|--------|-----------|
| MCP globally enabled | ❌ NO | Must be explicitly enabled by user in Settings |
| Production workflows exposed | ❌ NO | Only dedicated `mcp-smoke-test` workflow |
| MCP auth token in repo | ❌ NEVER | Placeholder only in example config |
| Edit/Build via MCP | ❌ BLOCKED | Read-only + execute on smoke test only |
| Community MCP install | ❌ BLOCKED | Only official n8n MCP |

### Chrome DevTools MCP Security

| Rule | Status |
|------|--------|
| Isolated Chrome profile | `--isolated` flag (temp user-data-dir) |
| No private profiles | Dedicated profile only |
| No cookies read | Enforced |
| No auth tokens read | Enforced |
| Headless mode available | `--headless` for CI |

### Playwright Security

| Rule | Status |
|------|--------|
| No credentials in test code | Enforced |
| LOGIN_REQUIRED abort | Graceful halt, no credential bypass |
| Storage state ignored | `.gitignore` blocks |
| Screenshot redaction | No secrets in visible paths |

### BrowserMCP Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Full Chrome profile access | HIGH | NOT installed — evaluated only |
| Extension permission scope | HIGH | Would need strict content script limits |
| Auth session exposure | CRITICAL | Would expose n8n session cookies/tokens |
| Recommendation | — | Optional fallback only, not primary path |

## MCP Client Configuration

Template: `templates/mcp-client-config.example.json`

**Rules:**
- Never store real MCP tokens in the repo
- Use environment variables or secure vaults for auth
- Scope n8n MCP to dedicated test workflow only
- Never expose MCP server to public internet
- Never enable edit tools on production workflows

## Audit Trail

See `evidence-index/` for known evidence paths and `evidence-index/latest.md` for current session report.

## Dispatcher Workflow Security

### Trigger Security (Polling vs Webhook)

| Aspect | GitHub Trigger (Webhook) | Polling (Schedule + Search API) |
|--------|------------------------|---------------------------------|
| Network exposure | Requires public URL | ✅ Internal-only — outbound only |
| Webhook secret | Needs HMAC validation | ✅ Not applicable — no incoming payload |
| Authentication | Webhook secret + IP allowlist | ✅ GitHub API token authentication |
| Spam protection | GitHub validates HMAC | ✅ Polling query is read-only |
| **Selected** | ❌ Not viable (internal network) | ✅ **Selected** for dispatcher |

The dispatcher workflow (`k1c2d3FfWHee6Jr0e`) uses Polling (Schedule Trigger + GitHub Search API) because the n8n instance has no public URL. This is **more secure** than webhooks — no incoming connections, no payload validation needed.

### Guardrail Security

The dispatcher validates these checks before any runner execution:

| Guardrail | Security Purpose |
|-----------|-----------------|
| Issue MUST be open | Prevents execution on closed/resolved issues |
| `agent:ready` MUST be present | Only dispatches explicitly marked tasks |
| `agent:running` MUST NOT be present | Anti-double-start — prevents concurrent runs on same issue |
| `agent:blocked` MUST NOT be present | Respects block state — prevents overriding manual blocks |
| `agent:done` MUST NOT be present | Respects completion state |
| Repository check | Scope-limited to `xxammaxx/n8n-blueprint-workflow` |

### Label Transition Security

Label changes follow strict ordering to prevent race conditions:

1. Remove `agent:ready` FIRST (prevents double-pickup on next poll)
2. Add `agent:running` SECOND (declares active run)
3. On completion: remove `agent:running`, add result labels

If label API calls fail mid-transition, the workflow enters a partial state. The next poll cycle will detect `agent:running` and skip (anti-double-start protection acts as circuit breaker).

### Run ID Idempotency

Each run has a unique Run ID (`gh-issue-<number>-<timestamp>`). Evidence paths are unique per run. This prevents:
- Evidence overwrite from concurrent or re-runs
- Run ID collision between dispatcher and manual intake workflows
- Ambiguous evidence ownership

### Polling Credential Safety

The Polling approach uses the existing `githubApi` credential in n8n:
- Read-only operations: GitHub Search API, Issue GET, Label GET
- Write operations: Label updates, Issue comments (same as manual workflow)
- No additional credentials needed
- Credential stored in n8n encrypted store only

## Network Isolation

- n8n (192.168.1.52:5678) — internal only
- Runner (container 102) — internal only
- Proxmox (192.168.1.136) — management interface
- No DMZ, no public exposure
- MCP servers: internal only, never exposed publicly
