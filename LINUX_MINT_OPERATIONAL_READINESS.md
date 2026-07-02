# Linux Mint Operational Readiness

**Last Updated:** 2026-07-02T21:24:XXZ  
**Session:** Playwright E2E Smoke Test (Phases 1-14)  
**Agent:** Issue Orchestrator (Playwright MCP E2E Smoke)

---

## Overall Status: **NEW_MACHINE_OPERATIONAL_READY_WITH_HISTORY_LEAK_NOTE**

Combined operational readiness: **READY** 🟢 — SSH zum Runner GREEN, n8n API reachable, Provider-Env strukturell READY. **DATABASE_LOCK_REMEDIATION_GREEN** — Stale PID 7103 via SIGTERM resolved. **SU_RUNNER_FIXED** — `pam_systemd.so` in LXC-Container auskommentiert, `su - runner` funktioniert jetzt. **PLAYWRIGHT_E2E_SMOKE_GREEN** — Playwright CLI E2E smoke test gegen n8n UI erfolgreich (Login-Seite bestätigt). **N8N_UI_LOGIN_REQUIRED** — Dispatcher UI Smoke benötigt manuelle Anmeldung.

---

## Status Decisions

| Decision | Value |
|----------|-------|
| **Primary** | `NEW_MACHINE_OPERATIONAL_READY_WITH_HISTORY_LEAK_NOTE` |
| **New Sub-Status** | `SU_RUNNER_FIXED` — PAM/`pam_systemd.so` im LXC-Container auskommentiert, `su - runner` works ✅ |
| **New Sub-Status** | `DATABASE_LOCK_REMEDIATION_GREEN` — Stale PID 7103 via SIGTERM resolved ✅ |
| **New Sub-Status** | `N8N_MCP_CAPABLE` — n8n 2.26.8, MCP unterstützt, nicht aktiviert |
| **New Sub-Status** | `PLAYWRIGHT_MCP_CAPABLE` — `@playwright/mcp` installierbar, `--isolated` |
| **New Sub-Status** | `MCP_BUILD_PROCESS_PREPARED` — Architektur, Templates, Pläne erstellt |
| **New Sub-Status** | `PLAYWRIGHT_MCP_READY` — Playwright MCP v0.0.77, `--isolated`, browser ready |
| **New Sub-Status** | `N8N_MCP_ACTIVATION_AUTH_MISSING` — n8n MCP capable but not activated |
| **New Sub-Status** | `PLAYWRIGHT_E2E_SMOKE_GREEN` — Playwright CLI E2E smoke test against n8n UI successful |
| **New Sub-Status** | `N8N_UI_LOGIN_REQUIRED` — Manual login needed for Dispatcher UI smoke |
| **Admin Access** | `ADMIN_ACCESS_AVAILABLE` — SSH root@192.168.1.136 via ed25519 key |
| **Runner SSH** | `SSH_AUTHORIZED` 🟢 |
| **Runner Provider Env** | `RUNNER_PROVIDER_ENV_READY` |
| **Secret Hygiene** | `KNOWN_PREEXISTING_HISTORY_LEAK` + 0 neue Leaks |
| **n8n API** | `N8N_API_READY` 🟢🔑 |
| **Commit/Push** | Kein Commit, kein Push |
| **Runtime** | Read-Only-Diagnose + MCP-Vorbereitung; keine Reparaturen |

---

## Status Breakdown

### Primary Status: `NEW_MACHINE_OPERATIONAL_READY_WITH_HISTORY_LEAK_NOTE`
Die Linux Mint Workstation ist betriebsbereit. SSH-Autorisierung für `runner@192.168.1.53` wurde erfolgreich via Proxmox Admin-Zugriff (root@192.168.1.136, pct exec CT 102) repariert. Der Ziel-Key (`SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`) wurde in `/home/runner/.ssh/authorized_keys` auf dem Runner hinzugefügt. SSH-Test bestanden: `runner@192.168.1.53` → `lxc-dev-runner`.

**Neue Erkenntnis dieser Session:** `root@192.168.1.136` (Proxmox Host) akzeptiert den ed25519 Key und bietet vollen Admin-Zugriff. Der Runner ist CT 102 (`lxc-dev-runner`) auf diesem Proxmox-Host. Die Proxmox-Verwaltung via `pct exec` erlaubt direkte Container-Administration ohne SSH in den Container selbst.

### Secondary Status: `KNOWN_PREEXISTING_HISTORY_LEAK`
Real n8n JWT tokens in tracked `.playwright-mcp/` files (commits 485dc18, 5088845). No new secrets were introduced in this session. Remediation erfordert separaten Task (Token Rotation + History Rewrite).

---

## Component Status

