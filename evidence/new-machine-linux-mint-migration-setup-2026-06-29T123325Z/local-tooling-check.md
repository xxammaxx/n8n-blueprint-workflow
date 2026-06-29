# Local Tooling Check — New Machine

**Date/Time (UTC):** 2026-06-29T12:35:00Z

## Runtime Versions

| Tool | Version |
|------|---------|
| node | v22.22.0 |
| npm | 10.9.4 |
| git | 2.43.0 |
| python3 | 3.12.3 |

## Project Scripts (25 files)

| Script | Type | Status |
|--------|------|--------|
| dispatcher-health-check.mjs | Node.js | PRESENT |
| scan-n8n-live-readiness.mjs | Node.js | PRESENT |
| validate-local.mjs | Node.js | PRESENT |
| validate-secret-hygiene.mjs | Node.js | PRESENT |
| build-workflow.mjs | Node.js | PRESENT |
| container_pipeline.mjs | Node.js | PRESENT |
| diagnose-n8n-http.mjs | Node.js | PRESENT |
| dry-run-local.mjs | Node.js | PRESENT |
| run-trusted-readiness-scan.mjs | Node.js | PRESENT |
| test-deepseek-provider.sh | Shell | PRESENT |
| test-scanner-entrypoints.mjs | Node.js | PRESENT |
| load-opencode-provider-env.sh | Shell | PRESENT |
| opencode-provider-smoke-test.sh | Shell | PRESENT |
| remote_runner_orchestrator.sh | Shell | PRESENT |
| patch-n8n-history.py | Python | PRESENT |
| patch-n8n-workflow-db.py | Python | PRESENT |
| opencode-runner-config.json | Config | PRESENT |

## Windows-Only Scripts (not for Linux Mint)

| Script | Note |
|--------|------|
| *.ps1 files (6 files) | PowerShell — Windows only, not used on Linux Mint |
| load-local-env.ps1 | Windows only |
| discover-local-opencode-credentials.ps1 | Windows only |
| export-local-opencode-credentials.ps1 | Windows only |
| copy-opencode-provider-credentials.ps1 | Windows only |
| run-trusted-readiness-with-local-env.ps1 | Windows only |

## Readiness

| Check | Result |
|-------|--------|
| Node.js scripts executable | YES |
| Shell scripts executable | YES |
| Python scripts available | YES |
| No destructive operations run | YES |

## Status

**GREEN** — All required tools and scripts available. Windows PowerShell scripts not applicable on Linux Mint.
