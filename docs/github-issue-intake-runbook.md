# GitHub Issue Intake Runbook

## Normalbetrieb

### 1. Issue mit Template erstellen
- Gehe zu: `https://github.com/xxammaxx/n8n-blueprint-workflow/issues/new`
- Wähle Template: **"Agent Task"**
- Fülle alle Pflichtfelder aus
- Issue wird automatisch mit `agent:queued` erstellt

### 2. Labels prüfen und setzen
- **Muss:** `agent:queued` (automatisch vom Template)
- **Muss:** `mode:manual-terminal` (Default) oder `mode:opencode-run` (wenn Provider aktiv)
- **Muss:** `risk:low` / `risk:medium` / `risk:high`
- **Muss:** `human-approval-required` (bleibt bis zur finalen Freigabe)

### 3. Review durch Nutzer
- Akzeptanzkriterien prüfen
- Verification Contract prüfen
- Approvals bestätigen

### 4. Startsignal: agent:ready setzen
- Label `agent:queued` entfernen
- Label `agent:ready` hinzufügen
- **NUR** wenn der Nutzer ausdrücklich starten will

### 5. n8n liest Issue
- n8n GitHub Trigger oder Manual Trigger
- Liest Issue Body, Labels, Comments
- Validiert Contract (Felder, Labels, Approvals)

### 6. n8n erzeugt RUN_INPUT.json
- Extrahiert Issue-Daten in RUN_INPUT-Struktur
- Setzt `source_of_truth=github`
- Setzt `github.issue_number` und `github.issue_url`

### 7. Runner schreibt Evidence
- SSH Write: RUN_INPUT.json → Runner
- SSH Start: start_github_issue_run.sh
- Runner erzeugt Evidence unter:
  `/opt/dev-fabric/evidence/github-agent-runs/<owner>/<repo>/issue-<number>/<run_id>/`

### 8. n8n kommentiert Issue (automatisch)
- Liest status.json und run-report.md vom Runner (SSH Read Node)
- Format Evidence Comment Node erstellt standardisierten Kommentar
- Create GitHub Comment Node (HTTP Request) schreibt Kommentar via GitHub API
- Credential: `github-n8n-blueprint` (muss in n8n konfiguriert sein)
- Keine langen Logs — nur Zusammenfassung + Pfade

### 9. Labels aktualisieren (automatisch)
- Add Labels Node (HTTP Request): setzt `agent:needs-review` + `evidence:attached`
- Remove Label Node (HTTP Request): entfernt `agent:running` (404-tolerant via `continueOnFail`)
- Reihenfolge: Comment → Add Labels → Remove Label → Format Final Result
- Keine Issues schließen, kein `agent:done` setzen

### 10. Nutzer prüft Ergebnis
- Evidence Comment im Issue #1 lesen (automatisch gepostet)
- Labels prüfen: `agent:needs-review`, `evidence:attached` sichtbar
- `agent:running` nicht vorhanden
- Issue bleibt offen
- Lokale Evidence-Pfade bei Bedarf prüfen

## Dispatcher-Aktivierung (einmalig)

### Warum manuelle Aktivierung?

Der Dispatcher-Workflow (`Sv12QTo56NoPUu2D`, "GitHub Ready Issue -> Runner Agent Dispatch") muss **über die n8n UI publish'ed und aktiviert werden**, weil:

1. **CLI-Publish reicht nicht:** `n8n publish:workflow` setzt `active=1` in der Datenbank, aber n8n registriert den Schedule-Trigger beim Startup NICHT
2. **DB-Update reicht nicht:** Direktes `UPDATE workflow_entity SET active=1` hat denselben Effekt — Schedule wird nicht registriert
3. **Nur UI-Publish + Active-Toggle** löst die vollständige Runtime-Registrierung aus

### Aktivierungsschritte

