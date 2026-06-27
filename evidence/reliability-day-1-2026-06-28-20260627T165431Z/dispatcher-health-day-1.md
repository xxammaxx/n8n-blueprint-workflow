# Dispatcher Health Check Report

**Date/Time:** 2026-06-27T16:55:11.941Z
**Health Status:** `HEALTH_YELLOW`
**Session:** post-green-stabilization-2026-06-27T16-5

---

## Summary

| Metric | Value |
|--------|-------|
| Total Checks | 11 |
| PASS | 8 |
| WARN | 1 |
| SKIP | 1 |
| FAIL | 1 |
| Health | HEALTH_YELLOW |

---

## Check Results

### ✅ n8n-reachable
- **Status:** PASS
- **Detail:** HTTP 200, 15 bytes, n8n signature: found
- **Duration:** 119ms
- **Evidence:** `{"statusCode":200,"contentLength":15,"n8nSignatureFound":true}`

### ✅ n8n-base-page
- **Status:** PASS
- **Detail:** HTTP 200, content: 18893 bytes
- **Duration:** 17ms
- **Evidence:** `{"statusCode":200,"hasN8nSignature":true}`

### ⏭️ workflow-api
- **Status:** SKIP
- **Detail:** N8N_API_KEY not available — API check skipped
- **Duration:** 0ms
- **Evidence:** `{"reason":"auth_missing"}`

### ✅ workflow-local
- **Status:** PASS
- **Detail:** Local export: id=Sv12QTo56NoPUu2D, active=true, nodes=18
- **Duration:** 0ms
- **Evidence:** `{"exportPath":"C:\\Spec-kit_n8n\\exports\\green\\dispatcher-green-20260627T131737Z.json","workflowId":"Sv12QTo56NoPUu2D","workflowName":"GitHub Ready Issue -> Runner Agent Dispatch","active":true,"nod`

### ✅ protected-issues
- **Status:** PASS
- **Detail:** 5/5 issues safe
- **Duration:** 4309ms
- **Evidence:** `{"issues":[{"issue":"#3","state":"OPEN","hasAgentReady":false,"hasAgentRunning":false,"hasNeedsReview":true,"hasEvidenceAttached":true,"safe":true,"labels":["agent:needs-review","evidence:attached","m`

### ⚠️ git-status
- **Status:** WARN
- **Detail:** Branch: master, Commit: 342f6a0, Green: false
- **Duration:** 0ms
- **Evidence:** `{"branch":"master","commit":"342f6a0d4e1d2e08cfa97b0d00569c48d784e935","commitMessage":"docs(ops): add final report for push and reliability start","isGreenCommit":false}`

### ✅ evidence-dirs
- **Status:** PASS
- **Detail:** 21 evidence directories found
- **Duration:** 0ms
- **Evidence:** `{"count":21,"latest":"reliability-day-1-2026-06-28-20260627T165431Z"}`

### ✅ exports-exist
- **Status:** PASS
- **Detail:** 2 green export files
- **Duration:** 0ms
- **Evidence:** `{"exportsGreenExists":true,"fileCount":2}`

### ✅ runbook-exists
- **Status:** PASS
- **Detail:** OPERATIONS_RUNBOOK.md found
- **Duration:** 0ms
- **Evidence:** `{"runbookExists":true,"path":"C:\\Spec-kit_n8n\\evidence\\post-green-stabilization-20260627T131737Z\\OPERATIONS_RUNBOOK.md"}`

### ✅ green-baseline-exists
- **Status:** PASS
- **Detail:** GREEN_BASELINE.md found
- **Duration:** 0ms
- **Evidence:** `{"baselineExists":true,"path":"C:\\Spec-kit_n8n\\evidence\\post-green-stabilization-20260627T131737Z\\GREEN_BASELINE.md"}`

### ❌ secret-hygiene
- **Status:** FAIL
- **Detail:** Secret hygiene script failed: Command failed: node scripts/validate-secret-hygiene.mjs
- **Duration:** 0ms
- **Evidence:** `{"passed":false,"error":"Command failed: node scripts/validate-secret-hygiene.mjs"}`

---

## Meta

| Field | Value |
|-------|-------|
| n8n Base URL | http://192.168.1.52:5678 |
| n8n API Key Available | No |
| Workflow ID | Sv12QTo56NoPUu2D |
| Protected Issues | 3, 4, 5, 6, 7 |
| Total Duration | 7266ms |