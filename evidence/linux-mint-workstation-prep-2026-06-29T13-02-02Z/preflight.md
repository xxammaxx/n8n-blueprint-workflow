# Linux Mint Workstation Preflight

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Hostname:** xxammaxx-desktop
- **Shell:** /bin/bash

## System Information
- **OS:** Linux Mint 22.1 (Xia)
- **Kernel:** Linux 6.8.0-124-generic x86_64
- **Kernel Type:** PREEMPT_DYNAMIC

## Tool Versions
| Tool | Version | Present |
|------|---------|---------|
| Git | 2.43.0 | YES |
| Node.js | v22.22.0 | YES |
| npm | 10.9.4 | YES |
| Python3 | 3.12.3 | YES |
| SSH (OpenSSH) | 9.6p1 | YES |
| curl | 8.5.0 | YES |

## Git Repository State
- **Current Branch:** master
- **Remote:** origin = https://github.com/xxammaxx/n8n-blueprint-workflow.git
- **Branch Status:** up to date with origin/master
- **Working Tree:** CLEAN (nichts zu committen)
- **Last Commit:** a78d427 — docs(ops): add linux mint new machine migration validation
- **Last 10 Commits:**
  ```
  a78d427 docs(ops): add linux mint new machine migration validation
  56e6362 docs(ops): add final report to migration handoff evidence
  76d80d6 docs(ops): add migration handoff for new machine
  ecc1fc7 docs(repo): harden gitignore and root operations docs
  8de09e1 docs(ops): add final operations baseline check
  2620867 docs(repo): add final report for dummy issue cleanup
  b594a23 docs(repo): record dummy issue cleanup
  4523fde docs(repo): add final report for default branch apply
  f2b7c1c docs(repo): set master as default branch
  4670add docs(repo): analyze main master branch drift
  ```

## Secret Safety
- **Secret values displayed:** NO
- **secrets/ tracked in git:** NO (gitignored via .gitignore line 7)
- **.playwright-mcp/ tracked in git:** YES (48 files tracked — pre-existing from old machine clone; history rewrite pending separately)

## Notes
- `.playwright-mcp/` directory contains old session files from previous machine. These are tracked in git but ignored in `.gitignore`. History rewrite to remove them is planned as a separate, later task.
- `secrets/` directory exists with `opencode-provider.env` (permissions 600, directory 700)
- No `.env.local` file existed at preflight
- Working tree is clean — ready for workstation preparation steps
