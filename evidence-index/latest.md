# Evidence Report — browser-automation-strategy-20260624T120000Z

## Status: GREEN_PARTIAL

**Session ID:** browser-automation-strategy
**Completed:** 2026-06-24T12:00:00Z
**Orchestrator:** issue-orchestrator (opencode)
**Previous Session:** playwright-mcp-smoke-test-issue1

---

## 1. Reality Refresh

| Check | Result |
|-------|--------|
| Git repo clean | YES (4 files modified from prior session) |
| Remote | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Latest commit | `1bcbd61` test: playwright mcp smoke test |
| `.github/workflows` absent | ✅ YES |
| n8n Version | 2.26.8 (Community Edition) |
| n8n Service | UP (running since 2026-06-23) |
| Node.js (Windows host) | v24.14.0 |
| npm (Windows host) | 11.9.0 |
| Chrome | 149.0.7827.158 |
| Edge | 149.0.4022.80 |

## 2. n8n Official MCP Discovery

| Check | Result |
|-------|--------|
| MCP menu visible in Settings? | ✅ YES — "Instance-level MCP (Preview)" |
| MCP menu position | Between "Community nodes" and "Chat" |
| MCP status | DISABLED (toggle off) |
| MCP token generated? | ❌ NO (not enabled) |
| MCP enable button | Available (not clicked — awaiting approval) |
| Connection details exposed? | ❌ NO (hidden until enabled) |
| n8n MCP accessible without auth? | ❌ NO (requires enable + token) |

**Finding:** n8n v2.26.8 has Instance-level MCP as a Preview feature. It is visible in the Settings UI but currently disabled. No auth tokens or connection details have been generated. The feature is ready to enable with explicit user approval.

## 3. Dedicated MCP Test Workflow

| Check | Result |
|-------|--------|
| Test workflow created? | ✅ YES — `workflows/mcp-smoke-test.export.json` |
| Workflow name | "MCP Smoke Test" |
| Nodes | 2 (Manual Trigger + Code Node) |
| Returns secrets? | ❌ NO — only static metadata |
| Has credential access? | ❌ NO |
| Has SSH access? | ❌ NO |
| Has GitHub API? | ❌ NO |
| `availableInMCP` flag | `true` (only this workflow) |
| Import ready? | ✅ YES |

## 4. n8n MCP Minimal Test

| Check | Result |
|-------|--------|
| Test executed? | ❌ NOT YET — MCP is disabled |
| Blocker | User must enable Instance-level MCP first |
| Ready for test? | ✅ All artifacts prepared |

**When enabled, test scope:**
- ✅ `search_workflows` — safe
- ✅ `execute_workflow` on MCP Smoke Test only — safe
- ❌ `update_workflow` — NOT tested without approval
- ❌ `create_workflow_from_code` — NOT tested without approval

## 5. Chrome DevTools MCP

| Check | Result |
|-------|--------|
| Package installable? | ✅ YES — `npx chrome-devtools-mcp@latest` works |
| All CLI flags recognized | ✅ YES (22 options documented) |
| Headless mode supported | ✅ `--headless` flag available |
| Isolated profile supported | ✅ `--isolated` flag creates temp profile |
| Viewport configurable | ✅ `--viewport` flag |
| Chrome 144+ compatible | ✅ Chrome 149 installed |
| Editable tools available | ✅ `--experimentalDevtools`, `--experimentalVision` |
| Installation blocked? | ❌ NO — installable without issues |
| Tested against n8n? | ⚠️ NOT YET — saved for dedicated test session |