1. **n8n UI öffnen:** `http://192.168.1.52:5678`
2. **Einloggen** mit Owner-Credentials
3. **Workflow öffnen:** `Sv12QTo56NoPUu2D` oder "GitHub Ready Issue -> Runner Agent Dispatch"
4. **Publish-Button prüfen:**
   - Wenn deaktiviert → **Häufigste Ursache: Unused Variable in Code Node**
   - Öffne den "Format Final Result" Code Node
   - Prüfe auf ungenutzte Variablen wie `const data = $input.first().json;`
   - n8n's Code Node Linter behandelt ungenutzte Variablen als **blockierenden Fehler**
   - Entferne die ungenutzte Zeile → Publish-Button wird aktiv
   - Alternativ: Alle Code Nodes auf rote/gelbe Warnsymbole prüfen
5. **Workflow publishen:** Rechts oben "Publish" klicken
6. **Workflow aktivieren:** Active-Toggle auf "Active" setzen
7. **Speichern** (Ctrl+S oder Auto-Save)
8. **Verifikation:** In n8n-Logs erscheint `Activated workflow "GitHub Ready Issue -> Runner Agent Dispatch"`

### Aktivierung via API (Alternative)

Falls das n8n UI nicht erreichbar ist, kann die Aktivierung über die REST API erfolgen:

```powershell
# 1. Workflow fixen (unused variable entfernen):
$headers = @{
    "Content-Type" = "application/json"
    "Cookie" = "n8n-auth=$n8nAuthCookie"
    "browser-id" = "<sha256-hashed-browser-id>"
}
# PATCH /rest/workflows/Sv12QTo56NoPUu2D mit korrigiertem Code

# 2. Aktivieren:
Invoke-RestMethod -Uri "http://192.168.1.52:5678/rest/workflows/Sv12QTo56NoPUu2D/activate" `
    -Method Post -Headers $headers
# Response: {"active":true} — HTTP 200
```

**API Auth Voraussetzungen:**
- `n8n-auth` JWT Cookie (aus storageState)
- `browser-id` Header (SHA-256 Hash des browserId aus storageState)
- `Content-Type: application/json`

**⚠️ Einschränkung:** API-Aktivierung registriert den Schedule-Trigger MÖGLICHERWEISE NICHT für das n8n Startup. In früheren Tests wurde festgestellt, dass nur UI-Publish+Active-Toggle den Schedule-Trigger vollständig registriert. Nach API-Aktivierung sollte per UI überprüft werden, ob der Workflow wirklich aktiv ist und der Schedule-Trigger feuert.

### Verifikation nach Aktivierung

```bash
# Auf Proxmox-Host:
ssh root@192.168.1.136 'pct exec 101 -- journalctl -u n8n -n 100 --no-pager | grep -E "Currently active|Activated|Dispatch"'