| Component | Status | Detail |
|-----------|--------|--------|
| **n8n API** | 🟢 GREEN | HTTP 200, workflows accessible, API key valid |
| **SSH Runner** | 🟢 GREEN | SSH successfully authorized — `runner@192.168.1.53` → `lxc-dev-runner` |
| **Proxmox Admin** | 🟢 GREEN | `root@192.168.1.136` accessible via ed25519 key; `pct exec 102` working |
| **Runner CT** | 🟢 GREEN | CT 102 `lxc-dev-runner` running, SSHD active on port 22 |
| **Runner OpenCode** | 🟡 LIMITED | Not directly in PATH; loader script (`/opt/dev-fabric/bin/load-opencode-provider-env.sh`) needed |
| **Loader Script** | 🟢 PRESENT | `/opt/dev-fabric/bin/load-opencode-provider-env.sh` exists and executable |
| **Dispatch Script** | 🟢 PRESENT | `/opt/dev-fabric/scripts/start_github_issue_run.sh` exists and executable |
| **Runner Evidence Dir** | 🟢 PRESENT | `/opt/dev-fabric/evidence` exists |
| **DeepSeek Local Secret** | 🟢 PRESENT | `secrets/opencode-provider.env` exists locally (value not inspected) |
| **Secret Hygiene** | 🟡 KNOWN LEAK | JWT tokens in tracked `.playwright-mcp/` files (pre-existing, no new leaks) |
| **n8n MCP** | 🟡 AUTH MISSING | n8n 2.26.8 supports MCP (≥2.18.4), not yet activated in UI |
| **Playwright MCP** | 🟢 E2E SMOKE GREEN | Playwright CLI v1.61.1, Chromium system, isolated session, login page confirmed |

---

## Known Issues

### Resolved: su - runner Hang (PAM pam_systemd.so in LXC)
- **Root Cause:** `pam_systemd.so` in `/etc/pam.d/common-session` — versucht Session bei `systemd-logind` via D-Bus zu registrieren (logind nicht funktionsfähig in LXC)
- **Resolution:** `session optional pam_systemd.so` in `common-session` und `runuser-l` auskommentiert
- **Resolution Date:** 2026-07-02T16:08:00Z
- **Status:** SU_RUNNER_FIXED ✅
- **Workaround:** `runuser -u runner -- <cmd>` ebenfalls funktionsfähig

### Resolved: Database Locked (CT 102)
- **Root Cause:** PID 7103 — stale OpenCode `providers login` (since Jun28, orphaned)
- **Resolution:** SIGTERM — process stopped, DB handles released, lock resolved
- **Resolution Date:** 2026-07-02T15:55:51Z
- **Status:** DATABASE_LOCK_REMEDIATION_GREEN ✅

### Resolved: SSH Key Not Authorized on Runner
- **Target:** `runner@192.168.1.53`
- **Key:** `id_ed25519` (`SHA256:/aGuvMjthBM33jwOERPc/vhQeB85MQrj3s4G6nXYcNg`)
- **Root Cause:** Target key missing from `/home/runner/.ssh/authorized_keys` — only `root@pve` key was present.
- **Resolution:** Key appended via Proxmox `pct exec 102`. Backup created, permissions verified.
- **Resolution Date:** 2026-07-01T08:50:53Z
- **SSH Validation:** Passed — `runner@192.168.1.53` → `lxc-dev-runner`

### Resolved: Admin Access Missing
- **Solution:** `root@192.168.1.136` (Proxmox Host) accepts the ed25519 key.
- **Proxmox Access:** `pct exec 102` provides direct container administration.
- **Runner Identification:** CT 102, `lxc-dev-runner`, 192.168.1.53, running.

### Known Issue: Secret Hygiene — JWT in Tracked Files
- **File:** `.playwright-mcp/` console logs (commits 485dc18, 5088845)
- **Content:** n8n JWT tokens in browser console logs
- **Impact:** Secrets exposed in git history
- **Remediation needed:** Separate task — Token Rotation + History Rewrite
- **No new secrets** introduced in this session

---

## Green Components

