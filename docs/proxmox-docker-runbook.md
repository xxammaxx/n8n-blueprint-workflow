# Proxmox / Docker / Runner Runbook

## Zielbild

Der Workflow nutzt zwei SSH-Schritte:

1. `SSH Proxmox Preflight` gegen `192.168.1.136`
2. `SSH Runner Execute` gegen den Docker-/Runner-Zielhost

Der Proxmox-Host wird nur lesend geprueft. Es gibt keine destruktiven Proxmox-Befehle, keine VM-/LXC-Erstellung und keine ungefragten Konfigurationsaenderungen.

## Aktuell belegte Live-Umgebung

Stand `2026-06-26`:

- n8n-Basis: `http://192.168.1.52:5678`
- `GET /healthz -> 200`
- `GET /rest/settings -> 200`
- `GET /rest/workflows -> 401`
- `GET /rest/credentials -> 401`
- Playwright MCP in dieser Sitzung: nicht direkt nutzbar
- Auto-Scanentscheidung: `GREEN_PARTIAL_TOOL_GAP`
- Live-Dry-Hop in diesem Lauf: nicht ausgefuehrt
- aktueller Blocker: Workflow-Importzustand, Credential-Zuordnung und exakte Webhook-URL sind nicht per UI oder authentifizierter API belegt
- aktueller API-Status in der laufenden Shell: `N8N_API_AUTH_MISSING`

## Varianten

### Variante A

Docker laeuft direkt auf dem Proxmox-Host.

- `SSH Proxmox Preflight` zeigt auf `192.168.1.136`
- `SSH Runner Execute` zeigt ebenfalls auf `192.168.1.136`
- Payload:
  `docker_target_host=192.168.1.136`
  `docker_target_mode=direct-proxmox-docker`

### Variante B

Docker laeuft in einer VM oder einem LXC auf Proxmox.

- `SSH Proxmox Preflight` zeigt auf `192.168.1.136`
- `SSH Runner Execute` zeigt auf die VM-/LXC-IP oder den separaten Docker-Host
- Payload:
  `docker_target_host=<VM_ODER_LXC_IP>`
  `docker_target_mode=separate-target-host`

### Variante C

Der Docker-/Runner-Zielhost ist unbekannt oder nicht erreichbar.

- Payload:
  `docker_target_mode=unknown-target`
  oder `docker_target_host` fehlt fuer den separaten Host

Erwartete Antwort:

`TOOL_GAP: Docker target host not configured or Docker not reachable from Proxmox host.`

## Runner-Annahmen

Der Zielhost braucht einen laufenden Container mit Standardname `n8n-runners` oder einem explizit gesetzten Alternativnamen.

Der Container sollte mindestens enthalten:

- `node`
- `npm`
- `git`
- `uv`
- persistente Workspace-Root `/workspace`
- OpenCode-Provider-Credentials als Runtime-Environment

Minimaler Compose-Hinweis:

```yaml
services:
  n8n-runners:
    image: node:22-bookworm
    container_name: n8n-runners
    command: ["sleep", "infinity"]
    working_dir: /workspace
    volumes:
      - ./workspace:/workspace
```

## Offizieller Spec Kit Default

Normaler Default:

```text
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@${SPEC_KIT_VERSION}
specify version
specify init --here --integration opencode --script sh --force
specify integration list
```

Der bisherige `spec_kit_plugin_module`-Pfad bleibt nur als optionaler Override erhalten.

## Skills vs Slash Commands

Aktuelle lokale Evidence:

- `specify init --here --integration opencode --script sh --force` funktioniert
- `specify init --here --integration opencode --integration-options="--skills" --script sh --force` scheitert lokal mit:
  `Unknown integration option '--skills'.`
- danach ist `.opencode/commands/` als funktionaler Fallback belegt

Deshalb bleibt der robuste Default fuer `opencode` aktuell Slash-Command-Modus ueber `.opencode/commands`.

## Payload-Transport

