# Spec Kit / OpenCode / n8n / Proxmox Runner Orchestrator

Status: `GREEN_BASELINE_FROZEN`

Aktueller Laufstatus am `2026-06-27 13:25Z`: `GREEN_BASELINE_FROZEN` (Post-Green Stabilization abgeschlossen: Snapshot exportiert, Runbook erstellt, Health Check operational, Secret Hygiene bestätigt)

Dieses Projekt ist ein n8n-Orchestrator fuer `Blueprint -> OpenCode -> Spec Kit` ueber SSH und `docker exec`. Der bekannte Proxmox-Host ist `192.168.1.136`. Proxmox wird dabei nicht veraendert; der Workflow nutzt SSH nur fuer einen kontrollierten Docker-Hop zum Runner-Host.

Aktuell belegte n8n-Basis:

- `http://192.168.1.52:5678`
- `GET /healthz -> 200`
- `GET /rest/settings -> 200`
- `GET /api/v1/workflows -> 200` (authentifiziert)
- `GET /rest/workflows -> 401` (anonym)
- `GET /rest/credentials -> 401` (anonym)

Letzter Scan (`2026-06-26 09:47`):

- API-Key vorhanden: **nein** (nicht in dieser Session gesetzt)
- API-Status: **N8N_API_AUTH_MISSING**
- API-Key ausgegeben: **nein** (niemals in Dateien, Logs oder Evidence)
- Workflow-Status: **UNKNOWN** — Workflow nicht in n8n importiert
- Workflows in n8n gesamt: **8** (keiner mit erwartetem Namen)
- Entscheidung: **GREEN_PARTIAL_TOOL_GAP** (kein Live-POST)
- allowed_next_action: **STOP_AND_DOCUMENT**

Aktueller Blocker fuer den echten Webhook-basierten Live-Dry-Hop:

- **N8N_API_KEY nicht gesetzt** — muss in derselben PowerShell-Session vor dem Scan gesetzt werden
- **Workflow ist nicht in n8n importiert** — muss zuerst via UI oder API importiert werden
- Workflow-JSON ist validiert und sicher (`workflows/spec-kit-opencode-proxmox-runner-orchestrator.json`)
- Manuelle Import-Schritte dokumentiert in `evidence/n8n-workflow-import-confirmation.md`
- Auto-Scanentscheidung ist `GREEN_PARTIAL_TOOL_GAP` (wegen fehlendem Workflow und Auth)
- exakte Webhook-URL ist nur lokal aus Workflow-JSON ableitbar, nicht aus UI oder authentifizierter API bestaetigt
- Credential-Zuordnung `Proxmox Docker Host SSH` ist nicht per API bestaetigt (Workflow fehlt)
- Playwright MCP war in dieser Sitzung nicht direkt nutzbar
- `SPEC_KIT_ACCEPT_CREDENTIAL_METADATA_ONLY` ist nicht gesetzt

Bekannte Windows-Einschraenkung (OpenCode Task-Runner):

- Umgebungsvariablen mit `KEY` im Namen (wie `N8N_API_KEY`) werden vom Process-Environment-Block **gefiltert**
- `$env:N8N_API_KEY="wert"` setzt die Variable in der PowerShell-Session, aber `node` sieht `process.env.N8N_API_KEY` nicht
- **Workaround:** Alle Befehle (`$env:` setzen + `node scripts/...`) muessen im **selben** PowerShell-Befehl ausgefuehrt werden
- `[System.Environment]::SetEnvironmentVariable` hilft nicht — der Filter greift auf Process-Ebene

## Artefakte

- `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json`
- `scripts/remote_runner_orchestrator.sh`
- `scripts/container_pipeline.mjs`
- `scripts/build-workflow.mjs`
- `scripts/dry-run-local.mjs`
- `scripts/scan-n8n-live-readiness.mjs`
- `scripts/run-trusted-readiness-scan.mjs`
- `scripts/validate-local.mjs`
- `docs/proxmox-docker-runbook.md`
- `examples/payload.example.json`
- `examples/live-dry-hop-payload.example.json`
- `evidence/preflight-next-hardening.md`
- `evidence/validation-report-next-hardening.md`

## Architektur

Standardpfad:

`Webhook -> Normalize Input -> SSH Proxmox Preflight -> SSH Runner Execute -> docker exec n8n-runners -> OpenCode/Spec Kit -> JSON Response`

Der Workflow unterstuetzt:

- Variante A: Docker direkt auf `192.168.1.136`
- Variante B: Docker in Proxmox-VM/LXC oder auf separatem Docker-Host
- Variante C: Zielhost unbekannt, Rueckgabe `TOOL_GAP`

## Offizieller Spec Kit Default

Der normale Standardbetrieb benoetigt kein geratenes `spec_kit_plugin_module`.

Offizieller Default:

```text
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@${SPEC_KIT_VERSION}
specify version
specify init --here --integration opencode --script sh --force
specify integration list
```

OpenCode wird danach ueber die von Spec Kit eingerichtete `opencode`-Integration betrieben. Der aktuell lokal belegte Fallback ist Slash-Command-Modus unter `.opencode/commands`.

Optional:

- `spec_kit_install_command` als Advanced Override
- `spec_kit_plugin_module` als Custom-Plugin-Override
- `prefer_spec_kit_skills=true` als expliziter Probe-Wunsch

Wichtig: Skills sind fuer den aktuell lokal verifizierten `opencode`-Pfad nicht der Default. Wenn die installierte Spec-Kit-Version `--integration-options="--skills"` fuer `opencode` nicht akzeptiert, faellt die Pipeline auf `.opencode/commands` zurueck.

## Setup

1. `node scripts/build-workflow.mjs`
2. `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json` in n8n importieren
3. Zwei SSH-Credentials in n8n zuordnen:
   - `SSH Proxmox Preflight` zeigt auf `192.168.1.136`
   - `SSH Runner Execute` zeigt auf den Docker-/Runner-Zielhost
4. Sicherstellen, dass der Runner-Container `n8n-runners` heisst oder im Payload ueberschrieben wird
5. Sicherstellen, dass der Runner-Container mindestens `node`, `npm`, `git`, `uv` und eine persistente Workspace-Root `/workspace` hat
6. OpenCode-Provider-Credentials nur als Runtime-Environment bereitstellen, nie im Repository

## Webhook-Payload

Ein Beispiel fuer den normalen Lauf liegt in [examples/payload.example.json](/C:/Spec-kit_n8n/examples/payload.example.json).

Wichtige Felder:

- `project_slug`
- `proxmox_host`
- `docker_target_host`
- `docker_target_mode`
- `runner_container_name`
- `project_root`
- `spec_kit_version`
- `enable_optional_quality_gates`
- `enable_taskstoissues`
- `enable_implement`
- `enable_converge`
- `prefer_spec_kit_skills`
- `dry_run`
- `live_dry_hop_only`
- `allow_install_in_dry_hop`
- `blueprint_markdown`

Optionale Advanced Overrides:

- `spec_kit_install_command`
- `spec_kit_plugin_module`
- `opencode_install_command`

## Kontrollierter Live-Dry-Hop

Zweck:

- SSH- und Docker-Hop pruefen
- `docker exec` in `n8n-runners` pruefen
- Workspace `/workspace` pruefen
- Canary-Datei unter `/workspace/_speckit_n8n_live_dry_hop_canary/.runtime/live-dry-hop.txt` schreiben
- Tool-Discovery fuer `node`, `npm`, `git`, `python3`, `uv`, `opencode`, `specify` ausfuehren

Voraussetzungen:

- n8n Workflow importiert
- n8n Credential `Proxmox Docker Host SSH` gesetzt
- Webhook-Endpunkt aus UI oder authentifizierter API eindeutig bestaetigt
- Runner-Container `n8n-runners` laeuft
- `/workspace` ist im Runner vorhanden und persistent

Payload:

- [examples/live-dry-hop-payload.example.json](/C:/Spec-kit_n8n/examples/live-dry-hop-payload.example.json)
- `dry_run=true`
- `live_dry_hop_only=true`
- `enable_implement=false`
- `enable_taskstoissues=false`
- `enable_converge=false`

Erwartete JSON-Response:

- `phase=live_dry_hop_complete`
- `ok=true`
- `canary_written=true`
- `no_build_executed=true`
- `no_spec_kit_commands_executed=true`
- `no_taskstoissues_executed=true`
- `no_implement_executed=true`
- `tools[]` mit Versions- oder `MISSING_TOOL`-Status

Woran man erkennt, dass kein echter Build lief:

- Es wird nur in den Canary-Ordner geschrieben
- es gibt keine `specify init`-, `specify plan`- oder `opencode run`-Schritte
- `blocked_actions` zeigt geblockte Build-Aktionen

Fehlende Tools:

- `opencode` oder `specify` fehlen -> `MISSING_TOOL`
- ohne `allow_install_in_dry_hop=true` erfolgt keine automatische Installation
- mit `allow_install_in_dry_hop=true` darf nur ein kontrollierter Install-Versuch fuer diese Tools erfolgen

