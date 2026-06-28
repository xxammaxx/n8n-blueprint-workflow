# OpenCode Local Readiness
## Phase 6 — Runner nicht-destruktive Checks

### Runner Umgebung

| Komponente | Version/Status |
|-----------|---------------|
| OpenCode Binary | 1.17.9 (`/opt/dev-fabric/opencode/opencode`) |
| Node.js | v22.23.0 |
| Git | 2.39.5 |
| Bash | 5.2.15 |
| OS | Debian (LXC Container) |
| Architektur | amd64 |
| RAM | 2048 MB |
| CPU Cores | 2 |
| Disk | 32 GB |

### Verzeichnisstruktur `/opt/dev-fabric/`

```
/opt/dev-fabric/
├── agent-adapters/   (root:root)
├── bin/              (runner:runner) — loader + smoke scripts
├── evidence/         (runner:runner)
├── logs/             (runner:runner)
├── opencode/         (runner:runner) — OpenCode binary
├── scripts/          (runner:runner)
├── secrets/          (runner:runner) — opencode-provider.env
├── workflows/        (runner:runner)
└── workspaces/       (runner:runner)
```

### Checks

| Check | Ergebnis |
|-------|----------|
| OpenCode Binary vorhanden | ja |
| OpenCode Version | 1.17.9 |
| Node.js Runtime | v22.23.0 |
| Git verfügbar | ja |
| Bash verfügbar | ja |
| Keine externen Provider-Calls | ja (eingehalten) |
| Loader Script vorhanden | ja |
| Smoke Script vorhanden | ja |

### Bewertung
**READY** — Runner ist technisch bereit. Fehlende echte Credentials blockieren den Provider-Test.
