# Runner Read-Only Validation

## Metadata
- **Timestamp UTC:** 2026-06-29T13:02:02Z
- **Runner:** 192.168.1.53

## Status: BLOCKED — `SSH_KEY_REQUIRED`

| Check | Result |
|-------|--------|
| Runner reachable | YES (SSH responds, DNS/host resolves) |
| User `runner` exists | YES (authentication attempted) |
| SSH key authorized | NO |
| Validation performed | NO — blocked |

## Planned Checks (deferred)
```bash
ssh runner@192.168.1.53 '
hostname
whoami
opencode --version || true
test -x /opt/dev-fabric/bin/load-opencode-provider-env.sh && echo "loader: yes" || echo "loader: no"
test -f /opt/dev-fabric/secrets/opencode-provider.env && echo "runner secret file: yes" || echo "runner secret file: no"
test -x /opt/dev-fabric/scripts/start_github_issue_run.sh && echo "dispatch script: yes" || echo "dispatch script: no"
'
```

## Unblock Condition
User must authorize the local SSH public key for user `runner` on 192.168.1.53.