Der naechste Schritt nach erfolgreichem Dry-Hop ist ein getrennt freigegebener echter E2E-Lauf mit dem normalen Payload.

Aktueller naechster Schritt (nach diesem Lauf):

0. **PowerShell:** `$env:N8N_API_KEY="<key>"` setzen (in derselben Session wie die folgenden Schritte)
1. **Workflow manuell importieren:** n8n UI oeffnen (`http://192.168.1.52:5678`), Workflows → Import from File → `C:\Spec-kit_n8n\workflows\spec-kit-opencode-proxmox-runner-orchestrator.json`
2. **Credential zuordnen:** SSH-Credential `Proxmox Docker Host SSH` in n8n erstellen/zuordnen
3. **Workflow aktivieren:** Inactive → Active in n8n UI
4. `node scripts/run-trusted-readiness-scan.mjs` ausfuehren
5. Bei `READY_FOR_LIVE_POST` + `POST_LIVE_DRY_HOP`: Live-Dry-Hop-POST senden

Details in den Evidence-Dokumenten:
- `evidence/workflow-import-preflight.md` — Preflight-Check
- `evidence/workflow-import-local-gates.md` — Lokale Gates
- `evidence/workflow-json-before-import-validation.md` — JSON-Validierung
- `evidence/n8n-workflow-import-confirmation.md` — Manuelle Import-Schritte
- `evidence/n8n-ssh-credential-assignment.md` — Credential-Zuordnung
- `evidence/n8n-workflow-activation.md` — Aktivierungsbedingungen
- `evidence/post-import-trusted-scan-result.md` — Post-Import Scan
- `evidence/live-dry-hop-readiness-check.md` — 20 Bedingungen fuer Live-POST
- `evidence/post-import-final-gates.md` — Finale Gates

## Windows HTTP Diagnose

Zur Diagnose von Windows-/Node-HTTP-Widerspruechen gibt es:

```powershell
node scripts/diagnose-n8n-http.mjs
```

Das Script schreibt:

- `evidence/n8n-http-diagnosis.json`
- `evidence/n8n-http-diagnosis.md`

Erwartung ohne API-Key:

- `node_fetch_healthz -> 200`
- `node_fetch_rest_settings -> 200`
- `node_http_request_healthz -> 200`
- `decision=N8N_BASE_REACHABLE`

Wichtig:

- fehlender `N8N_API_KEY` darf nur zu `N8N_API_AUTH_MISSING` fuehren
- fehlender `N8N_API_KEY` darf nicht `N8N_BASE_UNREACHABLE` bedeuten
- ein Live-POST bleibt gesperrt, bis `scan-n8n-live-readiness.mjs` maschinenlesbar `READY_FOR_LIVE_POST` und `POST_LIVE_DRY_HOP` liefert

## Stabiler Scanner-Entrypoint

Der autoritative Freigabepfad ist:

```powershell
node scripts/run-trusted-readiness-scan.mjs
```

Dieser Runner:

- importiert `diagnoseN8nHttp` und `scanN8nLiveReadiness`
- schreibt `evidence/trusted-readiness-scan.json`
- schreibt `evidence/trusted-readiness-scan.md`
- ist der einzige freigegebene Scanner-Pfad fuer Live-POST-Entscheidungen

Fuer den Vergleich zwischen direktem CLI-Pfad und stabilem Importpfad gibt es:

```powershell
node scripts/test-scanner-entrypoints.mjs
```

Das Script schreibt:

- `evidence/scanner-entrypoint-comparison.json`
- `evidence/scanner-entrypoint-comparison.md`

Erwartung ohne API-Key:

- Trusted Runner: `N8N_BASE_REACHABLE`
- API-Status: `N8N_API_AUTH_MISSING`
- Scanentscheidung: `GREEN_PARTIAL_TOOL_GAP`
- `allowed_next_action=STOP_AND_DOCUMENT`

Bekannte Grenze:

- in diesem gemanagten Agent-Kontext kann der direkte Dateipfad `node scripts/*.mjs` weiter von einem funktionierenden stdin-basierten Node-Importpfad abweichen
- wenn `test-scanner-entrypoints.mjs` `ENTRYPOINTS_INCONSISTENT_BUT_TRUSTED_OK` meldet, bleibt der Lauf ohne Zusatzfreigabe gesperrt
- `SPEC_KIT_ACCEPT_ENTRYPOINT_TOOL_GAP=true` darf nur gesetzt werden, wenn der direkte CLI-Pfad abweicht, aber `run-trusted-readiness-scan.mjs` konsistent gruen ist
- diese Tool-Gap-Akzeptanz erlaubt keinen Build, keine Issues, keine Proxmox-Aenderung und keinen Spec-Kit-Implementierungslauf