# Erwartete Ausgabe:
# Currently active workflows:
#    - GitHub Ready Issue -> Runner Agent Dispatch (ID: Sv12QTo56NoPUu2D)
```

### Schedule-Trigger

- **Intervall:** Alle 10 Minuten
- **Aktion:** GitHub Search API: `is:issue is:open label:agent:ready repo:xxammaxx/n8n-blueprint-workflow&per_page=1`
- **Limit:** 1 Issue pro Run
- **Guardrails:** Issue muss `agent:ready` haben, `agent:running`/`agent:blocked`/`agent:done` dürfen nicht gesetzt sein

### storageState erneuern

Nach manuellem Login kann die Playwright-Session erneuert werden:

```powershell
# PowerShell (lokal):
npx playwright open --save-storage="$env:USERPROFILE\.n8n-automation\playwright\n8n-storage-state.json" http://192.168.1.52:5678
# Manuell einloggen, dann Browser schließen
```

## Recovery-Szenarien

### R1: GitHub Credential fehlt in n8n

**Symptom:** n8n kann keine Issues lesen/kommentieren

**Diagnose:**
```bash
# Auf dem n8n Host (LXC 101) prüfen:
n8n credential:list
```

**Recovery:**
1. In n8n UI: **Settings → Credentials → Add Credential**
2. Typ: **GitHub API**
3. Name: `github-n8n-blueprint`
4. Token: Personal Access Token (classic) mit Scopes:
   - `repo` (full)
   - `read:org`
5. Speichern und im Workflow referenzieren

**Fallback ohne Credential:**
- Manual Trigger mit festem `owner`, `repo`, `issue_number`
- Issue-Kommentar manuell schreiben
- Status: **GREEN_PARTIAL**

### R2: n8n GitHub Trigger nicht erreichbar

**Symptom:** n8n reagiert nicht auf Label-Änderungen

**Diagnose:**
- Prüfen, ob n8n Internet-Zugriff auf `api.github.com` hat
- Prüfen, ob GitHub API erreichbar ist

**Recovery:**
- **Manual Trigger Fallback** verwenden (siehe unten)
- Issue-Nummer manuell im Workflow-Input setzen

### R3: Manual Trigger Fallback

**Wenn GitHub Trigger nicht funktioniert:**

1. In n8n UI den Workflow öffnen
2. **Manual Trigger Node** ausführen
3. Parameter:
   - `owner`: `xxammaxx`
   - `repo`: `n8n-blueprint-workflow`
   - `issue_number`: `<Nummer des gewünschten Issues>`
4. Workflow läuft wie gehabt (liest Issue, schreibt Evidence, kommentiert)

### R4: Runner SSH Fehler

**Symptom:** SSH Write/Start/Read schlägt fehl

**Diagnose:**
```bash
# Vom n8n Host (LXC 101):
ssh -i <key> runner@192.168.1.53 "echo OK"
```

**Recovery:**
- Prüfen, ob `dev-runner-ssh` Credential in n8n gültig ist
- Prüfen, ob Runner LXC 102 läuft
- Prüfen, ob SSH-Port 22 von 101 → 102 erreichbar ist
- Siehe `docs/troubleshooting.md`

### R5: Evidence fehlt

**Symptom:** Nach Runner-Start keine Evidence-Dateien

**Diagnose:**
```bash
# Auf Runner (LXC 102):
ls -la /opt/dev-fabric/evidence/github-agent-runs/
```

**Recovery:**
- Prüfen, ob `start_github_issue_run.sh` ausgeführt wurde
- Prüfen, ob Runner-Schreibrechte auf Evidence-Pfad hat
- Prüfen, ob RUN_INPUT.json valide ist
- Siehe `docs/troubleshooting.md`

### R6: Issue-Kommentar schlägt fehl

**Symptom:** n8n kann Issue nicht kommentieren

**Diagnose:**
- GitHub API Rate Limit prüfen
- Token-Rechte prüfen (`repo` Scope nötig)

**Recovery:**
- Issue-Kommentar manuell schreiben
- Evidence-Pfad manuell im Kommentar referenzieren
- Token erneuern, wenn abgelaufen

### R7: Secret-Scan schlägt an

**Symptom:** `grep` findet Secrets oder verbotene Dateien im Repo

**Recovery:**
1. **NICHT committen**
2. **NICHT pushen**
3. Funde identifizieren und bereinigen
4. `.gitignore` prüfen, ob Regeln greifen
5. Erneut scannen
6. Erst dann commit + push

### R8: OpenCode Provider/Auth fehlt

**Symptom:** `opencode run` hängt interaktiv

**Diagnose:**
```bash
# Auf Runner (LXC 102):
opencode providers list
# Erwartet: 0 credentials
```

**Recovery:**
- `mode=manual-terminal` verwenden (Default)
- Provider-Konfiguration benötigt **separate Approval**
- Nicht ohne Approval konfigurieren
- Status: **GREEN_PARTIAL** (erwartet, kein Blocker)

### R9: OpenCode hängt bei Provider-Konfiguration

**Symptom:** `opencode run` startet nicht, wartet auf interaktiven Login

**Recovery:**
- Dies ist **erwartetes Verhalten** ohne Provider
- Nicht blockierend — `manual-terminal` funktioniert
- Provider-Konfiguration ist ein separater, genehmigungspflichtiger Schritt

## Live Validation (2026-06-24)

Am 2026-06-24 wurde der GitHub Issue Intake Workflow (ID: `h78eENwLGwr2QUmU`) im n8n UI live validiert. Dabei wurden kritische Konfigurationsdetails für die SSH Nodes identifiziert und dokumentiert.

### Validierte Nodes (9 Nodes, alle grün)

| # | Node | Status | Detail |
|---|------|--------|--------|
| 1 | Manual Trigger | ✅ OK | Startet mit `owner`, `repo`, `issue_number` |
| 2 | GitHub: Get Issue | ✅ OK | Liest Issue Body, Labels, Comments |
| 3 | Validate Issue Contract | ✅ OK | JS Code: prüft Labels, Pflichtfelder, Approvals |
| 4 | Prepare RUN_INPUT.json | ✅ OK | Erzeugt `run_input_b64`, `run_input_remote`, `evidence_dir` |
| 5 | SSH: Write RUN_INPUT | ✅ OK | Command mode, `mkdir -p` + `base64 -d` + `jq`, 779 Bytes |
| 6 | SSH: Start Runner Script | ✅ OK | `--input-json` Flag, `exit_code 0` |
| 7 | Wait (Delay) | ✅ OK | "After Time Interval" mode, 5 Sekunden |
| 8 | SSH: Read status.json | ✅ OK | Retry loop (30x2s), `status.json` gefunden mit `GREEN_PARTIAL` |
| 9 | Format Result | ✅ OK | Rückgabe an Webhook / Manual Trigger |

### SSH Node Configuration (CRITICAL)

#### Expression Mode (NICHT Fixed Mode)
Alle SSH Nodes **MÜSSEN** im **Expression Mode** konfiguriert sein, damit `{{ }}` Ausdrücke korrekt aufgelöst werden. Wenn ein SSH Node im **Fixed Mode** ist, werden die Expression-Strings als Literale behandelt — der Befehl wird nicht ausgeführt und die Node schlägt still fehl.

**Richtig (Expression Mode):**
- Im n8n UI: In der SSH Node bei `Command` auf den **Expression/Code**-Toggle klicken (fx-Symbol), NICHT den Fixed/String-Modus verwenden
- In der Export-Datei: Der `command` Parameter muss als Expression-String gespeichert sein

**Falsch (Fixed Mode):**
- Der Befehlstext erscheint im UI als Plain Text ohne grauen Expression-Hintergrund
- `{{ $json.run_input_remote }}` wird nicht aufgelöst → bash bekommt den Literal-String

#### Command Mode
Alle SSH Nodes müssen im Command Mode (`"mode": "command"`) sein, nicht im SFTP/create Mode. Ohne `mode: command` führt n8n keine Bash-Befehle aus — die Node wird grün (SFTP verbunden OK) aber kein Code läuft auf dem Runner.

#### SSH Write (Node 5)
```json
{
  "mode": "command",
  "command": "set +e\nRUN_INPUT_PATH=\"{{ $json.run_input_remote }}\"\nRUN_INPUT_DIR=\"$(dirname \"$RUN_INPUT_PATH\")\"\nmkdir -p \"$RUN_INPUT_DIR\"\nprintf '%s' '{{ $json.run_input_b64 }}' | base64 -d > \"$RUN_INPUT_PATH\"\ncat \"$RUN_INPUT_PATH\" | jq . > /dev/null 2>&1 && echo '{\"ok\":true,\"phase\":\"ssh_write_run_input\",\"path\":\"'\"$RUN_INPUT_PATH\"'\",\"bytes\":'$(wc -c < \"$RUN_INPUT_PATH\")\'}' || echo '{\"ok\":false,\"phase\":\"ssh_write_run_input\",\"error\":\"jq validation failed\"}'\n"
}
```
- Erzeugt Verzeichnis mit `mkdir -p`
- Schreibt Datei via `base64 -d` (Base64 dekodieren statt URL-kodiertem Inhalt)
- Validiert mit `jq .`
- Schreibberechtigung des Runners auf `/opt/dev-fabric/evidence/` vorausgesetzt
- 779 Bytes geschrieben (gemessene Größe der RUN_INPUT.json)

#### SSH Start (Node 6) — --input-json Flag
```json
{
  "mode": "command",
  "command": "ssh {{ $json.run_input_remote_host }} --input-json '{{ $json.run_input_remote }}' 2>&1\necho '{\"ok\":true,\"phase\":\"ssh_start_runner\",\"exit_code\":'$?',\"run_id\":\"gh-issue-1-20260624T104034Z\"}'\n"
}
```
- **MUSS** das `--input-json` Flag verwenden — OHNE dieses Flag gibt es `unknown argument` Fehler
- Das Flag ist im `start_github_issue_run.sh` Script implementiert
- Exit code 0 bestätigt erfolgreichen Start

#### Wait (Node 7) — "After Time Interval" Mode
```json
{
  "amount": 5,
  "unit": "seconds",
  "mode": "timeInterval"
}
```
- **MUSS** auf "After Time Interval" (timeInterval) gesetzt sein, NICHT "At a Specific Time" (hours)
- Falsche Einstellung ("At a Specific Time" / "Hours") → der Node wartet **für immer** (bis zu einem spezifischen Datum in der Zukunft)
- 5 Sekunden sind ausreichend für den Runner, um Evidence zu erzeugen

#### SSH Read (Node 8) — Retry Loop
```json
{
  "mode": "command",
  "command": "set +e\nSTATUS_PATH=\"{{ $json.evidence_dir }}/status.json\"\nfor i in $(seq 1 30); do\n  if [ -f \"$STATUS_PATH\" ]; then\n    cat \"$STATUS_PATH\"\n    exit 0\n  fi\n  sleep 2\ndone\necho '{\"ok\":false,\"phase\":\"ssh_read_status\",\"error\":\"status.json not found after 30 retries\",\"searched\":\"'\"$STATUS_PATH\"'\"}'\n"
}
```
- Retry loop: 30 Versuche, je 2 Sekunden Pause (= max 60 Sekunden Wartezeit)
- Bricht ab, sobald `status.json` gefunden wird
- Enthält `GREEN_PARTIAL` im Status → Workflow läuft
- 8 Evidence-Dateien produziert unter `/opt/dev-fabric/evidence/github-agent-runs/`

### Prepare Node Outputs (Node 4)

Der Prepare RUN_INPUT.json Node muss **alle drei** Felder im Output setzen:

| Output Field | Beschreibung |
|---|---|
| `run_input_b64` | Base64-kodierte RUN_INPUT.json (für SSH Write via `base64 -d`) |
| `run_input_remote` | Absoluter Pfad auf dem Runner: `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-<N>/gh-issue-<N>-<TIMESTAMP>/RUN_INPUT.json` |
| `evidence_dir` | Evidence-Verzeichnis: `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-<N>/gh-issue-<N>-<TIMESTAMP>/` |

### Pin Data Format (für manuelles Testen)

Beim manuellen Triggern **muss** Pin Data die Labels enthalten:

```json
{
  "owner": "xxammaxx",
  "repo": "n8n-blueprint-workflow",
  "issue_number": 1,
  "labels": ["agent:queued"]
}
```

Oder für Ready-Status:
```json
{
  "owner": "xxammaxx",
  "repo": "n8n-blueprint-workflow",
  "issue_number": 1,
  "labels": ["agent:ready"]
}
```

**Ohne `labels` Array** blockiert der "Validate Issue Contract" Node mit Fehler. Der Node prüft explizit auf `input.body.labels` und erwartet mindestens `agent:queued` oder `agent:ready`.

### Runner Evidence Produktion

Nach erfolgreichem SSH Start produziert der Runner folgende 8 Dateien unter `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/gh-issue-1-20260624T104034Z/`:

| Datei | Beschreibung |
|---|---|
| `status.json` | Status: `GREEN_PARTIAL`, Phase, Run ID |
| `run-report.md` | Menschlesbarer Report |
| `commands.log` | Alle ausgeführten Kommandos |
| `agent.log` | Agent-Ausgaben |
| `github-context.md` | GitHub Issue Kontext |
| `RUN_INPUT.json` | Validierte Eingabedaten |
| `preflight.md` | Preflight-Check Ergebnisse |
| `summary.json` | Zusammenfassung (optional) |

### Bekannte Einschränkungen (GREEN_PARTIAL)

| Feature | Status | Grund |
|---|---|---|
| SSH Write/Start/Read command mode | ✅ VALIDIERT | Alle 3 SSH Nodes im Expression-Command-Mode |
| Runner Evidence Produktion | ✅ VALIDIERT | 8 Dateien produziert |
| GitHub Auto-Comment | ❌ NICHT IMPLEMENTIERT | Benötigt GitHub API Credential in n8n |
| GitHub Auto-Label | ❌ NICHT IMPLEMENTIERT | Manuell via `gh` CLI möglich |
| n8n MCP Production Exposure | ❌ NICHT AKTIVIERT | Nur Smoke Test Workflow über MCP exponiert |
| OpenCode Provider Config | ❌ FEHLT | Benötigt separate Approval |

### Common Failures & Fixes

| Symptom | Root Cause | Fix |
|---|---|---|
| SSH Node grün aber kein Befehl ausgeführt | Fixed Mode statt Expression Mode | Auf Expression Mode umstellen (fx-Button im n8n UI) |
| `{{ $json.run_input_remote }}` erscheint literal in SSH Output | Fixed Mode | Expression Mode verwenden |
| Wait Node hängt für immer | "At a Specific Time" / Hours statt "After Time Interval" | Mode auf `timeInterval`, Unit auf `seconds`, Amount auf `5` |
| "Validate Issue Contract" blockiert | Kein `labels` Array in Pin Data | `labels: ["agent:queued"]` oder `["agent:ready"]` hinzufügen |
| `start_github_issue_run.sh: unknown argument` | Fehlendes `--input-json` Flag | `--input-json` vor dem Pfad-Argument einfügen |
| `bash: json: unbound variable` | Expression nicht aufgelöst → Literal-String wird als Variable interpretiert | Expression Mode oder explizite Node-Referenz (`$node["Prepare RUN_INPUT.json"].json`) |
| SSH Write: Permission denied | Runner hat keine Schreibrechte auf Zielverzeichnis | `chown runner:runner` auf dem Runner ausführen |
| SSH Write: jq validation failed | RUN_INPUT.json ist kein valides JSON | Base64-String prüfen (muss korrekt kodiert sein) |
| status.json nach 30 Retries nicht gefunden | Runner Script nicht gestartet oder Evidence-Pfad falsch | SSH Start Exit Code prüfen, `evidence_dir` im Prepare Node prüfen |

## Workflow-Referenz

### n8n Workflow: GitHub Issue → Runner Agent Intake

**Trigger:**
- Primary: GitHub Trigger (auf `agent:ready` Label)
- Fallback: Manual Trigger (owner, repo, issue_number)

**Nodes:**
1. GitHub Trigger / Manual Trigger
2. GitHub: Get Issue
3. Validate Issue Contract (JS Code)
4. Prepare RUN_INPUT.json (JS Code)
5. SSH: Write RUN_INPUT to Runner
6. SSH: Start Runner Script
7. Wait (Delay)
8. SSH: Read status.json
9. GitHub: Create Issue Comment
10. GitHub: Update Labels
11. Format Result (Respond to Webhook)

### Benötigte GitHub Credentials in n8n

| Name | Typ | Rechte |
|------|-----|--------|
| `github-n8n-blueprint` | GitHub API | `repo`, `read:org` |

**Nicht nötig:** `workflow`, `admin:org`, `secrets`, `packages`

### Benötigte GitHub Token Scopes

```
repo      — Issues lesen/schreiben, Contents lesen
read:org  — Organisation-Metadaten (optional)
```

**Explizit NICHT:**
```
workflow  — keine GitHub Actions
admin:*   — keine administrativen Rechte
```

## Schnellreferenz

### Issue-Labels schnell setzen

```bash
# agent:ready setzen (Startsignal)
gh issue edit <NUMBER> --repo xxammaxx/n8n-blueprint-workflow \
  --remove-label "agent:queued" \
  --add-label "agent:ready"