Der normalisierte Payload wird als JSON serialisiert, Base64-kodiert per SSH transportiert und auf dem Zielhost zuerst in eine Datei geschrieben. Innerhalb des Runner-Containers wird daraus entweder der normale Projektlauf oder der kontrollierte Live-Dry-Hop gestartet.

## Kontrollierter Live-Dry-Hop

Zweck:

- SSH- und Docker-Erreichbarkeit pruefen
- `docker exec n8n-runners` pruefen
- `/workspace` pruefen
- kontrollierten Canary-Schreibtest unter `/workspace/_speckit_n8n_live_dry_hop_canary` ausfuehren
- Tool-Discovery fuer `node`, `npm`, `git`, `python3`, `uv`, `opencode`, `specify` ausfuehren

Payload:

- [examples/live-dry-hop-payload.example.json](/C:/Spec-kit_n8n/examples/live-dry-hop-payload.example.json)
- `dry_run=true`
- `live_dry_hop_only=true`
- `enable_taskstoissues=false`
- `enable_implement=false`
- `enable_converge=false`

Verhalten:

- keine `specify init`-Ausfuehrung
- keine Spec-Kit-Slash-Commands
- keine GitHub-Issues
- keine Implementierung
- keine Proxmox-Aenderung

JSON-Erwartung:

- `phase=live_dry_hop_complete`
- `canary_written=true`
- `no_build_executed=true`
- `no_spec_kit_commands_executed=true`
- `no_taskstoissues_executed=true`
- `no_implement_executed=true`
- `tools[]` mit `ok`, `TOOL_VERSION_FAILED` oder `MISSING_TOOL`

Interpretation fehlender Tools:

- `opencode` oder `specify` fehlen -> `MISSING_TOOL`
- ohne `allow_install_in_dry_hop=true` erfolgt keine automatische Installation
- mit `allow_install_in_dry_hop=true` darf nur ein kontrollierter Install-Versuch fuer genau diese Tools erfolgen

## Authentifizierter n8n-Readiness-Scan

Der empfohlene Freigabepfad vor jedem echten Dry-Hop-POST ist der read-only Scan ueber die n8n Public API.

1. In n8n einen API-Key erzeugen.
2. Den Key nur in der aktuellen PowerShell-Session setzen.
3. Den Key niemals in Dateien, Evidence oder Repository-Inhalt schreiben.
4. Scanner ausfuehren:

```powershell
$env:N8N_BASE_URL="http://192.168.1.52:5678"
$env:N8N_API_KEY="<nur in dieser Shell setzen>"
node scripts/run-trusted-readiness-scan.mjs
```

5. Scanentscheidung pruefen.
6. Nur bei `READY_FOR_LIVE_POST` und `POST_LIVE_DRY_HOP` darf ein echter Webhook-POST erfolgen.

HTTP-Diagnoseerwartung:

- ohne API-Key trotzdem `N8N_BASE_REACHABLE`, wenn `/healthz` oder `/rest/settings` mit `200` erreichbar sind
- ohne API-Key nur `N8N_API_AUTH_MISSING`
- niemals `N8N_BASE_UNREACHABLE` nur wegen fehlender API-Authentifizierung

Entrypoint-Vergleich:

```powershell
node scripts/test-scanner-entrypoints.mjs
```

Erwartung ohne API-Key:

- Trusted Runner: `N8N_BASE_REACHABLE`
- Scanentscheidung: `GREEN_PARTIAL_TOOL_GAP`
- `allowed_next_action=STOP_AND_DOCUMENT`

Bekannte Grenze:

- der direkte Dateiaufruf `node scripts/diagnose-n8n-http.mjs` oder `node scripts/scan-n8n-live-readiness.mjs` kann in gemanagten Agent-Kontexten vom stabilen stdin-basierten Importpfad abweichen
- der autoritative Scanner-Runner fuer Live-Entscheidungen ist `node scripts/run-trusted-readiness-scan.mjs`
- wenn der Vergleich `ENTRYPOINTS_INCONSISTENT_BUT_TRUSTED_OK` meldet, keinen Live-POST senden, bis zusaetzlich `SPEC_KIT_ACCEPT_ENTRYPOINT_TOOL_GAP=true` in derselben Shell gesetzt wurde
- diese Tool-Gap-Akzeptanz erlaubt keinen Build, keine GitHub-Issues, keine Proxmox-Aenderung und keine Spec-Kit-Implementierung
- ein fehlender `N8N_API_KEY` darf nur `N8N_API_AUTH_MISSING` bedeuten, nicht `N8N_BASE_UNREACHABLE`

