# Browser Automation Strategy — n8n Blueprint Workflow

## Decision

This document defines the tiered browser and MCP automation architecture for the n8n-blueprint-workflow system. The goal is to move beyond Playwright MCP as the sole UI automation tool and establish a secure, layered automation stack.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Automation Stack (Tiered)                │
├─────────────────────────────────────────────────────────┤
│ TIER 1: n8n official MCP                                │
│   → n8n workflow discovery, execution, testing           │
│   → Requires: Instance-level MCP enabled + auth token    │
│   → Status: DISABLED (visible in UI, needs activation)   │
├─────────────────────────────────────────────────────────┤
│ TIER 2: Chrome DevTools MCP                             │
│   → Browser UI debugging, console/network inspection     │
│   → Status: VERIFIED INSTALLABLE (npx, Chrome 149+)      │
├─────────────────────────────────────────────────────────┤
│ TIER 3: Playwright CLI/Scripts                          │
│   → Reproducible regression tests, CI-compatible         │
│   → Status: TEST SPEC CREATED                           │
├─────────────────────────────────────────────────────────┤
│ TIER 4: Playwright MCP (Fallback)                       │
│   → Current working browser automation                   │
│   → Status: WORKING (kept as fallback)                   │
├─────────────────────────────────────────────────────────┤
│ TIER 5: BrowserMCP (Evaluated, Not Installed)           │
│   → Optional auth-session fallback                       │
│   → Status: EVALUATED, NOT INSTALLED                     │
└─────────────────────────────────────────────────────────┘
```

## Tool Selection Rationale

| Tool | Primary Role | Rationale |
|------|-------------|-----------|
| **n8n official MCP** | Workflow ops | Official, authenticated, purpose-built for n8n. Supports `search_workflows`, `execute_workflow`, etc. |
| **Chrome DevTools MCP** | UI debugging | Official Google tooling. Inspect console errors, network failures, DOM state. No credential surface. |
| **Playwright CLI** | Regression | Reproducible, CI-compatible, deterministic. Not MCP-coupled. |
| **Playwright MCP** | Fallback | Currently working. Keep as secondary option. |
| **BrowserMCP** | Optional fallback | Evaluated but not installed. Extension-based, profile access risk. |

## Security Boundaries

### n8n MCP Security

| Rule | Status |
|------|--------|
| Only dedciated test workflow exposed to MCP | ✅ `mcp-smoke-test` workflow prepared |
| Production workflows NOT exposed to MCP | ✅ No `availableInMCP: true` on production workflows |
| Auth token required | ✅ Bearer token gating |
| Edit/Build tools blocked for production | ⚠️ Not enabled yet, but documented for future |
| No global MCP without auth | ✅ Must be enabled explicitly per workflow |

### Chrome DevTools MCP Security

| Rule | Status |
|------|--------|
| Dedicated Chrome profile | ✅ `--userDataDir` or `--isolated` flag |
| No private profiles copied | ✅ Enforced |
| No cookies/tokens read | ✅ Enforced by test scripts |
| Headless mode for CI | ✅ `--headless` available |
| Screenshots redacted before storage | ✅ No secrets in screenshot paths |

### Playwright Security

| Rule | Status |
|------|--------|
| No credentials in test code | ✅ Verified |
| LOGIN_REQUIRED abort pattern | ✅ Implemented |
| Secrets never in screenshots | ✅ Checked in spec |
| Storage state ignored | ✅ `.gitignore` blocks `storageState*.json` |

## Current State (2026-06-24)

| Component | Status | Detail |
|-----------|--------|--------|
| n8n Version | 2.26.8 | Community Edition |
| n8n MCP Menu | VISIBLE | Settings → Instance-level MCP (Preview) |
| n8n MCP Enabled | DISABLED | Toggle off, no tokens generated |
| n8n MCP Test Workflow | PREPARED | `workflows/mcp-smoke-test.export.json` |
| Chrome DevTools MCP | INSTALLABLE | `npx chrome-devtools-mcp@latest` works |
| Playwright CLI Spec | CREATED | `tests/ui/n8n-github-issue-intake-smoke.spec.ts` |
| Playwright MCP | WORKING | Current fallback, verified in prior session |
| BrowserMCP | NOT INSTALLED | Evaluated only |

## Enablement Sequence

When user approves n8n MCP activation:

1. Enable Instance-level MCP in n8n Settings
2. Generate MCP auth token (store outside repo)
3. Import `mcp-smoke-test` workflow into n8n
4. Set `availableInMCP: true` ONLY on smoke test workflow
5. Configure MCP client with auth token
6. Test `search_workflows` and `execute_workflow` on smoke test only
7. DO NOT expose production workflows to MCP
8. Document findings in evidence report

## Playwright CLI Regression Tests

Location: `tests/ui/`

| Test File | Purpose |
|-----------|---------|
| `n8n-github-issue-intake-smoke.spec.ts` | Workflow navigation, node verification, secret scan |

Run: `npx playwright test tests/ui/`

## Prohibited Actions (All Tiers)

- Never expose credentials via MCP tools
- Never grant global MCP edit rights on all workflows
- Never install community MCP servers without explicit approval
- Never copy browser profiles with auth sessions
- Never store real MCP tokens in the repository
- Never read cookies or auth headers via automation
- Never trigger GitHub Actions via any automation tool

## Future Considerations

| Tool | When | Prerequisites |
|------|------|---------------|
| Stagehand | Later, not now | Dedicated evaluation session |
| Hermes MCP | Optional | Separate approval and security review |
| n8n MCP edit tools | After smoke test validation | Strict workflow scoping |
