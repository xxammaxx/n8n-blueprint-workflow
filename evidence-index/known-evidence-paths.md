# Known Evidence Paths

## Latest Entry (2026-06-26) — Dispatcher Manual Verification & Issue #3 Processing

| Property | Value |
|----------|-------|
| **Session** | `dispatcher-manual-verification-20260626` |
| **Run ID** | `gh-issue-3-20260626T073802Z` |
| **Workflow ID** | `Sv12QTo56NoPUu2D` |
| **Workflow Name** | GitHub Ready Issue -> Runner Agent Dispatch |
| **Workflow Nodes** | 15 |
| **Workflow Active** | ✅ YES — UI shows active (Manual Trigger only, no Schedule Trigger) |
| **Issue** | [#3](https://github.com/xxammaxx/n8n-blueprint-workflow/issues/3) — "[smoke] Scheduler-Dispatcher Dauerbetrieb" |
| **Execution** | #44 — Manual trigger, 1m 28.494s |
| **Nodes 1-14** | ✅ SUCCESS |
| **Node 15** | ❌ ERROR (pre-existing JS syntax error) |
| **Pre-state** | `agent:ready`, `mode:manual-terminal`, `risk:low` |
| **Post-state** | `agent:needs-review`, `evidence:attached`, `mode:manual-terminal`, `risk:low` |
| **Evidence Path** | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-3/gh-issue-3-20260626T073802Z/` |
| **status.json** | `GREEN_PARTIAL`, `source_of_truth=github`, `issue_number=3` |
| **Files** | `agent.log`, `commands.log`, `github-context.md`, `operator-commands.md`, `RUN_INPUT.json`, `RUN_INPUT.redacted.json`, `run-report.md`, `status.json` |
| **Total Files** | 8 |
| **Runner Script** | `/opt/dev-fabric/scripts/start_github_issue_run.sh` (755, bash -n PASS) |
| **Runner** | LXC 102 / lxc-dev-runner / 192.168.1.53 |
| **n8n Location** | CT 101 / 192.168.1.52 (corrected from previous Proxmox host assumption) |
| **Key Finding** | No Schedule Trigger in deployed workflow — only Manual Trigger |
| **Agent Run Result Comment** | Posted to Issue #3 |

---

## Previous Entry (2026-06-24) — GitHub Ready Issue Dispatcher + Mermaid Diagrams

| Property | Value |
|----------|-------|
| **Session** | `github-ready-dispatcher-20260624` |
| **Workflow ID** | `k1c2d3FfWHee6Jr0e` |
| **Workflow Name** | GitHub Ready Issue -> Runner Agent Dispatch |
| **Workflow Nodes** | 15 |
| **Workflow Active** | `false` (imported, not yet activated) |
| **Workflow JSON Path** | `workflows/github-ready-issue-dispatch.export.json` |
| **Trigger Strategy** | Polling (Schedule + GitHub Search API) — selected because internal network |
| **Mermaid Diagrams** | `docs/architecture/github-source-of-truth-flow.md` (full dispatch flow + state machine + component map) |
| **System Map (standalone)** | `docs/architecture/system-map.mmd` |
| **Evidence Flow (standalone)** | `docs/architecture/evidence-flow.mmd` |
| **Smoke Test Issue** | #2 — created with `agent:ready` label, pending execution |
| **storageState** | ❌ Expired at `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json` |

**Guardrails documented:** Dual-start protection, label state machine, run ID idempotency.

---

## Previous Entry (2026-06-24) — Label Dataflow Fix: 12/12 GREEN

| Property | Value |
|----------|-------|
| **Session** | `label-dataflow-fix-20260624` |
| **Run ID** | `gh-issue-1-20260624T173000Z` |
| **Workflow ID** | `jb7BgKeWGee5Iq9d` |
| **Status** | `GREEN_PARTIAL_PLUS` |
| **Evidence Path** | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T173000Z/` |
| **Files** | `RUN_INPUT.json`, `RUN_INPUT.redacted.json`, `status.json`, `run-report.md`, `commands.log`, `agent.log`, `github-context.md`, `operator-commands.md` |
| **Total Files** | 8 |
| **Workflow Nodes** | 12 (**12/12 GREEN**) |
| **GitHub Comment** | ✅ LIVE VERIFIED — posted to Issue #1 |
| **GitHub Add Labels** | ✅ HTTP 200 — `agent:needs-review`, `evidence:attached` added |
| **GitHub Remove Label** | ✅ HTTP 404 tolerated (`continueOnFail: true`) |
| **Cross-Node Reference Pattern** | ✅ FIXED — Nodes 11/12 use `$('Prepare RUN_INPUT.json').first().json.*` |
| **Expression Mode** | ✅ APPLIED on Nodes 4, 5, 7 |
| **storageState** | ✅ Playwright persistent session works — no login needed |

---

## Previous Entry (2026-06-24) — Node 5 Credential Fix + 12-Node Live Test

| Property | Value |
|----------|-------|
| **Session** | `node5-credential-live-test-20260624` |
| **Run ID** | `gh-issue-1-20260624T152337Z` |
| **Workflow ID** | `jb7BgKeWGee5Iq9d` |
| **Status** | `GREEN_PARTIAL` |
| **Evidence Path** | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T152337Z/` |
| **Files** | `RUN_INPUT.json`, `RUN_INPUT.redacted.json`, `status.json`, `run-report.md`, `commands.log`, `agent.log`, `github-context.md`, `operator-commands.md` |
| **Total Files** | 8 |
| **Workflow Nodes** | 12 (10/12 green) |
| **GitHub Comment** | ✅ LIVE VERIFIED — Comment #4790885907 posted |
| **GitHub Labels** | ❌ FAILED — Node 11 data flow issue |
| **Expression Mode** | ✅ APPLIED on Nodes 4, 5, 7 |
| **storageState** | ✅ Playwright persistent session works — no login needed |

---

## Historical Entry (2026-06-24) — GitHub Comment & Label Automation

| Property | Value |
|----------|-------|
| **Session** | `n8n-github-comment-label-automation` |
| **Run ID** | `gh-issue-1-20260624T123123Z` (latest runner evidence) |
| **Workflow ID** | `h78eENwLGwr2QUmU` |
| **Status** | `GREEN_PARTIAL_PLUS` |
| **Evidence Path** | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T123123Z/` |
| **Files** | `status.json`, `run-report.md`, `commands.log`, `agent.log`, `github-context.md`, `RUN_INPUT.json`, `RUN_INPUT.redacted.json`, `operator-commands.md` |
| **Total Files** | 8 |
| **Workflow Nodes** | 12 (9 core + 3 GitHub API: Comment, Add Labels, Remove Label) |
| **GitHub Credential** | `github-n8n-blueprint` (⚠️ unverified — needs n8n UI login) |
| **n8n Auth Strategy** | Documented in `docs/n8n-auth-automation.md` |

---

## Historical Entry (2026-06-24) — SSH Command Mode Validation

| Property | Value |
|----------|-------|
| **Session** | `n8n-github-issue-intake-ssh-validation` |
| **Run ID** | `gh-issue-1-20260624T104034Z` |
| **Workflow ID** | `h78eENwLGwr2QUmU` |
| **Status** | `GREEN_PARTIAL` |
| **Evidence Path** | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T104034Z/` |
| **Files** | `status.json`, `run-report.md`, `commands.log`, `agent.log`, `github-context.md`, `RUN_INPUT.json`, `preflight.md`, `summary.json` |
| **Total Files** | 8 |
| **SSH Write** | `mkdir -p` + `base64 -d` + `jq`, 779 bytes ✅ |
| **SSH Start** | `--input-json` flag, exit_code 0 ✅ |
| **SSH Read** | Retry loop (30x2s), `GREEN_PARTIAL` found ✅ |
| **Wait Node** | "After Time Interval", 5 seconds ✅ |
| **Expression Mode** | Required for all SSH nodes (fx toggle) ✅ |

---

## Historical Entry (2026-06-21) — Republish & Rematerialize

1. Status: BLOCKED_WITH_DIAGNOSIS
2. Backup-Pfad: /opt/dev-fabric/n8n/backups/republish-rematerialize-20260621T180701Z
3. Zielworkflow-IDs und Namen:
- blueprint-speckit-opencode-bootstrap | Blueprint ??? SpecKit/OpenCode Bootstrap
- 7BdoKSsnOhApjEP8 | My workflow 2 (`debug-minimal-form-ui`, treated as approved target `DEBUG Minimal Form UI`)
- Kein `UI-FORM-FIX`-Workflow vorhanden
4. Publish-/Unpublish-/Republish-Befehle mit Exit-Codes:
- `n8n publish:workflow --id=blueprint-speckit-opencode-bootstrap` => 0
- `n8n publish:workflow --id=7BdoKSsnOhApjEP8` => 0
- `n8n unpublish:workflow --id=blueprint-speckit-opencode-bootstrap` => 0
- `n8n publish:workflow --id=blueprint-speckit-opencode-bootstrap` => 0
5. DB-Counts vorher/nachher:
- `workflow_entity`: 3 -> 3
- `workflow_published_version`: 0 -> 0
- `webhook_entity`: 0 -> 2
6. Published Export vorher/nachher:
- Vorher: Blueprint hatte einen published export; Debug-Workflow hatte keinen published export
- Nachher: `n8n export:workflow --all --published` exportierte 2 Workflows
7. n8n Status nach Restart:
- Erster Restart: `active (running)`, PID 2298, Startzeit `2026-06-21 18:09:42 UTC`
- Zweiter Restart: `active (running)`, PID 2401, Startzeit `2026-06-21 18:12:04 UTC`
8. Relevante Startup-Logs:
- Erster Restart: `Finished building workflow dependency index. Processed 0 draft workflows, 1 published workflows.`
- Erster Restart: `Activated workflow "My workflow 2" (ID: 7BdoKSsnOhApjEP8)`
- Beide Restarts: `No webhook path could be found for node "Form Trigger ??? Bitte Blueprint eingeben" in workflow "blueprint-speckit-opencode-bootstrap".`
- Zweiter Restart: `Finished building workflow dependency index. Processed 0 draft workflows, 0 published workflows.`
- Blueprint-HTTP-Recheck blieb `GET blueprint-speckit-bootstrap is not registered`
9. Ergebnis `/form/debug-minimal-form-ui`:
- HTTP 200 OK
- Formular l??dt erfolgreich
10. Ergebnis `/form/blueprint-speckit-bootstrap`:
- HTTP 404 Not Found
- `Problem loading form`
11. Ob Runtime-Materialisierung wiederhergestellt wurde:
- Nur teilweise
- Debug-Form wurde materialisiert
- Produktions-Blueprint-Form wurde nicht materialisiert
12. Wahrscheinlichste Ursache nach diesem Lauf:
- Die offizielle n8n-Publish-Mechanik funktioniert grunds??tzlich, aber der Blueprint-Workflow verbleibt in einem workflow-spezifischen inkonsistenten Publish-/Runtime-Zustand. Die Kombination aus `workflow_published_version=0`, dauerhaftem Blueprint-`No webhook path could be found`, widerspr??chlichen Startup-Z??hlwerten und gleichzeitig funktionierendem Debug-Form-Workflow spricht gegen einen globalen Publish-Defekt und f??r einen engeren Defekt am Blueprint-Workflow selbst.
13. Sicherheitsstatus:
- Nur freigegebene Ma??nahmen ausgef??hrt: Backup, Workflow-Export, offizielle n8n Publish-/Unpublish-Kommandos f??r die Zielworkflows, kontrollierte Restarts, read-only SQLite-Checks und HTTP-/Log-Rechecks.
- Keine direkten SQL-Updates, keine Workflow-L??schungen, keine Secret-Exporte, keine Container-/Firewall-/SSH-??nderungen.
14. N??chster sinnvoller Schritt:
- Neue Approval f??r eine noch gezieltere offizielle n8n-Remediation nur f??r den Blueprint-Workflow, z. B. versionsspezifisches Publish, kontrollierte n8n-seitige Duplikation/Re-Import oder ein minimaler publizierbarer Klon des Blueprint-Form-Triggers zur Isolierung des blockierenden Zustands.
15. Welche weitere Approval n??tig w??re:
- Approval f??r zus??tzliche offizielle n8n-Schreibaktionen ??ber diesen Lauf hinaus, die den Blueprint-Workflow n8n-seitig rekonstruieren oder ersetzen d??rfen, weiterhin ohne rohe SQL-Manipulation.
16. Was kann das System jetzt im Vergleich zum vorherigen Lauf?
- Gegen??ber dem vorherigen Restart-only-Lauf kann das System jetzt `/form/debug-minimal-form-ui` erfolgreich ausliefern und hat nicht mehr `webhook_entity=0` sondern `webhook_entity=2`. Die produktive Blueprint-Form bleibt weiterhin blockiert.

Kurzfazit:
- Dieser Lauf widerlegt einen totalen Defekt der Publish-Mechanik.
- Offizielle n8n-CLI-Publish-Aktionen k??nnen Runtime-/Webhook-Materialisierung f??r den Debug-Workflow herstellen.
- Der verbleibende Blocker ist jetzt deutlich enger auf den Blueprint-Workflow isoliert.
