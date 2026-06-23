# Evidence Report — github-source-of-truth-intake-20260623T120000Z

## Status: GREEN_PARTIAL

**Session ID:** github-source-of-truth-intake
**Completed:** 2026-06-23T12:00:00Z
**Orchestrator:** issue-orchestrator (opencode)
**Previous Session:** opencode-runner-integration

---

## 1. Git Repository

| Field | Value |
|-------|-------|
| Local path | `C:\n8n-blueprint-workflow` |
| GitHub URL | `https://github.com/xxammaxx/n8n-blueprint-workflow` |
| Remote branch | `main` |
| Previous commit | `01f1c67` |
| New commit | (pending push) |
| Push status | ⚠️ pending |

## 2. GitHub Source of Truth — Architecture

| Component | Status |
|-----------|--------|
| GitHub Issue als Auftrag | ✅ eingerichtet |
| GitHub Labels (14) | ✅ angelegt |
| Issue Template | ✅ `.github/ISSUE_TEMPLATE/agent-task.yml` |
| n8n Workflow | ✅ `github-issue-intake.export.json` |
| Runner Script | ✅ `start_github_issue_run.sh` |
| RUN_INPUT Schema | ✅ um GitHub SoT erweitert |
| Evidence Comment Format | ✅ definiert |

## 3. GitHub Labels

| Label | Status |
|-------|--------|
| `agent:queued` | ✅ created |
| `agent:ready` | ✅ created |
| `agent:running` | ✅ created |
| `agent:blocked` | ✅ created |
| `agent:needs-review` | ✅ created |
| `agent:done` | ✅ created |
| `evidence:attached` | ✅ created |
| `human-approval-required` | ✅ created |
| `mode:manual-terminal` | ✅ created |
| `mode:opencode-run` | ✅ created |
| `mode:hermes-review` | ✅ created |
| `risk:low` | ✅ created |
| `risk:medium` | ✅ created |
| `risk:high` | ✅ created |

## 4. GitHub Issue #1

| Field | Value |
|-------|-------|
| Issue Number | #1 |
| URL | `https://github.com/xxammaxx/n8n-blueprint-workflow/issues/1` |
| Title | `feat: GitHub als Source of Truth für n8n/Runner-Agentenläufe einführen` |
| Labels | `agent:queued`, `mode:manual-terminal`, `risk:medium`, `human-approval-required`, `enhancement` |
| Start Comment | ✅ posted (`#issuecomment-4778421398`) |

## 5. Documentation Created

| File | Lines/Bytes |
|------|-------------|
| `docs/github-source-of-truth.md` | Architecture, Labelmodell, RUN_INPUT Contract, Evidence Comment Contract, Approval-Regeln |
| `docs/github-issue-intake-runbook.md` | Normalbetrieb (10 steps) + 9 Recovery-Szenarien |
| `docs/run-input-schema.md` | Vollständiges RUN_INPUT Schema mit GitHub SoT Extension |
| `.github/ISSUE_TEMPLATE/agent-task.yml` | 4405 bytes, 5 Pflichtfelder + Approvals |

## 6. Documentation Updated

| File | Changes |
|------|---------|
| `README.md` | GitHub SoT section, updated repo structure, infrastructure |
| `STATUS.md` | New session, GitHub SoT components, updated pending/blockers |
| `CHANGELOG.md` | New entry: GitHub Source of Truth Intake |
| `docs/architecture.md` | GitHub SoT architecture diagram + label model |
| `docs/security-boundaries.md` | GitHub API security boundaries + token requirements |

## 7. Scripts Created

| File | Lines | Validation |
|------|-------|------------|
| `scripts/start_github_issue_run.sh` | 471 | shebang ✅, set -euo pipefail ✅ |

## 8. n8n Workflow Created

| File | Nodes | Trigger |
|------|-------|---------|
| `workflows/github-issue-intake.export.json` | 9 | Manual Trigger (Fallback) |

**Node Chain:**
1. Manual Trigger (Fallback)
2. Validate Issue Contract (JS Code)
3. Prepare RUN_INPUT.json (JS Code)
4. SSH Write RUN_INPUT to Runner
5. SSH Start Runner Script
6. Wait (5s)
7. SSH Read status.json
8. Format Evidence Comment (JS Code)
9. Format Final Result (JS Code)

## 9. OpenCode Status

| Field | Value |
|-------|-------|
| OpenCode installed | ✅ v1.17.9 |
| Provider/Auth configured | ❌ No |
| `manual-terminal` mode | ✅ Default |
| `opencode-run` mode | ⚠️ Prepared but blocked (no provider) |
| Provider check in script | ✅ `start_github_issue_run.sh` detects and falls back |

## 10. Validation Results

