# n8n UI Smoke via Playwright (Isolated Session)

## Test Setup
- **Playwright Core:** freshly installed in temp directory
- **Browser:** Chromium 1223 (existing cache), headless
- **Session:** isolated (new context, no persistent storage)

## Results
- **UI Reachable:** yes (HTTP 200, page loaded)
- **Page Title:** "n8n.io - Workflow Automation"
- **Login Required:** yes (login/email/password text detected in rendered body)
- **Dashboard Visible:** no (login page shown, expected for unauthenticated session)

## Security
- **Credentials entered:** no
- **Cookies extracted:** no
- **Old sessions used:** no (fresh temp directory, fresh npm install)
- **Workflow changes:** none
- **Secrets in output:** none

## Status
- **N8N_UI_REACHABLE**
- **N8N_UI_LOGIN_REQUIRED**
- **No screenshots captured** (no need — text-only smoke confirmed)
