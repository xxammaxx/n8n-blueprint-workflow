# Linux Mint Operational Readiness

**Last Updated:** 2026-07-02T15:20:00Z  
**Session:** runner-post-ssh-stabilization-database-locked-n8n-mcp-playwright (Phases 1-24)  
**Agent:** Issue Orchestrator (Post-SSH-Stabilisierung + DB-Lock-Diagnose + MCP-Vorbereitung)

---

## Overall Status: **NEW_MACHINE_OPERATIONAL_READY_WITH_HISTORY_LEAK_NOTE**

Combined operational readiness: **READY** 🟢 — SSH zum Runner GREEN, n8n API GREEN, Provider-Env strukturell READY. Neue Erkenntnisse: `su - runner` hängt (PAM-Problem, Workaround: `runuser`), `database locked` diagnostiziert (OpenCode SQLite auf CT 102 mit großer WAL), n8n MCP und Playwright MCP sind technisch unterstützt und Konzepte/Templates liegen vor. Alle neuen Dateien sind secret-clean. Kein Commit/Push (History-Leak).

---

## Status Decisions

| Decision | Value |
|----------|-------|
| **Primary** | `NEW_MACHINE_OPERATIONAL_READY_WITH_HISTORY_LEAK_NOTE` |
| **New Sub-Status** | `SU_RUNNER_HANG_CONFIRMED` — PAM/`su`-Problem, Workaround `runuser` |
| **New Sub-Status** | `DATABASE_LOCK_RUNNER_CT102_SUSPECTED` — OpenCode SQLite, kein Repair |
| **New Sub-Status** | `N8N_MCP_CAPABLE` — n8n 2.26.8, MCP unterstützt, nicht aktiviert |
| **New Sub-Status** | `PLAYWRIGHT_MCP_CAPABLE` — `@playwright/mcp` installierbar, `--isolated` |
| **New Sub-Status** | `MCP_BUILD_PROCESS_PREPARED` — Architektur, Templates, Pläne erstellt |
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

---

## Known Issues

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

## Evidence (This Session)

- `evidence/runner-admin-access-recovery-20260629T191154Z/` (12 files)
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