## Sicherheitsgrenzen

- Keine Secrets werden in Repository-Dateien geschrieben.
- Keine SSH-Keys, Passwoerter, Tokens oder API Keys werden hinterlegt.
- Keine destruktiven Proxmox- oder Docker-Kommandos.
- Keine VM-/LXC-/Volume-/Netzwerk-Loeschungen.
- Kein `--yolo`, kein Approval-Bypass.
- Blueprint-Transport nur als Datei, nicht unsicher inline im Shell-String.
- Ohne echte Credentials bleibt der Status `REAL_E2E_READY_PREPARED`, nicht `LIVE_VERIFIED`.

## Lokale Validierung

```powershell
node scripts/build-workflow.mjs
node scripts/dry-run-local.mjs
node scripts/validate-local.mjs
```

Der Dry-Run prueft lokal unter anderem:

- Payload-Defaults
- `project_slug`-Sanitizing
- kontrollierten Fehler bei leerem Blueprint
- offiziellen Spec-Kit-Defaultpfad
- `opencode`-Integrationspfad
- Blockade von `/speckit.implement` in Dry-Hop-Modi
- Guardrails fuer fehlenden Docker-Zugriff und fehlenden Runner-Container

## Authentifizierter n8n-Readiness-Scan

Der bevorzugte Reality-Check fuer die echte n8n-Instanz ist ein read-only API-Scan.

Regeln:

- `N8N_API_KEY` nur in der aktuellen Shell setzen
- `N8N_API_KEY` nie in Dateien, Logs oder Evidence schreiben
- der Scanner liest den Key nur aus dem Environment
- ohne bestaetigte API- oder UI-Evidence bleibt ein lokaler Webhook nur `LOCAL_ONLY_DERIVED`

Minimalbeispiel:

```powershell
$env:N8N_BASE_URL="http://192.168.1.52:5678"
$env:N8N_API_KEY="<nur in dieser Shell setzen>"
$env:SPEC_KIT_EXPECTED_WORKFLOW_NAME="Spec Kit OpenCode Proxmox Runner Orchestrator"
$env:SPEC_KIT_EXPECTED_WEBHOOK_PATH="spec-kit-opencode-proxmox-runner"
$env:SPEC_KIT_EXPECTED_CREDENTIAL_NAME="Proxmox Docker Host SSH"
node scripts/run-trusted-readiness-scan.mjs
```

**Wichtig fuer OpenCode Task-Runner / gemanagte Agent-Kontexte unter Windows:**
Umgebungsvariablen mit `KEY` im Namen werden vom Process-Environment-Block **gefiltert**.
`$env:N8N_API_KEY="wert"` und `node scripts/run-trusted-readiness-scan.mjs` muessen im **selben** PowerShell-Befehl stehen.
Getrennte `bash`-Tool-Calls sehen die Variable nicht.

Auswertung:

- erst bei `decision=READY_FOR_LIVE_POST`
- und `allowed_next_action=POST_LIVE_DRY_HOP`
- darf der echte Live-Dry-Hop-POST gesendet werden
- ein fehlender `N8N_API_KEY` darf nur `N8N_API_AUTH_MISSING` bedeuten, nicht `N8N_BASE_UNREACHABLE`

## Lokale API-Key-Datei

Seit dem `2026-06-26`-Update gibt es eine sichere lokale Secret-Datei-Struktur.
Du musst `N8N_API_KEY` nicht mehr manuell in jeder PowerShell-Session setzen.

### Dateien

| Datei | Zweck | Wird committed? |
|---|---|---|
| `.env.example` | Vorlage mit Platzhaltern | **Ja** (nur Platzhalter) |
| `.env.local` | Dein persönlicher API-Key | **Nein** (in `.gitignore`) |
| `scripts/load-local-env.ps1` | Lädt `.env.local` in die Session | **Ja** |
| `scripts/run-trusted-readiness-with-local-env.ps1` | Lädt Key + führt Scan aus | **Ja** |
| `scripts/validate-secret-hygiene.mjs` | Prüft, dass keine Secrets in Git-Dateien landen | **Ja** |

### Einrichtung