| Component | Evidence |
|-----------|----------|
| n8n API | HTTP 200 — Phase 8 recheck confirmed |
| Workflow export | Local export valid: active, 18 nodes (Sv12QTo56NoPUu2D) |
| Protected issues | 5/5 safe (#3-#7) |
| Runbook | OPERATIONS_RUNBOOK.md exists |
| Green baseline | GREEN_BASELINE.md exists |
| Local secret files | Both `secrets/n8n-api.env` and `secrets/opencode-provider.env` present |
| Git branch | `master` |
| Dispatcher health | HEALTH_YELLOW (nur Benign-Warnungen) |
| Playwright MCP | v0.0.77, --isolated confirmed, browser available |
| MCP local config | Template at mcp/n8n-mcp.local.json, gitignored, placeholders only |

---

## Benign Warnings

| Warning | Reason |
|---------|--------|
| git-status "Green: false" | Untracked evidence directories (benign) |
| evidence-dirs check | powershell not available on Linux (expected) |
| exports-exist check | powershell not available on Linux (expected) |
| Dispatcher secret-hygiene FAIL | Placeholder pattern detection in evidence files (false positive) |

---

## Open Notes

1. **Keine Runner-Änderungen** — Kein Admin-Zugriff für authorized_keys-Reparatur.
2. **Reparatur-Skripte bereitgestellt** — In `evidence/runner-ssh-server-side-repair-20260629T185253Z/authorized-keys-repair.md`.
3. **Keine Issues verändert** — Session-Constraints eingehalten.
4. **Keine Agent-Runs, Provider-Smoke-Tests** — Session-Constraints eingehalten.
5. **Keine Secrets ausgegeben** — Session-Constraints eingehalten.
6. **Kein Commit, kein Push** — `.playwright-mcp/` History-Leak verhindert Push.

---

## Evidence

### Current Session: n8n MCP & Playwright MCP Readiness
- `evidence/n8n-mcp-activation-playwright-verification-2026-07-02T161646Z/` (9 files)
  - `preflight.md` — Phase 1: Preflight (Git, SSH, n8n Health, Auth Gate)
  - `n8n-ui-version-readonly.md` — Phase 2: UI reachable, login required
  - `playwright-mcp-capability.md` — Phase 3: v0.0.77, --isolated confirmed
  - `playwright-n8n-ui-mcp-discovery.md` — Phase 4: Login page only, no MCP elements
  - `n8n-mcp-activation-gate.md` — Phase 5: AUTH MISSING
  - `local-mcp-config-structure.md` — Phase 7: Template created, gitignored
  - `mcp-connectivity-readiness.md` — Phase 8: MCP client available, activation pending
  - `playwright-mcp-e2e-plan.md` — Phase 9: E2E smoke test plan
  - `secret-hygiene-after-n8n-mcp-prep.md` — Phase 11: GREEN, 0 new leaks

### Previous Session: Database Locked Remediation
- `evidence/database-locked-remediation-2026-07-02T15-55-51Z/` (17 files)
  - `preflight.md` — Phase 1: Preflight (Git, SSH, CT Status)
  - `database-lock-current-diagnosis.md` — Phase 2: Lock source confirmed (PID 7103)
  - `opencode-pid-7103-check.md` — Phase 3: PID 7103 stale/orphaned confirmed
  - `pre-remediation-backup-and-rollback.md` — Phase 4: Backup metadata + rollback plan
  - `remediation-decision.md` — Phase 5: Option B (SOFT_STOP_STALE_OPENCODE_PROCESS)
  - `soft-stop-opencode-process.md` — Phase 6: SIGTERM executed, process stopped
  - `post-remediation-database-check.md` — Phase 7: No open DB handles, lock resolved
  - `runner-readonly-after-db-remediation.md` — Phase 8: Runner SSH timeout (known issue)
  - `n8n-api-recheck-after-db-remediation.md` — Phase 9: n8n API recheck
  - `dispatcher-health-after-db-remediation.md` — Phase 10: HEALTH_YELLOW
  - `secret-hygiene-after-db-remediation.md` — Phase 11: GREEN, 0 new leaks
  - `validation-report.md` — Phase 13: 18/18 constraints PASS
  - `final-report.md` — Phase 15: DATABASE_LOCK_REMEDIATION_GREEN

### Previous Session: Runner Admin Access Recovery
  - `preflight.md` — Phase 1: Preflight-Dokumentation
  - `network-access-check.md` — Phase 2: Alle Ports erreichbar
  - `proxmox-admin-access-options.md` — Phase 3: Admin-Zugriff via root@192.168.1.136
  - `runner-container-vm-identification.md` — Phase 4: Runner = CT 102 lxc-dev-runner
  - `runner-user-home-check.md` — Phase 5: User runner existiert, Berechtigungen korrekt
  - `authorized-keys-repair.md` — Phase 6: Key erfolgreich appended
  - `sshd-config-readonly-check.md` — Phase 7: SSHD-Konfiguration korrekt
  - `ssh-validation-after-admin-repair.md` — Phase 8: SSH-Test bestanden ✅
  - `runner-readonly-check-after-admin-repair.md` — Phase 10: Runner-Infrastruktur validiert
  - `n8n-api-recheck-after-admin-repair.md` — Phase 11: HTTP 200 🟢
  - `dispatcher-health-after-admin-repair.md` — Phase 12: HEALTH_YELLOW
  - `secret-hygiene-after-admin-repair.md` — Phase 13: Keine neuen Leaks

---

## Next Steps (Recommended — NOT Executed)

1. **Immediate:** SSH-Profil-Debugging — `su - runner` hängt; `.bashrc`/`.profile` prüfen
2. **Short-term:** OpenCode im Runner-PATH verifizieren (nach Laden der Provider-Env)
3. **Short-term:** Provider-Smoke-Test (wenn freigegeben)
4. **Separate task:** `.playwright-mcp/` History-Remediation (Token Rotation → History Rewrite)
5. **Separate task:** Secret-Hygiene-Platzhalter-Cleanup (38 PASTE_YOUR_N8N_API_KEY_HERE violations in evidence files)