| Check | Result |
|-------|--------|
| JSON Validation (8 workflow files) | ✅ ALL VALID |
| Shell Script Syntax (6 scripts) | ✅ ALL with shebang + set -e |
| `.github/workflows` absent | ✅ PASS (no directory) |
| Forbidden files | ✅ NONE FOUND |
| Private keys in repo | ✅ NONE FOUND |
| Tokens/passwords | ✅ NONE FOUND |
| Secret scan false positives | ✅ 2 hits — both in security check scripts (valid) |

## 11. Security Status

| Check | Status |
|-------|--------|
| No private keys | ✅ VERIFIED |
| No .env files | ✅ VERIFIED |
| No database files | ✅ VERIFIED |
| No credentials in JSON | ✅ VERIFIED |
| No GitHub Actions | ✅ VERIFIED |
| No force-push | ✅ VERIFIED |
| No SQL patches | ✅ VERIFIED |
| .gitignore enforced | ✅ VERIFIED |
| gh auth token masked | ✅ VERIFIED |

## 12. What the System Can Do Now

### New Capabilities

| Capability | Before | After |
|------------|--------|-------|
| GitHub Issues as agent tasks | ❌ | ✅ Issues + Labels + Template |
| Agent workflow labels | ❌ | ✅ 14 labels (agent:*, mode:*, risk:*) |
| n8n reads Issues for context | ❌ | ✅ Workflow prepared (Manual Trigger) |
| Issue → RUN_INPUT conversion | ❌ | ✅ JS Code validates + prepares |
| GitHub-aware Runner evidence | ❌ | ✅ `start_github_issue_run.sh` |
| Evidence Comment Format | ❌ | ✅ Standardized format |
| RUN_INPUT Schema with SoT | ❌ | ✅ source_of_truth=github |
| Approval Policy in contract | ❌ | ✅ 5 boolean gates (all default false) |
| Recovery Runbook | ❌ | ✅ 9 scenarios documented |

### Unchanged Constraints

| Constraint | Status |
|------------|--------|
| No push without approval | ✅ enforced |
| No PR without approval | ✅ enforced |
| No merge without approval | ✅ enforced |
| No GitHub Actions | ✅ enforced (.github/workflows absent) |
| No provider config without approval | ✅ enforced |
| No Hermes installation | ✅ deferred |
| OpenCode Provider/Auth missing | ✅ documented, not configured |

## 13. Open Constraints

1. **n8n GitHub API Credential fehlt** — Manual Trigger Fallback funktioniert, aber kein automatisierter GitHub Trigger
2. **OpenCode Provider/Auth nicht konfiguriert** — `mode=opencode-run` fällt auf `manual-terminal` zurück
3. **Hermes nicht installiert** — `mode=hermes-review` fällt auf `manual-terminal` zurück
4. **Kein echter End-to-End-Smoke-Test** — benötigt n8n Credential + Runner-Zugriff

## 14. Next Steps

1. **GitHub API Credential in n8n konfigurieren:**
   - Personal Access Token mit `repo` + `read:org` Scopes
   - Als n8n Credential `github-n8n-blueprint` speichern
   - GitHub Trigger Node aktivieren (statt Manual Trigger)

2. **Smoke-Test durchführen:**
   - Test-Issue mit `[agent] Smoke test GitHub source-of-truth intake` erstellen
   - Label `agent:ready` setzen
   - n8n Workflow ausführen
   - Evidence-Kommentar im Issue prüfen

3. **OpenCode Provider konfigurieren (separate Approval nötig):**
   - API-Key anfordern
   - `opencode providers login` ausführen
   - `mode=opencode-run` aktivieren

4. **Hermes installieren (optional, später):**
   - Separater, genehmigter Lauf

## 15. Files Changed

### Modified
- `CHANGELOG.md` — new entry
- `README.md` — GitHub SoT section + updated structure
- `STATUS.md` — updated session, components, pending
- `docs/architecture.md` — GitHub SoT architecture
- `docs/security-boundaries.md` — GitHub API boundaries

### Created
- `.github/ISSUE_TEMPLATE/agent-task.yml` — Issue template
- `docs/github-source-of-truth.md` — Architektur-Dokumentation
- `docs/github-issue-intake-runbook.md` — Betriebs-Runbook
- `docs/run-input-schema.md` — Schema-Dokumentation
- `scripts/start_github_issue_run.sh` — Runner-Script
- `workflows/github-issue-intake.export.json` — n8n Workflow

## 16. Bewertung

**GREEN_PARTIAL** — Die GitHub Source-of-Truth-Infrastruktur ist vollständig aufgebaut und dokumentiert. Alle Repo-Dateien, Scripts, Templates und der n8n Workflow sind vorbereitet. Zwei Blocker (n8n GitHub Credential und OpenCode Provider/Auth) benötigen separate Approval und sind im Runbook dokumentiert.
