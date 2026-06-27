# OpenCode Runner Provider/API-Key Plan

**Timestamp:** 2026-06-27T14:09:31Z
**Session:** post-success-operations-hardening-20260627T140931Z

---

## 1. Purpose

Document what the Runner needs to execute real OpenCode agent tasks (beyond `manual-terminal` mode), configure provider credentials securely, and test without risk.

---

## 2. Current Runner State

| Aspect | Status |
|--------|--------|
| Runner Host | lxc-dev-runner / 192.168.1.53 |
| OpenCode installed | ✅ v1.17.9 |
| `manual-terminal` mode | ✅ Working (approval-based, no automated actions) |
| Provider/API-Key configured | ❌ Missing |
| Can execute code changes | ❌ No (model unavailable without API key) |
| Can only report status | ✅ Yes (reads issues, posts structured comments) |

The Runner currently operates in `manual-terminal` mode — it reads issues, validates inputs, and posts structured status comments, but cannot run actual AI agents that implement code.

---

## 3. Required Configuration

### Provider Variables (Placeholders Only)

```env
# OpenCode Provider Configuration (Runner LXC)
OPENCODE_PROVIDER=deepseek
OPENCODE_API_KEY=<YOUR_API_KEY_HERE>
OPENCODE_MODEL=deepseek-v4-pro
```

| Variable | Description | Example Values |
|----------|------------|----------------|
| `OPENCODE_PROVIDER` | AI provider name | `deepseek`, `openai`, `anthropic`, `openrouter` |
| `OPENCODE_API_KEY` | Provider API key | Provider-specific format |
| `OPENCODE_MODEL` | Model identifier | `deepseek-v4-pro`, `gpt-4o`, `claude-sonnet-4-20250514` |
| `OPENCODE_BASE_URL` | (Optional) Custom API endpoint | For self-hosted or proxy |
| `OPENCODE_MAX_TOKENS` | (Optional) Token limit | `4096`, `8192` |

---

## 4. Where Configuration Lives

| Location | Purpose | Committed? |
|----------|---------|------------|
| **Runner LXC `.env`** | Environment for OpenCode runner process | ❌ No (local only) |
| **n8n Credential** | SSH credential for runner commands | ❌ No (n8n credential store) |
| **Local `C:\Spec-kit_n8n\.env.local`** | Reference only (not pushed to runner) | ❌ No (gitignored) |
| **Evidence directory** | NEVER | ❌ NEVER |
| **Git repository** | NEVER | ❌ NEVER |
| **n8n Workflow JSON** | NEVER | ❌ NEVER |

---

## 5. Security Architecture

```
┌──────────────────────────────────────────────────┐
│  Workstation (AQcer)                              │
│                                                   │
│  .env.local  ← Provider config (reference only)   │
│       │ NOT transmitted to runner                 │
│       │ (runner has its own .env)                 │
└───────┼──────────────────────────────────────────┘
        │
        │ SSH (n8n SSH node)
        ▼
┌──────────────────────────────────────────────────┐
│  Runner LXC (192.168.1.53)                        │
│                                                   │
│  /opt/dev-fabric/.env                             │
│  ├── OPENCODE_PROVIDER=<provider>                 │
│  ├── OPENCODE_API_KEY=<key>                       │
│  └── OPENCODE_MODEL=<model>                       │
│                                                   │
│  /opt/dev-fabric/scripts/                         │
│  └── github-agent-workflow.sh                     │
│      reads .env, runs opencode agent              │
└──────────────────────────────────────────────────┘
```

**Key principle:** The API key never leaves the Runner LXC. It is never transmitted via SSH, never stored in n8n, never in GitHub, never in evidence.

---

## 6. Test Strategy (No Production Risk)

### Phase 1: Provider Connectivity (Read-Only)
```bash
# On Runner LXC
source /opt/dev-fabric/.env
opencode --version
opencode --list-models 2>&1 | head -5
```
- **Verifies:** API key works, models available
- **Risk:** Zero (read-only)

### Phase 2: Dummy Canary (No Production Issue)
```bash
# Create a temporary canary issue in a test repo or use a /dev/null target
echo '{"issue_number": 999, "title": "TEST: provider connectivity"}' > /tmp/test-run-input.json
# Run opencode in dry-run/validate mode
opencode agent --dry-run --input /tmp/test-run-input.json
```
- **Verifies:** Agent can receive input and process
- **Risk:** Zero (dry-run, no real issue, no git push)

### Phase 3: Controlled Canary (User-Authorized)
- Create a dedicated canary issue (e.g., #9) with `agent:ready` + `test:canary-provider`
- Run with `manual-terminal` mode still enabled
- Verify agent can:
  - Read issue
  - Write a comment with analysis
  - NOT push/PR/merge (blocked by mode)
- **Risk:** Minimal (manual-terminal blocks all writes)

### Phase 4: Full Agent Run (Only After Phase 3 Success)
- Canary issue with a simple code task (e.g., add a comment to a test file)
- Agent implements → pushes branch → creates PR
- Human reviews and merges
- **Risk:** Requires human gate

---

## 7. Cost and Rate Limits

| Provider | Estimated Cost per Canary | Rate Limits |
|----------|--------------------------|-------------|
| DeepSeek | ~$0.01-0.05 per run | 60 RPM (free tier) |
| OpenAI (GPT-4o) | ~$0.10-0.50 per run | 500 RPM (Tier 1) |
| Anthropic (Claude) | ~$0.15-0.75 per run | 50 RPM (Tier 1) |
| OpenRouter | Varies by model | Depends on provider |

**Recommendation:** Start with the most cost-effective provider. Canary runs are short (manual-terminal mode generates ~500-2000 tokens).

---

## 8. Rollback / Emergency

If the API key is compromised:

1. **Immediately:** Revoke/rotate key in provider dashboard
2. **Update:** `/opt/dev-fabric/.env` on Runner LXC with new key
3. **Audit:** Check provider usage logs for unauthorized activity
4. **Document:** Note rotation in CHANGELOG (no key in message)

If the Runner behaves unexpectedly:

1. Disable the n8n Workflow (deactivate)
2. Remove `agent:ready` from any pending issues
3. Investigate runner logs: `/opt/dev-fabric/logs/`
4. Re-enable only after root cause identified

---

## 9. Blockers and Dependencies

| Blocker | Status | Resolution |
|---------|--------|------------|
| Provider account/API key | ❌ Not configured | User creates account, generates key |
| Runner LXC .env file | ❌ Not configured | User creates `/opt/dev-fabric/.env` |
| n8n SSH credential | ✅ Working | Already configured for `manual-terminal` |
| GitHub token for agent | ✅ Working | Already configured as n8n credential |

---

## 10. Summary

| Question | Answer |
|----------|--------|
| What's missing for real agent runs? | Provider API key on Runner LXC |
| Where should the key live? | `/opt/dev-fabric/.env` on Runner LXC only |
| Can we test without risk? | Yes — dry-run + manual-terminal mode |
| Is this urgent? | No — manual-terminal provides value without provider |
| What changes when configured? | Runner can delegate to real AI agents for implementation |
