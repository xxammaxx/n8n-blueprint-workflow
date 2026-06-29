# Branch Comparison — main vs master

## Comparison Overview

| Metric | origin/main | origin/master |
|--------|-------------|---------------|
| **HEAD Commit** | `3687959` | `1c9a68b` |
| **HEAD Datum** | 2026-06-27 06:14:47 +0200 | 2026-06-29 09:51:14 +0200 |
| **Root Commit** | `9e41bba` | `5088845` |
| **Commit Count (total)** | 28 | 26 |
| **Unique Commits** | 28 (nicht auf master) | 26 (nicht auf main) |
| **Gemeinsame Commits** | 0 | 0 |
| **Merge-Base** | Nicht vorhanden | Nicht vorhanden |
| **Letzter Commit-Alter** | 2 Tage alt | ~2 Stunden alt |

## Ahead/Behind

```
git rev-list --left-right --count origin/main...origin/master
→ 28    26
```
- 28 Commits nur auf `main` (nicht auf `master`)
- 26 Commits nur auf `master` (nicht auf `main`)
- 0 gemeinsame Commits

## Commit-Listen

### Commits nur auf master (26 Commits, `>` in left-right log)

```
1c9a68b docs(ops): add comment sync 24h observation
cc1257e docs(n8n): freeze comment sync green baseline
bcb2b8b fix(n8n): deploy and verify status.json based github comment sync
88b1e81 fix(n8n): prepare status.json based github comment sync
8b10fbd fix(runner): integrate opencode provider env loading into issue dispatch script
2a4fed6 docs(runner): add final report for deepseek dummy agent test
7660bca test(runner): verify deepseek dummy agent dispatch
1b1ce59 test(runner): verify direct deepseek provider smoke
2bb53a9 docs(runner): add final report and update evidence index for credential discovery
c9f4e80 chore(runner): add local opencode credential transfer scripts
77bb08a chore(runner): add safe opencode credential copy script
1faf9a2 chore(runner): add safe opencode provider configuration scaffold
b10a7b4 docs(ops): add reliability day 1-3 read-only checks
342f6a0 docs(ops): add final report for push and reliability start
3519f27 docs(ops): start reliability observation after green success
f062182 docs(ops): add post-success operations hardening plans
4aa36d5 test(n8n): confirm execution success after format result fix
e7e6465 test(ops): verify green baseline via playwright mcp
020018e docs(n8n): freeze dispatcher green baseline
869fa69 test(n8n): confirm dispatcher execution success canary
551f87c docs: add final green canary #6 report
fa6e939 test(n8n): confirm final dispatcher schedule e2e green
b20e637 docs: add e2e canary test final report
b9ce795 test(n8n): verify dispatcher e2e canary after guardrails fix
485dc18 docs: add guardrails fix evidence and final report
5088845 fix(n8n): make guardrails trigger-agnostic  ← root commit
```

### Commits nur auf main (28 Commits, `<` in left-right log)

```
3687959 docs: add verification session results
c5c1be1 docs: add final report for dispatcher schedule runner verification
2ab0766 fix: verify dispatcher workflow, deploy runner script, process Issue #3
649c048 fix: remove unused variable in Format Final Result code node
53a992e docs: update abschlussbericht for dispatcher smoke test session
237dfc2 test: validate github ready dispatcher smoke test end-to-end
66fc6ab docs: add final abschlussbericht for github ready dispatcher session
67869b4 feat: add github ready issue dispatcher workflow + mermaid diagrams
90df00f docs: add final report for label dataflow fix run
cf84ff8 fix: use stable issue context for github label nodes
89d896b fix: apply expression mode + cross-node refs to ssh nodes
0e57fc1 chore: add n8n-api-key and .n8n-automation to .gitignore
d7e048e feat: add github comment and label automation nodes
a7f32cd test: validate github issue intake ssh command flow end-to-end
fa80ba4 docs: add final report for n8n mcp manual execution validation
f279720 test: validate n8n mcp manual execution mode
2e7b84c test: validate n8n mcp client smoke test with jwt auth
313d552 feat: activate n8n mcp, import smoke test, fix ssh node command mode
2691b3c docs: define tiered browser and n8n mcp automation strategy
1bcbd61 test: playwright mcp smoke test for github issue intake workflow
1ed1c09 feat: add github issue source-of-truth intake
01f1c67 docs: final evidence report for opencode runner integration
06ea982 feat: add controlled OpenCode v1.17.9 runner integration
4599829 docs: record runner permission fix and full evidence production success
b9022d6 docs: record ssh credential verification and JS code fix findings
64766ed docs: record v2 activation and ui test results
c3a9b70 docs: finalize evidence report with push verification
9e41bba chore: initial commit - n8n blueprint bootstrap workflow source of truth  ← root commit
```

