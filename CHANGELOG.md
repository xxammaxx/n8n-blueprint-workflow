# Changelog

## 2026-06-27 — Schedule Auto-Run Verification

### Verified
- **Schedule Trigger fires correctly!** Executions #45 (06:00 UTC) and #46 (06:15 UTC) confirmed
- n8n v2.26.8 DOES register Schedule Trigger from API updates (previous concern disproven)
- Workflow Published + Active confirmed via Playwright UI check
- Schedule interval: 15 minutes, correctly observed
- Issue #3 double-run protection: intact ✅ (no `agent:ready`, no reprocessing)

### Discovered
- 🔴 **Guardrails & Validate node BUG:** Hard reference to `$('Manual Trigger (Smoke Test)')` causes crash on Schedule-Triggered runs
- Error: `Cannot assign to read only property 'name' of object 'Error: Node 'Manual Trigger (Smoke Test)' hasn't been executed'`
- Impact: Both schedule-triggered executions (#45, #46) failed in < 1 second
- Issue #4 never reached — `agent:ready` label still present

### Documented
- 8 evidence files in `evidence/schedule-auto-run-verification-20260627T061306Z/`
- Playwright screenshots: execution-46-error-details.png, execution-list-overview.png
- STATUS.md updated with Guardrails bug analysis
- CHANGELOG.md updated

### Status
- **YELLOW** — Schedule fires but Guardrails node crashes before issue processing

### Next
- Fix Guardrails node: read from Schedule Trigger path instead of Manual Trigger
- Re-test with Issue #4 or new canary

---

## 2026-06-27 — Schedule Trigger + Node 15 Fix Session

### Analyzed
- Dispatcher workflow `Sv12QTo56NoPUu2D` fully parsed from GitHub JSON (18 nodes)
- Node 15 (Format Final Result) return format issue identified
- Schedule Trigger configuration documented
- Guardrails double-start protection verified
- All connections and trigger flows mapped

### Created
- Test Issue #4: `[Schedule Test] Dispatcher auto-run canary` with `agent:ready` label
- 11 evidence files in `evidence/schedule-trigger-node15-fix-20260627T050006Z/`

### Documented
- Node 15 fix: `return result;` → `return [{ json: result }];`
- Schedule Trigger: 10 min → 15 min interval
- Complete workflow trigger map
- Manual application steps for live n8n

### Status
- YELLOW (TOOL_GAP: n8n credentials not available for live application)

### Known Gaps
- n8n API key not configured
- n8n UI login not available
- Git repo broken (cannot commit/push)
- WSL not installed (cannot run bash -n)

---

## 2026-06-26 — Dispatcher Schedule Runner Verification

### Verified
- Runner script deployed to LXC 102
- Dispatcher workflow active (Manual Trigger only)
- Issue #3 processed via manual trigger (Execution #44)
- Labels transitioned correctly
- Runner evidence generated

### Discovered
- Schedule Trigger absent from live workflow
- Node 15 "pre-existing JS syntax" error in Execution #44
- n8n runs in CT 101 (not Proxmox host)
- Defective n8n.service zombie on Proxmox host

### Status
- GREEN_PARTIAL (Schedule Trigger missing, Node 15 error)

---

## 2026-06-26 — Dispatcher UI Activation

### Fixed
- Node 15 unused variable removed via REST API PATCH
- Workflow activated via API

### Discovered
- Publish button disabled due to Node 15 linter error
- n8n v2.26.8 requires UI-Publish for Schedule runtime registration
- n8n runs on Proxmox HOST (later corrected to CT 101)

### Status
- GREEN_PARTIAL_PLUS