## Task-To-Issues

`/speckit.taskstoissues` laeuft nur, wenn beides zutrifft:

- `enable_taskstoissues=true`
- im Projekt existiert ein `origin`-Remote

Fehlt der Remote, wird der Schritt als `skipped` protokolliert.

## Live E2E Run nach Human Approval

Dieser Abschnitt ist nur Anleitung. Im aktuellen Lauf wurde kein Live-Run ausgefuehrt.

1. Workflow `workflows/spec-kit-opencode-proxmox-runner-orchestrator.json` in n8n importieren.
2. SSH Credential `Proxmox Docker Host SSH` fuer `192.168.1.136` setzen.
3. Pruefen, ob Docker direkt auf `192.168.1.136` laeuft oder in einer VM/LXC liegt.
4. Falls Docker nicht direkt auf Proxmox laeuft, separates SSH Credential fuer den Docker-/Runner-Zielhost setzen.
5. Auf dem Docker-Zielhost pruefen, dass `docker ps` den Container `n8n-runners` zeigt.
6. Im Runner pruefen, dass `/workspace` persistent gemountet ist und `node`, `npm`, `git`, `uv` verfuegbar sind.
7. Beispiel-Payload aus `examples/payload.example.json` an den n8n-Webhook senden.
   Vorher `node scripts/run-trusted-readiness-scan.mjs` ausfuehren und nur bei `READY_FOR_LIVE_POST` fortfahren.
8. JSON-Response auswerten:
   - `ok=true` bedeutet Pipeline auf Runner erfolgreich
   - `TOOL_GAP`, `RUNNER_CONTAINER_NOT_FOUND`, `SPEC_KIT_INSTALL_FAILED` usw. liefern maschinenlesbare Fehler
9. Im Runner-Arbeitsverzeichnis Artefakte pruefen:
   - `/workspace/<project_slug>/.inputs/blueprint.md`
   - `/workspace/<project_slug>/.opencode/commands/`
   - `/workspace/<project_slug>/.n8n-runs/<run-id>/logs/`
10. Rollback/Cleanup ohne destruktive Defaults:
   - nur den betroffenen Projektordner manuell reviewen
   - keine automatischen Container-, Volume-, Netzwerk-, VM- oder LXC-Loeschungen

## Fehlerdiagnose

- `TOOL_GAP`: Docker-Zielhost nicht konfiguriert, Docker nicht erreichbar oder ein Pflichttool fehlt.
- `DOCKER_UNREACHABLE`: Docker ist auf dem Zielhost nicht erreichbar.
- `RUNNER_CONTAINER_NOT_FOUND`: Containername falsch oder Container existiert nicht.
- `RUNNER_CONTAINER_NOT_RUNNING`: Container existiert, laeuft aber nicht.
- `WORKSPACE_NOT_FOUND`: `/workspace` fehlt im Runner.
- `CANARY_WRITE_FAILED`: Der Canary-Pfad konnte nicht beschrieben werden.
- `MISSING_TOOL`: Tool fehlt im Runner; kein unkontrollierter Abbruch.
- `SPEC_KIT_INSTALL_FAILED`: offizieller `uv`-Pfad oder Override fehlgeschlagen.
- `SPEC_KIT_INIT_FAILED`: `opencode`-Integration liess sich nicht initialisieren.
- `SPEC_KIT_INTEGRATION_VERIFY_FAILED`: `.opencode/commands` oder `opencode` nicht verifiziert.
- `OPENCODE_STEP_FAILED`: Spec-Kit-Slash-Commands im Runner nicht lauffaehig.
- `PAYLOAD_TOO_LARGE`: Blueprint zu gross fuer die aktuelle SSH-Transportstrategie.
