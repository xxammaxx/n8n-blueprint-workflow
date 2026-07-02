# Playwright MCP E2E Smoke Plan

## Status
- **Authorization:** NOT GRANTED → PLAYWRIGHT_E2E_AUTH_MISSING
- **Capability:** PLAYWRIGHT_MCP_CAPABLE (confirmed Phase 6)
- **This document:** PLAN ONLY, no execution without authorization

## Required Authorization
```text
Ich autorisiere einen Playwright MCP E2E-Smoke-Test gegen die n8n UI. 
Keine Workflow-Änderungen, keine Credentials, keine Issues, keine Agent-Runs.
```

## E2E Smoke Test Plan

### 1. Setup
- Use `@playwright/mcp@latest --isolated` (fresh session, no persistent storage)
- Connect to n8n UI at `http://192.168.1.52:5678`
- Wait for page load

### 2. UI Accessibility
- Verify n8n UI loads successfully
- Check page title is "n8n.io - Workflow Automation"
- Determine if login page or dashboard is shown

### 3. Workflow List (if authenticated/dashboard visible)
- Navigate to Workflows list
- Verify workflow count
- Find Dispatcher Workflow `Sv12QTo56NoPUu2D`
- Check node count and active/published status

### 4. Read-Only Validation
- Do NOT modify any nodes
- Do NOT open/read credentials
- Do NOT delete executions
- Do NOT activate/deactivate workflows
- Do NOT save changes

### 5. Evidence
- Redacted screenshots (no tokens, no API keys, no credentials)
- DOM state snapshots (text only)
- No cookies extracted
- No session data persisted

### 6. Cleanup
- Close browser
- Remove temporary files
- No state persisted

## Hard Constraints (during E2E)
- No workflow changes
- No credential access
- No issue creation
- No agent runs
- No secret exposure
- No old `.playwright-mcp/` sessions

## Execution Gate
- **READY when:** User provides explicit authorization text
- **Blocked:** until authorization received