1. **`.env.local` öffnen** (im Projektroot):
   ```powershell
   notepad .env.local
   # oder: code .env.local
   ```

2. **Platzhalter ersetzen:**
   ```env
   N8N_API_KEY=PASTE_YOUR_N8N_API_KEY_HERE
   ```
   Ersetze `PASTE_YOUR_N8N_API_KEY_HERE` durch deinen echten n8n API-Key.

3. **Datei speichern und schließen.**

4. **Trusted Readiness Scan ausführen:**
   ```powershell
   cd C:\Spec-kit_n8n
   .\scripts\run-trusted-readiness-with-local-env.ps1
   ```

### Sicherheitsregeln

- `.env.local` ist in `.gitignore` eingetragen und wird **nie committed**.
- `.env.example` enthält **nur Platzhalter** — niemals echte Keys.
- `load-local-env.ps1` gibt **niemals** den API-Key aus (nur `loaded: yes`).
- `validate-secret-hygiene.mjs` prüft alle Dateien auf Secret-Leaks.
- **API-Key niemals in Chat, Git, Evidence oder Screenshots kopieren.**
- Bei versehentlichem Leak: **API-Key in n8n sofort rotieren** (n8n UI → Settings → API).

### Validierung der Secret-Hygiene

```powershell
node scripts/validate-secret-hygiene.mjs
```

Das Script prüft:
- `.gitignore` ignoriert `.env.local`
- `.env.example` enthält keinen echten Key
- README, Evidence, Workflows, Scripts enthalten keine Secrets
- Keine Dateien außerhalb erlaubter Templates enthalten den Platzhalter

Exit Code `0` = alles sauber. Exit Code `1` = Verstoß gefunden.

## Vorher: manuelles Setzen (Legacy)

Falls du die Variablen doch manuell setzen willst (z. B. für CI oder Ad-hoc-Tests):

```powershell
$env:N8N_BASE_URL="http://192.168.1.52:5678"
$env:N8N_API_KEY="<dein-key>"
$env:SPEC_KIT_EXPECTED_WORKFLOW_NAME="Spec Kit OpenCode Proxmox Runner Orchestrator"
$env:SPEC_KIT_EXPECTED_WEBHOOK_PATH="spec-kit-opencode-proxmox-runner"
$env:SPEC_KIT_EXPECTED_CREDENTIAL_NAME="Proxmox Docker Host SSH"
node scripts/run-trusted-readiness-scan.mjs
```

**Wichtig:** `$env:`-Setzen und `node`-Aufruf müssen im **selben** PowerShell-Befehl stehen (OpenCode-Problem mit `KEY`-gefilterten Variablen).

## Live E2E

Ein echter E2E-Run braucht:

- n8n SSH Credentials
- erreichbaren Proxmox-/Docker-Zielhost
- laufenden Runner-Container `n8n-runners`
- Workspace `/workspace`
- OpenCode-Provider-Credentials im Container

Die Live-Schritte stehen im Runbook unter `Live E2E Run nach Human Approval`.

## Troubleshooting

- `TOOL_GAP`: Docker-Zielhost ist nicht sauber konfiguriert oder ein Pflichttool fehlt.
- `DOCKER_UNREACHABLE`: Docker ist auf dem Zielhost nicht erreichbar.
- `RUNNER_CONTAINER_NOT_FOUND`: Der konfigurierte Runner-Container existiert nicht.
- `RUNNER_CONTAINER_NOT_RUNNING`: Der Container existiert, laeuft aber nicht.
- `WORKSPACE_NOT_FOUND`: `/workspace` fehlt im Runner.
- `CANARY_WRITE_FAILED`: Der Live-Dry-Hop durfte den Canary-Pfad nicht schreiben.
- `MISSING_TOOL`: Tool-Discovery hat ein fehlendes Tool kontrolliert gemeldet.
- `SPEC_KIT_INSTALL_FAILED`: Der offizielle `uv`-Pfad oder ein Override ist auf dem Runner nicht lauffaehig.
- `SPEC_KIT_INIT_FAILED`: `specify init --here --integration opencode --script sh --force` ist fehlgeschlagen.
- `SPEC_KIT_INTEGRATION_VERIFY_FAILED`: `.opencode/commands` oder die `opencode`-Integration wurden nicht verifiziert.
- `OPENCODE_STEP_FAILED`: OpenCode selbst oder die Slash-Commands sind im Runner nicht lauffaehig.
- `PAYLOAD_TOO_LARGE`: Blueprint fuer die aktuelle Base64-over-SSH-Strategie zu gross.