# agent:done setzen (Abschluss)
gh issue edit <NUMBER> --repo xxammaxx/n8n-blueprint-workflow \
  --remove-label "agent:running" \
  --add-label "agent:done,evidence:attached"
```

### Manual Trigger ausführen

```bash
# Via n8n API (Port 5678):
curl -X POST http://192.168.1.52:5678/webhook-test/manual-github-issue-run \
  -H "Content-Type: application/json" \
  -d '{"owner":"xxammaxx","repo":"n8n-blueprint-workflow","issue_number":1}'
```

### Evidence prüfen

```bash
# Auf Runner (LXC 102):
ssh runner@192.168.1.53
cat /opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/*/status.json
cat /opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-1/*/run-report.md
```

## 2026-06-24: Expression Mode Fix + Live Validation

### Key Fixes Applied

1. **Expression Mode on SSH Nodes:** Commands MUST use Expression mode (fx toggle). In Fixed mode, `{{ }}` expressions are passed literally to bash. This was the hidden root cause of "node green but command fails" symptoms.

2. **Cross-Node References:** When referencing data from upstream nodes, SSH nodes must use explicit node references: `$('Prepare RUN_INPUT.json').first().json.run_input_remote`. Simple `$json.field` does not work through SSH nodes.

3. **Wait Node Units:** Always verify the Wait unit is "Seconds", not "Hours" or "Minutes".

### Verified Workflow Chain (12/12 nodes working)

```
Manual Trigger → Validate → Prepare RUN_INPUT.json → SSH Write → SSH Start → Wait (5s) → SSH Read → Format Evidence Comment → GitHub Comment → Add Labels → Remove Label → Format Result
```

### Live Test Results (2026-06-24 — Label Dataflow Fix)

| Node | Name | Result |
|------|------|--------|
| 1-12 | Full Pipeline | ✅ **ALL 12 GREEN** |
| 10 | GitHub Comment | ✅ Comment posted to Issue #1 |
| 11 | Add Labels | ✅ HTTP 200 — `agent:needs-review` + `evidence:attached` added |
| 12 | Remove Label | ✅ HTTP 404 tolerated (label not present) |

### Stable Data Source Pattern (CRITICAL)

**Problem:** Nodes 11 and 12 originally used `$json.owner`, `$json.repo`, `$json.issue_number` in their URL expressions. After Node 10 (GitHub Comment API) executes, `$json` contains the GitHub API comment response (`url`, `html_url`, `id`, etc.), NOT the original issue identifiers. This causes HTTP 404 because the URL resolves to invalid data.

**Solution:** Always reference the **Prepare RUN_INPUT.json** node (Node 3) for issue context data that must survive GitHub API calls:

```javascript
// STABLE — references Prepare node directly:
$('Prepare RUN_INPUT.json').first().json.owner
$('Prepare RUN_INPUT.json').first().json.repo
$('Prepare RUN_INPUT.json').first().json.issue_number

