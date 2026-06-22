# Evidence Index

## Known Evidence Paths (on Runner)

### Container 101 (n8n)
```
/opt/dev-fabric/evidence/n8n-blueprint-workflow/
├── republish-rematerialize-20260621T180626Z/   ← Last session
├── restart-recheck-20260621T174925Z/
├── restart-recheck-20260621T174952Z/
├── restart-recheck-20260621T175147Z/
├── restart-recheck-20260621T175439Z/
└── restart-recheck-20260621T175753Z/
```

### Container 102 (Runner)
```
/opt/dev-fabric/evidence/blueprint-bootstrap/
├── blueprint-smoke-demo/
│   └── run-20260620T122612Z-smoke/
├── blueprint-smoke-ui-demo/
│   └── run-20260620T1345Z-smoke/
└── blueprint-smoke-ui-demo-textarea/
```

### Backups
```
/opt/dev-fabric/n8n/backups/
├── republish-rematerialize-20260621T180701Z/
├── restart-recheck-20260621T174952Z/
├── restart-recheck-20260621T175147Z/
├── restart-recheck-20260621T175439Z/
└── restart-recheck-20260621T175753Z/
```

## Evidence Per Run

Each run produces:
- `RUN_INPUT.redacted.json` — Input without secrets
- `commands.log` — All commands executed
- `agent.log` — Agent execution log
- `preflight.md` — Pre-run validation
- `run-report.md` — Run summary
- `operator-commands.md` — Manual fallback commands
- `status.json` — Exit status
- `specify-init.log` / `specify-check.log` — Speckit logs

## Latest Session

See `evidence-index/latest.md` for the current session report.
