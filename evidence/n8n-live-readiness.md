# n8n Live Readiness

## Reachability Evidence

- Candidate n8n editor base URL discovered from local helper and prior evidence:
  - `http://192.168.1.52:5678`
- `GET /healthz`
  - Exit/result: HTTP `200`
  - Body: `{"status":"ok"}`
- `GET /`
  - Exit/result: HTTP `200`
  - Body indicates n8n editor frontend is served
- `GET /rest/settings`
  - Exit/result: HTTP `200`
  - Relevant public settings excerpt:
    - `settingsMode=public`
    - `authenticationMethod=email`
    - `previewMode=false`

## Workflow / Credential Inspection Attempts

### REST API without authenticated session

- `GET /rest/workflows`
  - HTTP `401`
  - Result: workflow list not readable without auth
- `GET /rest/credentials`
  - HTTP `401`
  - Result: credential list not readable without auth
- `GET /rest/login`
  - HTTP `401`
  - Result: login REST endpoint is not usable for anonymous inspection

### Stored Playwright session metadata

- Local Playwright storage-state file exists:
  - `C:\Users\xxammaxx\.n8n-automation\playwright\n8n-storage-state.json`
- Non-sensitive metadata found:
  - origin `http://192.168.1.52:5678`
  - cookie name `n8n-auth`
  - localStorage key `n8n-recent-workflows`
  - recent workflow ids:
    - `jb7BgKeWGee5Iq9d`
    - `h78eENwLGwr2QUmU`
- Raw REST requests using the stored cookie still returned `401 Unauthorized`

### Browser helper state

- Local helper process found:
  - `C:\Users\xxammaxx\pw-n8n-login-server.js`
- Helper reported last page:
  - `http://192.168.1.52:5678/form/debug-minimal-form-ui`
- Helper navigation attempt to `/home/workflows` failed locally with:
  - `page.goto: Target page, context or browser has been closed`

### Headless UI reuse attempt

- Attempt to validate the saved Playwright session headless failed locally because the required Playwright browser binary is missing.
- Result:
  - no fresh authenticated UI inspection was possible in this run

## Webhook Candidate

- Workflow file proves the webhook path:
  - `/spec-kit-opencode-proxmox-runner` as workflow id/path metadata
- n8n production webhook candidate if the workflow is imported and active:
  - `http://192.168.1.52:5678/webhook/spec-kit-opencode-proxmox-runner`
- n8n test webhook candidate if the workflow is open in test mode:
  - `http://192.168.1.52:5678/webhook-test/spec-kit-opencode-proxmox-runner`
- Anonymous `GET` checks to both candidate webhook routes returned HTTP `404`
- Interpretation:
  - this does not prove absence for a POST-only webhook, but it also does not confirm the workflow is imported and active/test-ready

## Readiness Decision

- Workflow imported: `unknown`
- Workflow active or test-ready: `unknown`
- Credential `Proxmox Docker Host SSH` present: `unknown`
- Concrete confirmed webhook URL: `no`
- Local reachability of the base n8n service: `yes`

## Stop Reason

The live dry-hop was not executed because the required preconditions could not be proven:

- no authenticated evidence that the workflow is actually imported
- no authenticated evidence that the credential `Proxmox Docker Host SSH` exists
- no confirmed webhook URL that is known to be bound to the imported workflow

## Manual To-Do

1. Open the n8n UI at `http://192.168.1.52:5678`.
2. Confirm that workflow `Spec Kit OpenCode Proxmox Runner Orchestrator` is imported.
3. Confirm that credential `Proxmox Docker Host SSH` exists and is assigned to the SSH nodes.
4. Either activate the workflow for production webhook use or open it in test mode.
5. Record the exact webhook URL shown by n8n.
6. Re-run the live dry-hop with that confirmed webhook URL.