## Diff-Stat Summary

```
git diff --stat origin/main..origin/master
```

**591 files changed, 61,743 insertions(+), 10,300 deletions(-)**

Dies ist keine inkrementelle Änderung, sondern reflektiert zwei komplett getrennte Commit-Bäume.

### Hauptunterschiede (strukturell)

| Bereich | master (aktuell) | main (alt) |
|---------|-----------------|------------|
| **evidence/** | Umfangreiche Evidence-Ordner mit Green-Baseline, Comment-Sync, DeepSeek-Integration | Keine/frühe Evidence |
| **scripts/** | Produktiv-Scripts (validate-secret-hygiene.mjs, dispatcher-health-check.mjs, etc.) | Veraltete Shell-Scripts (start_blueprint_bootstrap.sh, speckit_iteration.sh) |
| **docs/** | Aktuelle Dokumentation (OPERATIONS_RUNBOOK.md, proxmox-docker-runbook.md) | Veraltete docs (architecture.md, troubleshooting.md) |
| **workflows/** | Keine veralteten Workflow-Exports | Alte Workflow-Exporte (blueprint-old-broken.export.json etc.) |
| **.github/ISSUE_TEMPLATE/** | Nicht vorhanden | Veraltete Templates |
| **templates/** | Nicht vorhanden | Veraltete Templates |
| **tests/** | Nicht vorhanden | Veraltete Tests |
| **STATUS.md** | Aktuell (COMMENT_SYNC_24H_OBSERVATION_GREEN) | Veraltet |
| **CHANGELOG.md** | Aktualisiert | Veraltet |
| **README.md** | Aktualisiert | Veraltet |
| **GREEN_BASELINE.md** | Vorhanden | Nicht vorhanden |
| **OPERATIONS_RUNBOOK.md** | Vorhanden | Nicht vorhanden |

## Bewertung

### main — STALE / Veraltet
- `origin/main` enthält den ursprünglichen Bootstrapping-Verlauf (Initial Commit → Dispatcher Build)
- Keine aktuellen Operations-Dokumente
- Keine Green-Baseline
- Keine Comment-Sync-Dokumentation
- Keine DeepSeek-Integration-Dokumentation
- Letzter Commit: 27.06.2026 (2 Tage alt)
- Keine relevanten laufenden Änderungen

### master — EINDEUTIG Source of Truth
- `master` enthält den aktuellen, laufenden Betriebsstand
- Alle aktuellen Operations-Dokumente (GREEN_BASELINE.md, OPERATIONS_RUNBOOK.md)
- Comment-Sync-Observation (24h)
- Alle aktuellen Evidence-Ordner
- Aktuelle Scripts (validate-secret-hygiene.mjs, dispatcher-health-check.mjs)
- Letzter Commit: 29.06.2026 (~2 Stunden alt)
- Workflow-Backups und Green-Snapshots
- Aktuelles STATUS.md mit `COMMENT_SYNC_24H_OBSERVATION_GREEN`

### Klassifikation
**RED_BRANCH_CONFLICT** — unrelated histories, kein einfacher Merge möglich.
