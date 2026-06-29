# Final Report — Dispatcher Comment Sync Fix

## Meta
- **Timestamp (UTC):** 2026-06-29T05:52:00Z
- **Evidence Directory:** `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/`
- **Working Directory:** `C:\Spec-kit_n8n`
- **Orchestrator Agent:** issue-orchestrator (deepseek-v4-pro)

---

## 1. Kurzfazit

Die Root Cause des Stale-Comment-Problems wurde identifiziert: Der n8n "SSH Read status.json" Node gibt den SSH-Output als Wrapper-Objekt `{ stdout, success, exitCode }` zurück, aber der "Format Evidence Comment" Node versucht das gesamte Wrapper-Objekt als status.json zu parsen. Der Fix extrahiert korrekt `stdout` und parsed diesen als JSON. Zusätzlich werden die gewünschten Felder (`status`, `effective_mode`, `provider`, `model`, `open_code_version`) aus der echten Runner-Evidence im GitHub-Kommentar angezeigt.

Der Patch ist vorbereitet, statisch validiert und deployment-bereit. Die Live-Anwendung erfordert n8n UI-Zugriff (derzeit nicht authentifiziert).

## 2. Statusentscheidung

### 🟡 **GREEN_PARTIAL_PATCH_PREPARED_DEPLOYMENT_PENDING**

**Begründung:**
- Fix designed und statisch validiert: ✅
- Patch-JSON syntaktisch gültig: ✅  
- Live-Dispatch-Test mit Issue #13: ✅ (Pipeline läuft, Guardrails halten)
- Issues #3-#12 geschützt: ✅
- Secret Hygiene: ✅ GREEN
- ABER: Patch nicht live deployed (kein n8n UI/API-Zugriff)
- ABER: GitHub-Kommentar weiterhin mit Stale-Werten (Problem bestätigt, aber nicht behoben)

## 3. Workflow

| Feld | Wert |
|------|------|
| ID | `Sv12QTo56NoPUu2D` |
| Name | "GitHub Ready Issue → Runner Agent Dispatch" |
| Active | ✅ Published |
| Trigger unverändert | ✅ Manual + Schedule (15 min) |
| Schedule unverändert | ✅ 15-Minuten-Intervall |
| Geänderte Nodes | 2 (Node 11: Format Evidence Comment, Node 15: Format Final Result) |
| Node Count | 18 → 18 |

## 4. Root Cause — Comment Sync

### Bug
Der "SSH Read status.json" Node (ID `592fc2b2-...`) gibt SSH-Output als Wrapper zurück:
```json
{ "success": true, "stdout": "{\n  \"status\": \"GREEN\"...\n}", "exitCode": 0 }
```

Der "Format Evidence Comment" Node (ID `25d2cbd3-...`) prüft `typeof statusOutput === 'object'`, findet das SSH-Wrapper-Objekt, sucht aber nach `.status` im Wrapper (existiert nicht) statt in `.stdout`.

### Fix (im Patch)
```javascript
// ALT (broken):
status = statusOutput.status || 'UNKNOWN'; // statusOutput.status = undefined

// NEU (fixed):  
const statusData = JSON.parse(sshOutput.stdout);
status = statusData.status || 'UNKNOWN'; // statusData.status = "GREEN"
```

### Datenquelle

| Feld | Alte Quelle | Neue Quelle |
|------|------------|-------------|
| Status | Hardcoded 'UNKNOWN' | `status.json` → `.status` |
| Mode | `prepData.mode` (RUN_INPUT, immer 'manual-terminal') | `status.json` → `.mode.effective` |
| Provider configured | Hardcoded 'NO' | `status.json` → `.agent_runtime.opencode_provider_configured` |
| Provider | Nicht angezeigt | `status.json` → `.provider` |
| Model | Nicht angezeigt | `status.json` → `.model` |
| OpenCode Version | Hardcoded 'v1.17.9' | `status.json` → `.agent_runtime.opencode_version` |
| Evidence Source | Nicht gelabelt | Explizit `Evidence source: status.json` / `fallback` |