// UNSTABLE after GitHub API calls — $json is overwritten:
// $json.owner
// $json.repo
// $json.issue_number
```

**Rule:** Any n8n HTTP Request node that calls an external API will overwrite `$json` with the API response. If downstream nodes need data from before the API call, use explicit cross-node references (`$('Node Name').first().json.field`).

**This applies to:**
- Node 11 (Add Labels) — URL references Prepare node
- Node 12 (Remove Label) — URL references Prepare node
- Any future nodes that need issue identifiers after API calls
- SSH nodes that need `run_input_remote`, `run_input_b64`, `evidence_dir` (already fixed in previous session)

### Known Issue: Node 11 (Add Labels) — RESOLVED
Node 11 previously received GitHub comment response data (`url`, `html_url`, `id`) instead of issue identifiers (`owner`, `repo`, `issue_number`). Fixed by changing URL expressions to reference `$('Prepare RUN_INPUT.json').first().json.*`.

---

## Automated Dispatcher Workflow (New)

A new **GitHub Ready Issue → Runner Agent Dispatch** workflow (ID: `k1c2d3FfWHee6Jr0e`, 15 nodes) provides automated dispatching. This runs alongside the existing 12-node manual intake workflow.

### Trigger Strategy

| Aspect | Detail |
|--------|--------|
| **Trigger** | Polling (Schedule Trigger + GitHub Search API) |
| **Why not GitHub Trigger?** | n8n instance on internal network (192.168.1.52) — no public URL for webhooks |
| **Polling Query** | `is:issue is:open repo:xxammaxx/n8n-blueprint-workflow label:"agent:ready"` |
| **Interval** | Configurable (recommended: every 5 minutes) |
| **Dispatcher ID** | `k1c2d3FfWHee6Jr0e` |
| **Nodes** | 15 |
| **Status** | Imported via CLI, `active: false` (needs UI activation) |

### Dispatcher Workflow Nodes (15)

```
Schedule Trigger (Polling) → Fetch Issue from GitHub → Guardrails & Validate →
Remove agent:ready Label → Add agent:running Label → Prepare RUN_INPUT.json →
SSH Write → SSH Start → Wait (5s) → SSH Read → Format Evidence Comment →
Create GitHub Comment → Add Labels (agent:needs-review, evidence:attached) →
Remove agent:running Label (404-tolerant) → Format Final Result
```

### Guardrails & Dual-Start Protection

The dispatcher enforces these rules **before** any runner execution:

1. Issue MUST be open (not closed)
2. Label `agent:ready` MUST be present
3. Label `agent:running` MUST NOT be present (prevents double-start)
4. Label `agent:blocked` MUST NOT be present
5. Label `agent:done` MUST NOT be present
6. Repository MUST be `xxammaxx/n8n-blueprint-workflow`

If any guardrail fails, the dispatcher skips execution and optionally comments with `BLOCKED_WITH_DIAGNOSIS`.

### Label Transition Logic

The dispatcher manages labels throughout the run lifecycle:

| Phase | Action | Guard |
|-------|--------|-------|
| **Start** | Remove `agent:ready`, Add `agent:running` | Must pass guardrails first |
| **Success** | Remove `agent:running`, Add `agent:needs-review` + `evidence:attached` | Evidence must be produced |
| **Failure** | Remove `agent:running`, Add `agent:blocked` + `evidence:attached` | Runner error detected |
| **Re-run** | User re-adds `agent:ready` | Guardrails re-validate |

### Label State Machine

```
agent:queued → agent:ready → agent:running → agent:needs-review → agent:done
                                              → agent:blocked
```

- `agent:done` is NEVER set automatically — requires human approval
- `evidence:attached` is set alongside `agent:needs-review` or `agent:blocked`
- Removing `agent:ready` before adding `agent:running` prevents race conditions
- If `agent:running` is already present, the dispatcher skips (anti-double-start)

### Run ID and Idempotency

Each run receives a unique Run ID:
```
gh-issue-<issue_number>-<YYYYMMDDTHHMMSSZ>
```

Evidence path:
```
/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-<number>/<run_id>/
```

### Smoke Test

Issue #2 has been created with the `agent:ready` label for testing the dispatcher. To execute:
1. Resolve storageState expiry (re-login to n8n UI)
2. Activate the dispatcher workflow in n8n UI
3. Ensure `dev-runner-ssh` and GitHub credentials are valid
4. The Schedule Trigger will pick up Issue #2 on next poll cycle
5. Or use the Manual Trigger (Smoke Test) node for immediate execution
