# n8n Blueprint Workflow — Source of Truth

GitHub source of truth for the n8n Blueprint → SpecKit/OpenCode Bootstrap workflow.

## Repo Structure

```
.
├── README.md              ← This file
├── STATUS.md              ← Current operational status
├── CHANGELOG.md           ← Version history
├── SECURITY.md            ← Security rules and boundaries
├── .gitignore             ← Strict exclusions
├── workflows/             ← n8n workflow JSON exports
│   ├── README.md
│   ├── debug-minimal-form-ui.export.json       ← Working reference form
│   ├── blueprint-old-broken.export.json        ← Broken V1 (historical)
│   ├── blueprint-v2.clean.export.json          ← Reconstructed V2
│   └── speckit-smoke-workflow.json             ← Smoke-test workflow
├── scripts/               ← Runner shell scripts
│   ├── start_blueprint_bootstrap.sh
│   ├── speckit_iteration.sh
│   ├── export_n8n_workflows.sh
│   ├── publish_check.sh
│   └── validate_repo.sh
├── docs/                  ← Documentation
│   ├── import-publish-guide.md
│   ├── ui-reconstruction-runbook.md
│   ├── troubleshooting.md
│   ├── architecture.md
│   ├── security-boundaries.md
│   └── evidence-index.md
├── templates/             ← Prompt templates
│   └── INITIALISIERUNG_PROMPT_BLUEPRINT.md
├── evidence-index/        ← Evidence trail
│   ├── latest.md
│   └── known-evidence-paths.md
└── tests/                 ← Validation scripts
    ├── validate-json.sh
    ├── validate-shell.sh
    └── smoke-checks.sh
```

## Infrastructure

- **n8n Instance:** `http://192.168.1.52:5678` (LXC container 101 on Proxmox 192.168.1.136)
- **Runner:** LXC container 102 on Proxmox 192.168.1.136
- **Form Path (V2):** `/form/blueprint-speckit-bootstrap-v2`
- **Form Path (debug):** `/form/debug-minimal-form-ui`

## Quick Start

See `docs/import-publish-guide.md` for importing workflows into n8n.

## Status

See `STATUS.md` for current operational status.