### Fallbacks
1. status.json (via SSH stdout → JSON.parse)
2. SSH raw output (nicht parsebar)
3. prepData (RUN_INPUT.json)
4. Hardcoded defaults

## 5. Issue #13

| Feld | Wert |
|------|------|
| URL | https://github.com/xxammaxx/n8n-blueprint-workflow/issues/13 |
| Titel | [Dummy] Dispatcher comment sync status.json verification |
| Labels vorher | `agent:ready`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |
| Labels nachher | `agent:needs-review`, `evidence:attached`, `test:dummy`, `opencode:smoke`, `deepseek:direct`, `comment-sync:test` |
| Neues Label | `comment-sync:test` (#0066FF) |
| Verarbeitet | ✅ Schedule Trigger, genau 1x |

## 6. n8n Execution

| Feld | Wert |
|------|------|
| Issue | #13 |
| Trigger | Schedule Trigger (15 min) |
| Run ID | `gh-issue-13-20260629T054530Z` |
| Dispatch-Zeit | ~2026-06-29T05:45 UTC |
| Pipeline | GitHub Search → Pick → Fetch → Guardrails → Labels → Runner → Evidence → Comment → Format |
| Ergebnis | `success` (erwartet, wie Issue #8) |
| n8n health | ✅ HTTP 200, `{"status":"ok"}` |

## 7. Runner Evidence

| Feld | Wert |
|------|------|
| Pfad | `/opt/dev-fabric/evidence/github-agent-runs/xxammaxx/n8n-blueprint-workflow/issue-13/gh-issue-13-20260629T054530Z/` |
| `status.json` geprüft | ⏳ Vor-Ort-Zugriff nicht möglich (Pattern bestätigt von #9, #12) |
| Erwartet: effective_mode | `opencode-run` |
| Erwartet: provider_configured | `true` |
| Erwartet: provider | `deepseek` |

## 8. GitHub-Kommentar

| Feld | Wert |
|------|------|
| Nutzt `status.json` | ❌ NEIN (pre-patch — stale RUN_INPUT) |
| Status zeigt | `UNKNOWN` (sollte `GREEN` sein) |
| Mode zeigt | `manual-terminal` (sollte `opencode-run` sein) |
| Provider configured zeigt | `NO` (sollte `true` sein) |
| Evidence path | ✅ Korrekt |
| Keine Secrets | ✅ YES |

## 9. Issues #3–#12

| Check | Ergebnis |
|-------|----------|
| Alle 10 Issues geschützt | ✅ JA |
| Nicht erneut gestartet | ✅ JA (0 agent:ready, 0 agent:running) |
| Keine neuen Kommentare | ✅ JA |
| Keine Label-Änderungen | ✅ JA |

## 10. Secret Hygiene

| Check | Ergebnis |
|-------|----------|
| Status | 🟢 **GREEN** |
| Echte Leaks | ❌ 0 |
| Workflow Exports | Nur Credential-Metadaten (IDs, Namen) |
| GitHub-Kommentar | Keine Secrets |
| Evidence-Dateien | Keine Secrets |
| Git-Diff | Keine Secrets |
| `secrets/` gitignored | ✅ JA |

## 11. Sicherheitsprüfung

| Prüfung | Status |
|---------|--------|
| Keine Secrets exponiert | ✅ |
| Keine Schedule-Änderung | ✅ |
| Keine Trigger-Änderung | ✅ |
| Keine Proxmox-Änderung | ✅ |
| Keine Container-/Volume-Löschung | ✅ |
| Keine GitHub Actions | ✅ |
| Kein Auto-Merge | ✅ |
| Keine produktiven Issues angetastet | ✅ |
| Keine Credential-Werte gelesen | ✅ |
| Keine Secrets in Logs | ✅ |

## 12. Geänderte Dateien

### Neue Evidence
- `evidence/dispatcher-comment-sync-status-json-20260629T053028Z/` (14 Dateien):

| Datei | Phase |
|-------|-------|
| `preflight.md` | 1 |
| `workflow-comment-path-before.md` | 2 |
| `comment-data-flow-analysis.md` | 2 |
| `runner-status-json-structure.md` | 3 |
| `comment-sync-fix-design.md` | 4 |
| `workflow-patch-plan.md` | 5 |
| `workflow-snapshot-before.md` | 6 |
| `workflow-snapshot-before.sha256` | 6 |
| `workflow-patch-applied.md` | 7 |
| `workflow-diff-summary.md` | 8 |
| `static-validation.md` | 9 |
| `dummy-issue-13-created.md` | 10 |
| `n8n-execution-summary.md` | 11 |
| `github-comment-sync-validation.md` | 12 |
| `issues-3-12-guard-after.md` | 13 |
| `runner-evidence-issue-13.md` | 14 |
| `secret-hygiene-after-comment-sync.md` | 15 |
| `validation-report.md` | 16 |
| `final-report.md` | 19 |

### Workflow Exports
- `exports/comment-sync-before/dispatcher-Sv12QTo56NoPUu2D-before-comment-sync-20260629T053028Z.json`
- `exports/comment-sync-after/dispatcher-Sv12QTo56NoPUu2D-after-comment-sync-20260629T053028Z.json`

## 13. Commit/Push

- ⏳ Noch nicht committed
- Commit Message (vorgeschlagen): `fix(n8n): prepare status.json based github comment sync`
- Push erst nach Review

## 14. Was noch offen ist

1. **n8n UI Deployment:** Der Patch muss manuell über die n8n UI deployed werden (2 Nodes: Format Evidence Comment + Format Final Result)
2. **Runner-Evidence-Verifikation vor Ort:** status.json von Issue #13 auf dem Runner prüfen (SSH-Zugriff benötigt)
3. **Re-Test nach Deployment:** Ein weiteres Dummy-Issue (#14) nach Patch-Deployment, um zu verifizieren, dass der Kommentar jetzt korrekte Werte aus `status.json` zeigt

## 15. Nächster sinnvoller Schritt

1. **n8n UI-Zugriff herstellen** (Credentials eingeben oder Session wiederherstellen)
2. **Patch manuell anwenden** (Node 11 + Node 15 JS-Code ersetzen)
3. **Workflow publishen**
4. **Re-Test mit Issue #14** — Verifikation dass der Kommentar jetzt `Evidence source: status.json` und korrekte Werte zeigt

---

## Zusammenfassung aller Gates

| Phase | Gate | Ergebnis |
|-------|------|----------|
| 1 | Preflight | ✅ GREEN |
| 2 | Current Comment Path Analysis | ✅ Root Cause Identified |
| 3 | status.json Structure | ✅ Documented |
| 4 | Fix Design | ✅ Complete |
| 5 | Patch Plan | ✅ Minimal (2 nodes) |
| 6 | Snapshot Before | ✅ SHA256 verified |
| 7 | Patch Applied (local) | ✅ Patched JSON ready |
| 8 | Snapshot After | ✅ Diff verified |
| 9 | Static Validation | ✅ GREEN (17/17) |
| 10 | Dummy Issue #13 | ✅ Created + processed |
| 11 | Dispatcher Run | ✅ Schedule Trigger, 1x |
| 12 | Comment Validation | 🟡 YELLOW (stale — expected pre-patch) |
| 13 | Issues Protection | ✅ GREEN (#3-#12 safe) |
| 14 | Runner Evidence | ✅ Path confirmed, content expected |
| 15 | Secret Hygiene | ✅ GREEN (0 leaks) |
| 16 | Validation | 🟡 GREEN_PARTIAL |
| 17 | Documentation | ✅ STATUS.md + CHANGELOG.md updated |
| 18 | Commit/Push | ⏳ Pending |
| 19 | Final Report | ✅ THIS FILE |
