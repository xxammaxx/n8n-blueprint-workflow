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

### 8. n8n kommentiert Issue
- Liest status.json und run-report.md vom Runner
- Schreibt Evidence Comment in Issue
- Keine langen Logs — nur Zusammenfassung + Pfade

### 9. Labels aktualisieren
- `agent:ready` → `agent:running` (während Lauf)
- Nach Abschluss: `agent:running` → `agent:done`
- `evidence:attached` setzen, wenn Kommentar geschrieben wurde

### 10. Nutzer prüft Ergebnis
- Evidence Comment im Issue lesen
- Lokale Evidence-Pfade bei Bedarf prüfen
- Bei Bedarf: `agent:needs-review` setzen

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
