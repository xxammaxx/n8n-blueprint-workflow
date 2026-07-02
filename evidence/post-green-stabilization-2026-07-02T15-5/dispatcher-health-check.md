# Dispatcher Health Check Report

**Date/Time:** 2026-07-02T15:58:16.339Z
**Health Status:** `HEALTH_YELLOW`
**Session:** post-green-stabilization-2026-07-02T15-5

---

## Summary

| Metric | Value |
|--------|-------|
| Total Checks | 11 |
| PASS | 6 |
| WARN | 3 |
| SKIP | 1 |
| FAIL | 1 |
| Health | HEALTH_YELLOW |

---

## Check Results

### ✅ n8n-reachable
- **Status:** PASS
- **Detail:** HTTP 200, 15 bytes, n8n signature: found
- **Duration:** 34ms
- **Evidence:** `{"statusCode":200,"contentLength":15,"n8nSignatureFound":true}`

### ✅ n8n-base-page
- **Status:** PASS
- **Detail:** HTTP 200, content: 18893 bytes
- **Duration:** 101ms
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
- **Evidence:** `{"exportPath":"/home/xxammaxx/Spec-kit_n8n/exports/green/dispatcher-green-20260627T131737Z.json","workflowId":"Sv12QTo56NoPUu2D","workflowName":"GitHub Ready Issue -> Runner Agent Dispatch","active":t`

### ✅ protected-issues
- **Status:** PASS
- **Detail:** 5/5 issues safe
- **Duration:** 2081ms
- **Evidence:** `{"issues":[{"issue":"#3","state":"OPEN","hasAgentReady":false,"hasAgentRunning":false,"hasNeedsReview":true,"hasEvidenceAttached":true,"safe":true,"labels":["agent:needs-review","evidence:attached","m`

### ⚠️ git-status
- **Status:** WARN
- **Detail:** Branch: master, Commit: baebe91, Green: false
- **Duration:** 0ms
- **Evidence:** `{"branch":"master","commit":"baebe91cf968ada2b238c786c56958d884f5194d","commitMessage":"docs(ops): finalize playwright-mcp history remediation evidence and status","isGreenCommit":false}`

### ⚠️ evidence-dirs
- **Status:** WARN
- **Detail:** Could not list evidence dirs: Command failed: powershell -Command "Get-ChildItem -LiteralPath '/home/xxammaxx/Spec-kit_n8n/evidence' -Directory | Select-Object Name, LastWriteTime | Sort-Object LastWriteTime -Descending | ConvertTo-Json"
/bin/sh: 1: powershell: not found

- **Duration:** 0ms
- **Evidence:** `{"error":"Command failed: powershell -Command \"Get-ChildItem -LiteralPath '/home/xxammaxx/Spec-kit_n8n/evidence' -Directory | Select-Object Name, LastWriteTime | Sort-Object LastWriteTime -Descending`

### ⚠️ exports-exist
- **Status:** WARN
- **Detail:** Could not list export files
- **Duration:** 0ms
- **Evidence:** `{"exportsGreenExists":true}`

### ✅ runbook-exists
- **Status:** PASS
- **Detail:** OPERATIONS_RUNBOOK.md found
- **Duration:** 0ms
- **Evidence:** `{"runbookExists":true,"path":"/home/xxammaxx/Spec-kit_n8n/evidence/post-green-stabilization-20260627T131737Z/OPERATIONS_RUNBOOK.md"}`

### ✅ green-baseline-exists
- **Status:** PASS
- **Detail:** GREEN_BASELINE.md found
- **Duration:** 0ms
- **Evidence:** `{"baselineExists":true,"path":"/home/xxammaxx/Spec-kit_n8n/evidence/post-green-stabilization-20260627T131737Z/GREEN_BASELINE.md"}`

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
| Total Duration | 2476ms |