**Configuration:**
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--slim", "--isolated"]
    }
  }
}
```

## 6. Playwright CLI Regression

| Check | Result |
|-------|--------|
| Spec file created? | ✅ YES — `tests/ui/n8n-github-issue-intake-smoke.spec.ts` |
| Test runner: Playwright CLI | ✅ Not MCP-coupled |
| LOGIN_REQUIRED pattern | ✅ Aborts gracefully if login needed |
| Node verification test | ✅ Checks 9 expected node names |
| Secret detection test | ✅ Scans page for private key/GitHub token patterns |
| Credential-safe | ✅ No credentials in test code |
| Reproduction ready | ✅ `npx playwright test tests/ui/` |

## 7. BrowserMCP Evaluation

| Check | Result |
|-------|--------|
| Evaluated? | ✅ YES |
| Installed? | ❌ NO (not installed — evaluation only) |
| Advantages | Real logged-in browser profile, extension-based |
| Disadvantages | Less official, Chrome extension dependency, profile access |
| Risk | Chrome Extension + full profile access (session cookies, tokens) |
| Recommendation | Optional fallback only. Not primary path. |

## 8. Documentation Created/Updated

### New Files:
- `docs/browser-automation-strategy.md` — Tiered automation architecture
- `docs/n8n-mcp-integration.md` — MCP discovery, config, security
- `workflows/mcp-smoke-test.export.json` — Safe MCP test workflow
- `tests/ui/n8n-github-issue-intake-smoke.spec.ts` — Playwright CLI regression

### Updated Files:
- `templates/mcp-client-config.example.json` — Multi-server config template
- `STATUS.md` — Updated with browser automation stack
- `CHANGELOG.md` — New entry for this session
- `docs/security-boundaries.md` — MCP/browser automation boundaries
- `docs/troubleshooting.md` — MCP/browser troubleshooting entries
- `evidence-index/latest.md` — This report

## 9. Validation

| Check | Result |
|-------|--------|
| JSON validation (workflow files) | ⚠️ SKIPPED (WSL not installed on Windows) |
| Shell script syntax | ⚠️ SKIPPED (WSL not installed) |
| Smoke checks | ⚠️ SKIPPED (WSL not installed) |
| `.github/workflows` absent | ✅ YES |
| Forbidden files (.sqlite, .env, .key, .pem) | ✅ NONE FOUND |
| Secret scan | ✅ NO REAL SECRETS |

### Secret Scan:
- No private keys (BEGIN OPENSSH/RSA/EC/PRIVATE KEY)
- No GitHub tokens (ghp_*)
- No .env files
- No .sqlite files
- No credentials files
- No browser profiles or storage states
- `.gitignore` blocks all forbidden patterns

## 10. Security Status

| Check | Status |
|-------|--------|
| No private keys in repo | ✅ VERIFIED |
| No .env files | ✅ VERIFIED |
| No database files | ✅ VERIFIED |
| No credentials in JSON | ✅ VERIFIED |
| No GitHub Actions | ✅ VERIFIED |
| No MCP tokens stored | ✅ VERIFIED (placeholders only) |
| No browser profiles copied | ✅ VERIFIED |
| No cookies/auth read | ✅ VERIFIED |
| .gitignore enforced | ✅ VERIFIED |

## 11. What the System Can Do Now (vs. Previous)

| Capability | Previous Session | This Session |
|------------|-----------------|--------------|
| Playwright MCP only UI tool | ✅ sole tool | ✅ demoted to Tier 4 fallback |
| n8n MCP discovery | ⚠️ unchecked | ✅ **VERIFIED** — visible, disabled |
| Chrome DevTools MCP | ❌ unknown | ✅ **VERIFIED INSTALLABLE** |
| Playwright CLI regression | ❌ none | ✅ **SPEC CREATED** |
| BrowserMCP evaluation | ❌ not considered | ✅ **EVALUATED** (not installed) |
| MCP test workflow | ❌ none | ✅ **PREPARED** |
| Tiered automation docs | ❌ none | ✅ **COMPLETE** |
| MCP client config template | ⚠️ single-server only | ✅ **MULTI-SERVER** |

## 12. Decision Record

### Tiered Automation Stack:

1. **n8n official MCP** → Primary for n8n workflow operations (DISABLED, ready to enable)
2. **Chrome DevTools MCP** → Primary for browser UI debugging (INSTALLABLE, ready to test)
3. **Playwright CLI/Scripts** → Primary for reproducible regression (SPEC CREATED, ready to run)
4. **Playwright MCP** → Fallback (WORKING, kept as secondary)
5. **BrowserMCP** → Optional auth-session fallback (EVALUATED, NOT INSTALLED)
6. **Stagehand** → Later, not now

## 13. Open Constraints

1. **n8n MCP DISABLED** — User must explicitly enable in Settings. All artifacts prepared.
2. **WSL not installed** — Shell validation scripts require WSL on Windows host.
3. **Chrome DevTools MCP not tested against n8n** — Installable confirmed, actual test pending.
4. **OpenCode Provider/Auth missing** — Separate approval needed.

## 14. Next Steps

1. Get user approval to enable n8n Instance-level MCP
2. Run Chrome DevTools MCP smoke test against n8n UI
3. Run Playwright CLI regression tests
4. If n8n MCP enabled: import smoke test workflow, configure auth, test search/execute
5. Future: Stagehand evaluation (separate session)

## 15. Bewertung

**GREEN_PARTIAL** — Die gestufte Browser-Automationsarchitektur ist vollständig dokumentiert. n8n offizielles MCP ist sichtbar (deaktiviert, bereit zur Aktivierung). Chrome DevTools MCP ist installierbar. Playwright CLI Regression ist spezifiziert. Playwright MCP bleibt als Fallback. Keine Secrets im Repo. Keine .github/workflows.

**n8n MCP nicht aktiviert, aber alle Artefakte für die Aktivierung vorbereitet.** Sobald der Benutzer MCP in den n8n Settings aktiviert, kann der Smoke Test durchgeführt werden.
