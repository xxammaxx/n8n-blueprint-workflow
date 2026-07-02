# Provider Smoke Test Plan

## Status
**PLAN ONLY** — NO TEST EXECUTED

## Purpose
Validate that the OpenCode/DeepSeek provider configuration on the Runner is functional and cost-limited.

## Prerequisites
1. SSH to Runner is GREEN ✅ (confirmed)
2. Provider env is structurally ready ✅ (confirmed)
3. `OPENCODE_ALLOW_PROVIDER_CALL=true` ✅ (confirmed in env)
4. Cost limit configured ✅ (`OPENCODE_MAX_COST_USD` present)

## Test Plan

### Required User Approval
```
Ich autorisiere einen kostenbegrenzten OpenCode/DeepSeek Provider-Smoke-Test auf dem Runner. Maximal 0,25 USD. Kein Agent-Run gegen GitHub Issues.
```

### Test Steps (NOT EXECUTED)
1. SSH to Runner as runner (or via runuser)
2. Source provider env: `source /opt/dev-fabric/secrets/opencode-provider.env`
3. Run smoke test: `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh`
4. Verify: non-trivial response, no errors, cost < 0.25 USD
5. Log result to evidence directory

### Constraints
- **Max cost:** 0.25 USD
- **No Agent-Run:** No GitHub Issue processing
- **No Dispatcher:** No workflow triggering
- **No secret output:** API key never displayed
- **No persistent effects:** One-shot test only

### Success Criteria
- Provider responds with valid model output
- Cost within limit
- No authentication errors
- No rate-limit errors

### Failure Modes
- Provider API key invalid → `RED_PROVIDER_AUTH`
- Rate limit exceeded → `YELLOW_PROVIDER_RATE_LIMIT`
- Cost > 0.25 USD → `RED_PROVIDER_COST`
- Network timeout → `YELLOW_PROVIDER_NETWORK`

## Status
- [ ] NOT YET AUTHORIZED
- [ ] NOT YET EXECUTED
- [ ] Plan documented

## Next Step
Request user approval via the authorization string above.
