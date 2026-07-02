# Runner Dev-Fabric Structure

## Metadata
- **Date/Time UTC:** 2026-07-02T15:15:00Z

## Directory: /opt/dev-fabric

| Component | Path | Status |
|-----------|------|--------|
| Main dir | `/opt/dev-fabric` | EXISTS |
| Loader | `/opt/dev-fabric/bin/load-opencode-provider-env.sh` | EXISTS (executable) |
| Smoke test | `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh` | EXISTS (executable) |
| Smoke test backup | `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh.bak` | EXISTS |
| Dispatch script | `/opt/dev-fabric/scripts/start_github_issue_run.sh` | EXISTS (executable) |
| Evidence dir | `/opt/dev-fabric/evidence` | EXISTS |
| Provider env | `/opt/dev-fabric/secrets/opencode-provider.env` | EXISTS |

## Bin Directory Detail
```
total 24
drwxr-xr-x  2 runner runner  4096 Jun 28 08:24 .
-rwxr-xr-x  1 runner runner  2313 Jun 28 08:43 load-opencode-provider-env.sh
-rwxr-xr-x  1 runner runner  6450 Jun 28 08:49 opencode-provider-smoke-test.sh
-rwxr-xr-x  1 nobody nogroup 3144 Jun 28 08:24 opencode-provider-smoke-test.sh.bak
```

Note: The `.bak` file is owned by `nobody:nogroup` — unusual ownership.

## Secrets Directory
- Contains 1 file: `opencode-provider.env`
- No file contents read

## Status
- All expected components present
- Dev-fabric structure is READY

## Secrets
- None exposed
