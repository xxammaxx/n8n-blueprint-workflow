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

## Network Isolation

- n8n (192.168.1.52:5678) — internal only
- Runner (container 102) — internal only
- Proxmox (192.168.1.136) — management interface
- No DMZ, no public exposure
- MCP servers: internal only, never exposed publicly
