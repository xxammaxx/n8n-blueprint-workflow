# Final Report — su-runner PAM Remediation

## 1. Summary

**`su - runner` hang im LXC-Container CT 102 wurde diagnostiziert und behoben.** Root Cause war `pam_systemd.so` in der PAM-Session-Stack, das versuchte, eine Session bei `systemd-logind` via D-Bus zu registrieren. Im LXC-Container ist logind nicht voll funktionsfähig (systemd "degraded"), wodurch der D-Bus-Call unendlich hing. Die Reparatur bestand aus dem Auskommentieren von `pam_systemd.so` in zwei PAM-Konfigurationsdateien.

## 2. Status Decision

**`SU_RUNNER_FIXED`** ✅🔧

## 3. Root Cause

`pam_systemd.so` in `/etc/pam.d/common-session` und `/etc/pam.d/runuser-l` blockiert, weil:
- `systemd-logind` im LXC-Container nicht voll funktionsfähig ist
- D-Bus zwar läuft, aber logind keine Session-Registrierung akzeptiert
- Der synchrone D-Bus-Call hängt ohne Timeout

## 4. Action Taken

**Repair applied** (user-authorized):
- `/etc/pam.d/common-session`: `pam_systemd.so` auskommentiert → fixes `su` und `su -`
- `/etc/pam.d/runuser-l`: `pam_systemd.so` auskommentiert → fixes `runuser -l`
- Backups erstellt: `*.bak-20260702T160431Z`
- Keine anderen PAM-Dateien geändert

**Workaround confirmed:** `runuser -u runner -- <cmd>` (funktionierte bereits vor Reparatur)

## 5. Runner Status

| Check | Status |
|-------|--------|
| SSH `runner@192.168.1.53` | 🟢 GREEN |
| OpenCode 1.17.9 | 🟢 Present |
| Loader Script | 🟢 Present |
| Dispatch Script | 🟢 Present |
| Node.js v22.23.0 | 🟢 Present |

## 6. n8n Status

| Check | Status |
|-------|--------|
| n8n API (health check) | 🟢 Reachable (HTTP 200) |
| n8n API Key | 🟡 401 (pre-existing, unrelated) |

## 7. Secret Hygiene

**GREEN** ✅ — 0 real secrets in any evidence file. All grep matches are context-only ("Secrets: None exposed", etc.).

## 8. Safety Verification

| Constraint | Status |
|------------|--------|
| No secrets exposed | ✅ |
| No private keys exposed | ✅ |
| No Runner scripts modified | ✅ |
| No DB files modified | ✅ |
| No processes killed | ✅ |
| No CT restart | ✅ |
| No n8n restart | ✅ |
| No issues modified | ✅ |
| No agent runs | ✅ |
| No Provider Smoke Test | ✅ |
| Backups created before repair | ✅ |
| Repair minimal (2 files, 1 line each) | ✅ |

## 9. Changed Files (Local Repo)

| File | Change |
|------|--------|
| `CHANGELOG.md` | Added su-runner remediation entry |
| `STATUS.md` | Updated status, added SU_RUNNER_FIXED section |
| `LINUX_MINT_OPERATIONAL_READINESS.md` | Updated readiness, su-runner fixed |
| `evidence-index/latest.md` | Updated active evidence directory |
| `evidence/su-runner-pam-remediation-20260702T160431Z/` | 16 new evidence files |

## 10. Changed Files (Runner CT 102)

| File | Change |
|------|--------|
| `/etc/pam.d/common-session` | `pam_systemd.so` commented out |
| `/etc/pam.d/runuser-l` | `pam_systemd.so` commented out |
| `/etc/pam.d/common-session.bak-*` | Backup created |
| `/etc/pam.d/runuser-l.bak-*` | Backup created |

## 11. Commit / Push

- **Commit:** `7a022cb` — `docs(ops): document su runner diagnosis and workaround`
- **Push:** ✅ Pushed to `origin/master`

## 12. Open Tasks (NOT addressed in this session)

| Task | Priority | Status |
|------|----------|--------|
| n8n MCP Activation | High | Pending |
| Playwright MCP E2E | High | Pending |
| Provider Smoke Test | High | Pending |
| n8n API Key 401 | Medium | Pre-existing, unrelated |

## 13. Next Recommended Step

**n8n MCP Activation** — n8n 2.26.8 supports MCP protocol. With runner operational and su fixed, the next logical step is activating MCP capabilities for programmatic agent interaction with n8n.

---

**Session End:** 2026-07-02T16:10:00Z  
**Status:** SU_RUNNER_FIXED ✅🔧  
**Secrets:** 0 exposed  
**Agent:** Issue Orchestrator
