# Blueprint Bootstrap Import

1. Open n8n: `http://192.168.1.52:5678`
2. Confirm Owner/Login is complete.
3. Import the workflow if it is not already present.
4. Use this file:
   - `/opt/dev-fabric/workflows/blueprint-speckit-opencode-bootstrap.json`
5. Create the SSH credential:
   - Name: `dev-runner-ssh`
   - Type: `SSH Private Key`
   - Host: `192.168.1.53`
   - Port: `22`
   - Username: `runner`
   - Private key: the existing Runner key from `/opt/dev-fabric/.ssh/devrunner_ed25519`
6. Connect the three SSH nodes in the workflow to `dev-runner-ssh`.
7. Open the workflow and start the form.
8. The form title must be `Bitte Blueprint eingeben`.
9. Provide the blueprint by one of these paths:
   - Upload `BLUEPRINT.md`
   - Or paste the blueprint into the textarea
10. The safe default mode is `manual-terminal`.
11. Read the result output.
12. Watch the live log:
   - `tail -f /opt/dev-fabric/evidence/blueprint-bootstrap/<project_slug>/<run_id>/agent.log`
13. If OpenCode or Hermes is missing, attach manually in the Runner terminal:
   - `ssh runner@192.168.1.53`
   - `tmux attach -t <session_name>`
14. Stop or clean up with:
   - `tmux kill-session -t <session_name>`

## Expected Flow

- The workflow writes `RUN_INPUT.json` on the Runner.
- The Runner creates the project directory.
- The Runner writes `BLUEPRINT.md` and `INITIALISIERUNG_PROMPT_BLUEPRINT.md`.
- SpecKit initializes from `/opt/dev-fabric/workspaces/spec-kit-src`.
- OpenCode or Hermes only start when the selected mode and toolchain allow it.
- Otherwise the workflow stays in `manual-terminal` mode.

## Safety Rules

- Do not store secrets in the workflow JSON.
- Do not expose public webhooks.
- No push, PR, merge, or deployment without human approval.
