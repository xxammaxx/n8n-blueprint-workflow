# Runner Read-Only Recheck After MCP Prep

## Check Time
2026-07-02 (after MCP/phases)

## SSH Connectivity
- **SSH to runner@192.168.1.53:** GREEN
- **Hostname:** lxc-dev-runner
- **User:** runner (direct SSH)

## su - runner
- **Result:** Authentication failure (password required)
- **Context:** Already logged in as runner via SSH; `su` to self requires password (expected)
- **Previous fix (PAM):** Applied but `su` to self still requires auth (normal behavior)

## Tool Versions
- **opencode:** 1.17.9
- **Node.js:** v22.23.0
- **Git:** 2.39.5

## Infrastructure Scripts
- **Provider Env Loader:** `/opt/dev-fabric/bin/load-opencode-provider-env.sh` — present, executable
- **Dispatch Script:** `/opt/dev-fabric/scripts/start_github_issue_run.sh` — present, executable

## Status
- **RUNNER_SSH_GREEN**
- **RUNNER_TOOLS_READY**
- **SU_RUNNER_SELF:** expected auth failure (alredy runner, `su` to self needs password)
- **No secrets output**
