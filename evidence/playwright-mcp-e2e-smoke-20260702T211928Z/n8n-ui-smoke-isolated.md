# n8n UI Smoke — Isolated Playwright Session

## Date/Time (UTC)
2026-07-02T21:20:XX

## Method
- **Approach:** Playwright CLI Fallback (PLAYWRIGHT_CLI_FALLBACK_USED)
- **Browser:** Chromium (system Google Chrome, headless)
- **Session:** Fresh newContext(), isolated — no saved profile, no cookies
- **Alte Session verwendet:** NEIN
- **Cookies extrahiert:** NEIN
- **Credentials eingegeben:** NEIN
- **Screenshot gespeichert:** NEIN

## Results
```json
{
  "ok": true,
  "title": "n8n.io - Workflow Automation",
  "url": "http://192.168.1.52:5678/",
  "hasLoginText": true,
  "hasDashboardText": false,
  "hasWorkflowText": false,
  "bodyLength": 49,
  "bodyPreview": "Sign in\nEmail\nPassword\nSign in\nForgot my password",
  "loadTimeMs": 1426
}
```

## Interpretation
- **UI erreichbar:** JA ✅
- **Login-Seite sichtbar:** JA
- **Dashboard sichtbar:** NEIN (Login-Gate)
- **Status:** N8N_UI_LOGIN_REQUIRED

## Security
- Keine Secrets im Body-Text (nur Login-Formular-Text)
- Keine API-Keys, Tokens oder Cookies gelesen
- Kein Screenshot gespeichert (Login-Seite ohne sensitive Daten)
