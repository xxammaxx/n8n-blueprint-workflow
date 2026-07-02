# MCP Preflight Script

## Status
**PLAN** — Script is planned, not yet created. Awaiting implementation approval.

## Purpose
A read-only Node.js script that validates MCP prerequisites before any MCP server is started.

## Planned Checks

1. **Node.js version** — Must be >= 18
2. **npm/npx availability** — Must be available
3. **Playwright MCP availability** — `npx @playwright/mcp@latest --help` exits 0
4. **Local MCP config files** — Check structure, warn about placeholders
5. **No secrets in configs** — Detect real tokens in placeholder positions
6. **No active MCP servers** — Warn if MCP servers are already running
7. **Evidence directory** — Ensure writable

## Planned Features

- Pure read-only — no side effects
- No MCP servers started
- No browser launched
- No n8n API calls
- No secrets output
- JSON output for machine readability
- Human-readable summary for manual review

## Constraints

- No secret output — if a real token is detected, show REDACTED
- No file modifications
- No network calls (except `npx --help` which only shows help)
- Exit codes: 0 (ready), 1 (warnings), 2 (blockers)

## Planned Location
`scripts/mcp-preflight.mjs`

## Proposed Interface
```
node scripts/mcp-preflight.mjs [--json] [--verbose]
```

## Implementation Status
- [ ] Script not yet created
- [ ] Awaiting approval to implement
